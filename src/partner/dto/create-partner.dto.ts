import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({ example: 'PT Praja Edukasi', description: 'Nama mitra industri' })
  @IsNotEmpty({ message: 'Nama mitra industri nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Perusahaan yang bergerak di bidang software house...', description: 'Deskripsi mitra' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/partner/logo.webp', description: 'URL logo mitra industri (dari MinIO)' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ 
    example: ['Magang/PKL', 'Guru Tamu', 'Perekrutan Lulusan'], 
    description: 'Jenis kerja sama (Array of strings)' 
  })
  @IsOptional()
  @IsArray({ message: 'Format jenis kerja sama harus berupa array bro!' })
  @IsString({ each: true, message: 'Tiap item jenis kerja sama harus teks (string)!' })
  cooperationType!: string[];

  @ApiPropertyOptional({ example: 'https://prajaedukasi.com', description: 'Website resmi mitra' })
  @IsOptional()
  @IsUrl({}, { message: 'Format URL website harus valid bro!' })
  website?: string;
}