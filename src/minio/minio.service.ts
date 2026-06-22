import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import * as crypto from 'crypto'; 
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
  async uploadFile(file: Express.Multer.File, folderName: string ): Promise<string> {
    try {
      // 1. Ambil ekstensi file aslinya (misal: .jpg, .png)
      const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      
      // 2. Rombak nama file jadi super unik: UUID + Timestamp
      // Hasilnya bakal kayak gini: 9b1deb4d-3b7d-4bad-9bdd-1718956321.jpg
      const uniqueFileName = `${folderName}/${crypto.randomUUID()}-${Date.now()}${extension}`;
      
      // 3. Eksekusi upload ke dalam bucket MinIO
      await this.minioClient.putObject(
        this.bucketName,
        uniqueFileName,
        file.buffer, // Ini isi mentahan fotonya
        file.size,
        { 'Content-Type': file.mimetype } // Ngasih tau MinIO ini tuh file gambar
      );

      // 4. Rangkai URL Public-nya biar bisa disimpen ke Postgres
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';

      const portString = (process.env.MINIO_PORT === '443' || process.env.MINIO_PORT === '80') 
        ? '' 
        : `:${process.env.MINIO_PORT}`;

      const fileUrl = `${protocol}://${process.env.MINIO_ENDPOINT}${portString}/${this.bucketName}/${uniqueFileName}`;
      
      return fileUrl;
      
    } catch (error) {
      console.error('MinIO Upload Error:', error);
      throw new InternalServerErrorException('Gagal upload gambar ke server MinIO bro!');
    }
  }
}