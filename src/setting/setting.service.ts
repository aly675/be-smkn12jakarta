import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // LOGIKA UPSERT PENGATURAN
  // ==========================================
  async upsert(dto: CreateSettingDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'pengaturan website');

    const result = await this.prisma.siteSettings.upsert({
      where: { key: dto.key },
      update: { value: dto.value },
      create: {
        key: dto.key,
        value: dto.value,
        createdById: createdById,
      },
    });

    return {
      message: `Mantap bro, pengaturan ${dto.key} berhasil di-update!`,
      data: result,
    };
  }

  // ==========================================
  // FIND ALL (Public)
  // ==========================================
  async findAll() {
    const data = await this.prisma.siteSettings.findMany({
      orderBy: { key: 'asc' },
    });

    return {
      message: 'Berhasil mengambil semua pengaturan website bro!',
      data,
    };
  }
}