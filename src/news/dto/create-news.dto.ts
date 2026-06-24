import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ example: 'SMKN 12 Juara LKS!' })
  @IsNotEmpty( { message: 'Judul berita ga boleh kosong bro!' } )
  @IsString()
  title!: string; 

  @ApiProperty({ example: 'Isi berita selengkapnya...' })
  @IsNotEmpty( { message: 'Isi berita ga boleh kosong bro!' } )
  @IsString()
  content!: string; 
  
  @ApiPropertyOptional({ example: 'Siswa SMKN 12 menang LKS tingkat kota.' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'Prestasi' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['Lomba', 'IT', 'Juara'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://s3.smkn12jakarta.sch.id/portal-smkn12/news/gambar.jpg' })
  @IsOptional()
  @IsString()
  image?: string; 
}