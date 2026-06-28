import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Bapak Budi Santoso, S.Pd.', description: 'Nama lengkap guru' })
  @IsNotEmpty({ message: 'Nama guru nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '198001012008011001', description: 'Nomor Induk Pegawai (Wajib)' })
  @IsNotEmpty({ message: 'NIP wajib diisi bro, biar datanya valid!' })
  @IsString()
  nip!: string;

  @ApiPropertyOptional({ example: 'Guru Madya', description: 'Jabatan fungsional/struktural' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Matematika', description: 'Mata pelajaran yang diampu' })
  @IsNotEmpty({ message: 'Mata pelajaran wajib diisi bro!' })
  @IsString()
  subject!: string;

  @ApiPropertyOptional({ example: 'S1 Pendidikan Matematika', description: 'Latar belakang pendidikan' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ example: 'budi.santoso@smkn12jkt.sch.id', description: 'Email aktif guru' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email harus bener bro!' }) // Tambahan validasi format email
  email?: string;

  @ApiPropertyOptional({ 
    example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/teacher/budi.webp',
    description: 'URL foto profil guru'
  })
  @IsOptional()
  @IsString()
  photo?: string;
}