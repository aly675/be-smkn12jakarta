import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class PartnerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartnerDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data mitra industri');

    const mitraBaru = await this.prisma.mitraIndustri.create({
      data: {
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        cooperationType: dto.cooperationType || [],
        website: dto.website,
        createdById: createdById,
      },
    });

    return { 
      message: 'Mantap bro, mitra industri berhasil ditambahkan!', 
      data: mitraBaru 
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cooperationType: { hasSome: [search] } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.mitraIndustri.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mitraIndustri.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar mitra industri bro!',
      data,
      meta: {
        totalData: total,
        currentPage: page,
        dataPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const mitra = await this.prisma.mitraIndustri.findUnique({ where: { id } });
    if (!mitra) throw new NotFoundException(`Waduh, mitra dengan ID ${id} nggak ketemu bro!`);
    return { 
      message: 'Berhasil mengambil detail mitra industri!', 
      data: mitra 
    };
  }

  async update(id: string, dto: UpdatePartnerDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data mitra industri');

    await this.findOne(id);

    const updated = await this.prisma.mitraIndustri.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        cooperationType: dto.cooperationType,
        website: dto.website,
      },
    });

    return { 
      message: 'Mantap bro, data mitra industri berhasil diperbarui!', 
      data: updated 
    };
  }

  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data mitra industri');

    await this.findOne(id);

    await this.prisma.mitraIndustri.delete({ where: { id } });
    return { message: 'Data mitra industri berhasil dihapus selamanya bro!' };
  }
}