import { IsString, IsNotEmpty, IsUrl, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const platformOptions = ['Facebook', 'Instagram', 'Youtube', 'Twitter', 'LinkedIn', 'TikTok', 'Website'];

export class CreateSocialMediaDto {
  @ApiProperty({ enum: platformOptions, description: 'Nama platform sosial media' })
  @IsNotEmpty({ message: 'Platform wajib diisi bro!' })
  @IsString()
  @IsIn(platformOptions, { message: `Platform harus salah satu dari: ${platformOptions.join(', ')}` })
  platform!: string;

  @ApiProperty({ example: 'https://instagram.com/smkn12_jkt', description: 'URL sosial media' })
  @IsNotEmpty({ message: 'URL wajib diisi bro!' })
  @IsUrl({}, { message: 'Format URL harus valid bro (contoh: https://...)!' })
  url!: string;

  @ApiPropertyOptional({ example: 'Instagram', description: 'Icon (Opsional, FE bisa mapping sendiri)' })
  @IsOptional()
  @IsString()
  icon?: string;
}