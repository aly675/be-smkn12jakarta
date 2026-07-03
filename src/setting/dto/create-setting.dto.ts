import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Daftar key yang valid sesuai seeder dan FE
const validSettingsKeys = [
  'site_name', 'site_tagline', 'visi', 'misi', 'alamat', 'telepon', 'email'
];

export class CreateSettingDto {
  @ApiProperty({ enum: validSettingsKeys, description: 'Kunci pengaturan website' })
  @IsNotEmpty({ message: 'Key wajib diisi bro!' })
  @IsString()
  @IsIn(validSettingsKeys, { message: `Key harus salah satu dari: ${validSettingsKeys.join(', ')}` })
  key!: string;

  @ApiProperty({ 
    example: 'Menyelenggarakan pendidikan berkualitas berbasis teknologi;Mengembangkan kompetensi...', 
    description: 'Isi pengaturan (Untuk Misi, pisahkan dengan titik koma ;)' 
  })
  @IsNotEmpty({ message: 'Value / isi pengaturan nggak boleh kosong bro!' })
  @IsString()
  value!: string;
}