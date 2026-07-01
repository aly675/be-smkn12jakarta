import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortalDto {
  @ApiProperty({ example: 'Aspirasi SMKN 12 Jakarta', description: 'Nama layanan/portal' })
  @IsNotEmpty({ message: 'Nama layanan nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Sistem Informasi Aspirasi SMKN 12 Jakarta', description: 'Deskripsi singkat layanan' })
  @IsNotEmpty({ message: 'Deskripsi wajib diisi bro!' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'https://aspirasi.smkn12jakarta.sch.id', description: 'URL/Link layanan' })
  @IsNotEmpty({ message: 'URL wajib diisi bro!' })
  @IsUrl({}, { message: 'Format URL harus valid bro (contoh: https://...)!' })
  url!: string;

  @ApiProperty({ example: 'Akademik', description: 'Kategori layanan (contoh: Akademik, administrasi, atau lainnya)' })
  @IsNotEmpty({ message: 'Kategori wajib diisi bro!' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: 'BookOpen', description: 'Nama icon dari Lucide Icons (Cukup nama string-nya aja)' })
  @IsOptional()
  @IsString()
  icon?: string;
}