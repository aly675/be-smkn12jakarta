import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import * as crypto from 'crypto'; 
import sharp from 'sharp';
import 'multer'

@Injectable()
export class MinioService {
  private minioClient: Client;
  private bucketName = process.env.MINIO_BUCKET_NAME || 'portal-smkn12';

  constructor() {
    // Mesin penyambung NestJS ke MinIO pakai data dari .env
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: parseInt(process.env.MINIO_PORT as string, 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });
  }

  // Fungsi sakti buat nerima dan nge-upload file
 async uploadFile(file: Express.Multer.File, folderName: string): Promise<string> {
    try {
      // 2. PROSES KOMPRESI: Ubah gambar ke WebP & set kualitas ke 80%
      // Kualitas 80% itu golden ratio: Gambar tetep tajam, tapi size turun drastis!
      const compressedBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      // 3. Karena formatnya udah pasti diubah ke WebP, ekstensinya kita paksa .webp
      const uniqueFileName = `${folderName}/${crypto.randomUUID()}-${Date.now()}.webp`;
      
      // 4. Kirim buffer yang udah dikompres ke MinIO
      await this.minioClient.putObject(
        this.bucketName,
        uniqueFileName,
        compressedBuffer, 
        compressedBuffer.length, 
        { 'Content-Type': 'image/webp' } 
      );

      // 5. Rangkai URL Public versi cantik (tanpa port 443)
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      const portString = (process.env.MINIO_PORT === '443' || process.env.MINIO_PORT === '80') 
        ? '' 
        : `:${process.env.MINIO_PORT}`;
        
      const fileUrl = `${protocol}://${process.env.MINIO_ENDPOINT}${portString}/${this.bucketName}/${uniqueFileName}`;
      
      return fileUrl;
      
    } catch (error) {
      console.error('MinIO Upload Error:', error);
      throw new InternalServerErrorException('Gagal memproses dan upload gambar bro!');
    }
  }
}