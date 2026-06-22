import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter bro!' })
  name!: string;

  @ApiProperty({ example: 'budisantoso' })
  @IsString()
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(50, { message: 'Username kepanjangan, maksimal 50 karakter!' })
  username!: string;

  @ApiPropertyOptional({ example: 'budi@smkn12jakarta.sch.id' })
  @IsOptional()
  @IsEmail({}, { message: 'Format emailnya salah bro, harus pakai @!' })
  email?: string;

  @ApiProperty({ example: 'rahasia123' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @ApiPropertyOptional({ enum: Role, example: Role.SISWA })
  @IsOptional()
  @IsEnum(Role, { message: 'Role yang lu masukin gaib bro, nggak ada di daftar!' })
  role?: Role;
}