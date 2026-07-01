import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrincipalDto {
  @ApiProperty({ example: 'Nunung Widiyaningsih', description: 'Nama Kepala Sekolah' })
  @IsNotEmpty({ message: 'Nama Kepala Sekolah nggak boleh kosong bro!' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '19700101 199802 2 001', description: 'Nomor Induk Pegawai' })
  @IsNotEmpty({ message: 'NIP wajib diisi bro!' })
  @IsString()
  nip!: string;

  @ApiProperty({ example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/principal/nunung.webp', description: 'URL foto Kepala Sekolah' })
  @IsNotEmpty({ message: 'Foto wajib diisi bro! Upload dulu fotonya, baru masukin URL-nya ke sini.' })
  @IsString()
  photo!: string;

  @ApiProperty({ 
    example: 'Selamat datang di website resmi SMKN 12 Jakarta. Kami berkomitmen mencetak lulusan yang kompeten dan berkarakter.', 
    description: 'Kata sambutan di halaman utama' 
  })
  @IsNotEmpty({ message: 'Kata sambutan wajib diisi bro!' })
  @IsString()
  greeting!: string;

  @ApiPropertyOptional({ example: 'Unggul, Disiplin, dan Berwawasan Lingkungan', description: 'Motto (Opsional)' })
  @IsOptional()
  @IsString()
  motto?: string;
}