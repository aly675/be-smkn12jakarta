import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsArray, IsDateString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PengumumanType, PengumumanTarget } from '@prisma/client';
import { Type } from 'class-transformer';

// 1. Bikin sub-class khusus buat nge-validasi format JSON files
class FileAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;
}

// 2. DTO Utama
export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Pengumuman Libur Semester' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Diinformasikan kepada seluruh siswa...' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  important?: boolean;

  @ApiPropertyOptional({ enum: PengumumanType, example: PengumumanType.teks })
  @IsOptional()
  @IsEnum(PengumumanType)
  type?: PengumumanType;

  @ApiPropertyOptional({ example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/announcements/adeac16a-0e77-4313-8113-3f4f6ab07441-1782383514137.docx' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  // Validasi khusus array of object (JSON)
  @ApiPropertyOptional({ type: [FileAnnouncementDto], example: [{ name: 'adeac16a-0e77-4313-8113-3f4f6ab07441-1782383514137.docx', url: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/announcements/' }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileAnnouncementDto)
  files?: FileAnnouncementDto[];

  @ApiPropertyOptional({ enum: PengumumanTarget, example: PengumumanTarget.semua })
  @IsOptional()
  @IsEnum(PengumumanTarget)
  target?: PengumumanTarget;

  @ApiPropertyOptional({ example: ['RPL', 'AK', 'BR', 'MP'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDetails?: string[];

  @ApiPropertyOptional({ example: '2026-06-25T00:00:00Z' })
  @IsOptional()
  @IsDateString() 
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}