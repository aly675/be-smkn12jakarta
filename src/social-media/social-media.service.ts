import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class SocialMediaService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // LOGIKA UPSERT (Otomatis Create / Update)
  // ==========================================
  async upsert(dto: CreateSocialMediaDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data sosial media');

    const result = await this.prisma.socialMedia.upsert({
      where: { platform: dto.platform }, 
      update: {
        url: dto.url,
        icon: dto.icon,
      }, 
      create: {
        platform: dto.platform,
        url: dto.url,
        icon: dto.icon,
        createdById: createdById,
      },
    });

    return {
      message: `Mantap bro, data ${dto.platform} berhasil disimpan!`,
      data: result,
    };
  }

  // ==========================================
  // FIND ALL (Public)
  // ==========================================
  async findAll() {
    const data = await this.prisma.socialMedia.findMany({
      orderBy: { platform: 'asc' }, 
    });

    return {
      message: 'Berhasil mengambil daftar sosial media bro!',
      data,
    };
  }

  // ==========================================
  // DELETE (Opsional, kalau Admin mau matiin sosmed tertentu)
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data sosial media');

    const existing = await this.prisma.socialMedia.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Data dengan ID ${id} udah nggak ada bro!`);

    await this.prisma.socialMedia.delete({ where: { id } });
    return { message: 'Data sosial media berhasil dihapus!' };
  }
}