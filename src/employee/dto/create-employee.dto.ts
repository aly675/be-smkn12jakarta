import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Bapak Budi Santoso', description: 'Nama lengkap pegawai' })
  @IsNotEmpty({ message: 'Nama pegawai nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '198502022010011002', description: 'Nomor Induk Pegawai (Wajib & Unik)' })
  @IsNotEmpty({ message: 'NIP wajib diisi bro, biar datanya nggak tertukar!' })
  @IsString()
  nip!: string;

  @ApiProperty({ example: 'Kepala Tata Usaha', description: 'Jabatan pegawai' })
  @IsNotEmpty({ message: 'Jabatan wajib diisi bro!' })
  @IsString()
  position!: string;

  @ApiPropertyOptional({ example: 'Administrasi', description: 'Divisi/Bagian kerja' })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Nomor kontak/WA pegawai' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ 
    example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/employee/budi.webp',
    description: 'URL foto profil pegawai'
  })
  @IsOptional()
  @IsString()
  photo?: string;
}