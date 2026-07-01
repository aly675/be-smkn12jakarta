import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortalDto } from './dto/create-portal.dto';
import { UpdatePortalDto } from './dto/update-portal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE LAYANAN/PORTAL
  // ==========================================
  async create(dto: CreatePortalDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data layanan');

    const layananBaru = await this.prisma.layanan.create({
      data: {
        name: dto.name,
        description: dto.description,
        url: dto.url,
        category: dto.category,
        icon: dto.icon,
        createdById: createdById,
      },
    });

    return { 
      message: 'Mantap bro, layanan berhasil ditambahkan!', 
      data: layananBaru 
    };
  }
  
 // ==========================================
  // FIND ALL LAYANAN (Public + Search + Pagination)
  // ==========================================
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.layanan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.layanan.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar layanan bro!',
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
  // FIND ONE LAYANAN
  // ==========================================
  async findOne(id: string) {
    const layanan = await this.prisma.layanan.findUnique({ 
      where: { id } 
    });

    if (!layanan) throw new NotFoundException(`Waduh, layanan dengan ID ${id} nggak ketemu bro!`);

    return { message: 'Berhasil mengambil detail layanan!', data: layanan };
  }

  // ==========================================
  // UPDATE LAYANAN
  // ==========================================
  async update(id: string, dto: UpdatePortalDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data layanan');

    // Pastikan data ada dulu
    await this.findOne(id);

    const updatedLayanan = await this.prisma.layanan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        url: dto.url,
        category: dto.category,
        icon: dto.icon,
      },
    });

    return { 
      message: 'Mantap bro, data layanan berhasil diperbarui!', 
      data: updatedLayanan 
    };
  }

  // ==========================================
  // DELETE LAYANAN
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data layanan');

    // Pastikan data ada dulu
    await this.findOne(id);

    await this.prisma.layanan.delete({ 
      where: { id } 
    });

    return { message: 'Data layanan berhasil dihapus selamanya bro!' };
  }
}