import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({ example: 'Juara 1 LKS Web Technology', description: 'Judul prestasi' })
  @IsNotEmpty({ message: 'Judul prestasi nggak boleh kosong bro!' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Berhasil membuat sistem reservasi web dan manajemen API.', description: 'Deskripsi singkat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-06-30T00:00:00.000Z', description: 'Tanggal prestasi diraih (Format ISO/YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Tanggal wajib diisi bro!' })
  @IsDateString({}, { message: 'Format tanggal harus bener bro (contoh: 2026-06-30)!' })
  date!: string;

  @ApiProperty({ example: 'Tingkat Kota Jakarta Utara', description: 'Level perlombaan' })
  @IsNotEmpty({ message: 'Tingkat / level perlombaan wajib diisi!' })
  @IsString()
  level!: string;

  @ApiProperty({ example: 'Teknologi Informasi', description: 'Kategori prestasi' })
  @IsNotEmpty({ message: 'Kategori wajib diisi bro!' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: 'Billy Caesar Rajawali', description: 'Nama peserta / siswa pemenang' })
  @IsOptional()
  @IsString()
  participants?: string;

  @ApiPropertyOptional({ description: 'URL foto dokumentasi piala atau sertifikat' })
  @IsOptional()
  @IsString()
  image?: string;
}