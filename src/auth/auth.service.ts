import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(usernameOrEmail: string, pass: string) {
    // 1. Cari user di database berdasarkan username ATAU email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    // 2. Kalau user gak ketemu, langsung tolak!
    if (!user) {
      throw new UnauthorizedException('Username/Email atau Password salah bro!');
    }

    // 3. Cocokkan password asli dengan hash di database pakai bcrypt
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username/Email atau Password salah bro!');
    }

    // 4. Kalau lolos semua, kita bikin payload (isi data token)
    // Ingat: Jangan pernah masukin password ke dalam token!
    const payload = { sub: user.id, username: user.username, role: user.role };
    
    // 5. Kembalikan token dan sedikit info user buat di frontend
    return {
      message: 'Login sukses!',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      }
    };
  }
}