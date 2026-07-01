import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE DATA PRESTASI
  // ==========================================
  async create(dto: CreateAchievementDto, createdById: string, userRole: string) {

    AuthHelper.checkIsAdmin(userRole, 'data prestasi');

    const newAchievement = await this.prisma.prestasi.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date), 
        level: dto.level,
        category: dto.category,
        participants: dto.participants,
        image: dto.image,
        createdById: createdById,
      },
    });

    return { 
      message: 'Mantap bro, data prestasi berhasil ditambahkan!', 
      data: newAchievement 
    };
  }

  // ==========================================
  // FIND ALL PRESTASI (Public + Search + Pagination)
  // ==========================================
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { level: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { participants: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.prestasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.prestasi.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar prestasi bro!',
      data,
      meta: {
        totalData: total,
        currentPage: page,
        dataPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // FIND ONE PRESTASI (Public)
  // ==========================================
  async findOne(id: string) {
    const achievement = await this.prisma.prestasi.findUnique({ 
      where: { id } 
    });

    if (!achievement) {
      throw new NotFoundException(`Waduh, data prestasi dengan ID ${id} nggak ketemu bro!`);
    }

    return { 
      message: 'Berhasil mengambil detail prestasi bro!', 
      data: achievement 
    };
  }

  // ==========================================
  // UPDATE DATA PRESTASI
  // ==========================================
  async update(id: string, dto: UpdateAchievementDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data prestasi');

    const existingAchievement = await this.prisma.prestasi.findUnique({ 
      where: { id } 
    });
    
    if (!existingAchievement) {
      throw new NotFoundException(`Waduh, data prestasi dengan ID ${id} nggak ketemu bro!`);
    }

    const updatedAchievement = await this.prisma.prestasi.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        // Kalau tanggal diupdate, konversi lagi. Kalau nggak, abaikan.
        date: dto.date ? new Date(dto.date) : undefined,
        level: dto.level,
        category: dto.category,
        participants: dto.participants,
        image: dto.image,
      },
    });

    return { 
      message: 'Mantap bro, data prestasi berhasil diperbarui!', 
      data: updatedAchievement 
    };
  }

  // ==========================================
  // DELETE DATA PRESTASI
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data prestasi');

    const existingAchievement = await this.prisma.prestasi.findUnique({ 
      where: { id } 
    });
    
    if (!existingAchievement) {
      throw new NotFoundException(`Data prestasi dengan ID ${id} udah nggak ada bro!`);
    }

    await this.prisma.prestasi.delete({ 
      where: { id } 
    });

    return { message: 'Data prestasi berhasil dihapus selamanya bro!' };
  }
}