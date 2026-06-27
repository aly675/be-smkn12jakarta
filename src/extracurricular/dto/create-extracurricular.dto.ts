import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExtracurricularDto {
  @ApiProperty({ example: 'Pramuka', description: 'Nama Ekstrakurikuler' })
  @IsNotEmpty({ message: 'Nama ekskul nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ 
    example: 'Ekstrakurikuler wajib untuk melatih kedisiplinan, kemandirian, dan jiwa korsa siswa.',
    description: 'Deskripsi lengkap kegiatan ekskul'
  })
  @IsNotEmpty({ message: 'Deskripsi ekskul wajib diisi bro!' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Setiap Jumat, 13:00 - 15:30 WIB', description: 'Jadwal latihan/pertemuan' })
  @IsNotEmpty({ message: 'Jadwal latihan nggak boleh kosong bro!' })
  @IsString()
  schedule!: string;

  @ApiProperty({ example: 'Bapak Budi Santoso', description: 'Nama pelatih atau pembina' })
  @IsNotEmpty({ message: 'Nama pelatih/pembina wajib diisi bro!' })
  @IsString()
  coach!: string;

  @ApiPropertyOptional({ 
    example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/extracurricular/pramuka.webp',
    description: 'URL gambar logo/kegiatan ekskul'
  })
  @IsOptional()
  @IsString()
  image?: string;
}