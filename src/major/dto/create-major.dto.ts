import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMajorDto {
  @ApiProperty({ example: 'Rekayasa Perangkat Lunak', description: 'Nama Jurusan' })
  @IsNotEmpty({ message: 'Nama jurusan nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'rekayasa-perangkat-lunak', description: 'Slug untuk URL detail jurusan' })
  @IsNotEmpty({ message: 'Slug wajib diisi bro buat keperluan URL!' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Jurusan yang mempelajari cara merancang dan membuat aplikasi...', description: 'Deskripsi jurusan' })
  @IsNotEmpty({ message: 'Deskripsi wajib diisi bro!' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'Code', description: 'Nama icon dari Lucide Icons (contoh: Code, Calculator, Briefcase, ShoppingBag)' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'https://minio.../image.webp', description: 'URL foto utama jurusan' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ 
    example: ['Suka problem solving', 'Betah di depan komputer', 'Teliti'], 
    description: 'Karakteristik siswa yang cocok (Array of strings)' 
  })
  @IsArray({ message: 'Harus berupa array bro!' })
  @IsString({ each: true, message: 'Tiap item di dalam array harus berupa teks (string)!' })
  suitableFor!: string[];

  @ApiProperty({ 
    example: ['Full-stack Developer', 'UI/UX Designer', 'System Analyst'], 
    description: 'Peluang karir (Array of strings)' 
  })
  @IsArray()
  @IsString({ each: true })
  careerOpportunities!: string[];

  @ApiProperty({ 
    example: ['Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek'], 
    description: 'Mata pelajaran kejuruan (Array of strings)' 
  })
  @IsArray()
  @IsString({ each: true })
  subjects!: string[];

  @ApiProperty({ 
    example: ['https://minio.../praktek1.webp', 'https://minio.../praktek2.webp'], 
    description: 'URL galeri foto praktek jurusan (Array of strings)' 
  })
  @IsArray()
  @IsString({ each: true })
  practiceImages!: string[];
}