import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class MajorService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE DATA JURUSAN
  // ==========================================
  async create(dto: CreateMajorDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data jurusan');

    // Cek biar gak ada slug bentrok
    const slugTaken = await this.prisma.jurusan.findUnique({
      where: { slug: dto.slug },
    });
    if (slugTaken) {
      throw new ConflictException(`Gagal bro, slug '${dto.slug}' sudah dipakai oleh jurusan ${slugTaken.name}!`);
    }

    const jurusanBaru = await this.prisma.jurusan.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        image: dto.image,
        suitableFor: dto.suitableFor,
        careerOpportunities: dto.careerOpportunities,
        subjects: dto.subjects,
        practiceImages: dto.practiceImages,
        createdById: createdById,
      },
    });

    return { message: 'Mantap bro, data jurusan berhasil ditambahkan!', data: jurusanBaru };
  }

  // ==========================================
  // FIND ALL JURUSAN (Public + Search + Pagination)
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
      this.prisma.jurusan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, 
      }),
      this.prisma.jurusan.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar jurusan bro!',
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
  // FIND ONE JURUSAN BY ID (Public)
  // ==========================================
  async findOne(id: string) {
    const jurusan = await this.prisma.jurusan.findUnique({ where: { id } });
    if (!jurusan) throw new NotFoundException(`Waduh, jurusan dengan ID ${id} nggak ketemu bro!`);
    return { message: 'Berhasil mengambil detail jurusan!', data: jurusan };
  }

  // ==========================================
  // FIND BY SLUG (Buat dipake Frontend di halaman detail)
  // ==========================================
  async findBySlug(slug: string) {
    const jurusan = await this.prisma.jurusan.findUnique({ where: { slug } });
    if (!jurusan) throw new NotFoundException(`Waduh, jurusan dengan slug '${slug}' nggak ketemu bro!`);
    return { message: 'Berhasil mengambil detail jurusan berdasarkan slug!', data: jurusan };
  }

  // ==========================================
  // UPDATE DATA JURUSAN
  // ==========================================
  async update(id: string, dto: UpdateMajorDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data jurusan');

    const existing = await this.prisma.jurusan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Waduh, jurusan dengan ID ${id} nggak ketemu bro!`);

    // Cek bentrok slug kalau slug-nya ikut diedit
    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.jurusan.findUnique({ where: { slug: dto.slug } });
      if (slugTaken) {
        throw new ConflictException(`Gagal bro, slug '${dto.slug}' sudah digunakan oleh jurusan lain!`);
      }
    }

    const updated = await this.prisma.jurusan.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        image: dto.image,
        suitableFor: dto.suitableFor,
        careerOpportunities: dto.careerOpportunities,
        subjects: dto.subjects,
        practiceImages: dto.practiceImages,
      },
    });

    return { message: 'Mantap bro, data jurusan berhasil diperbarui!', data: updated };
  }

  // ==========================================
  // DELETE DATA JURUSAN
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data jurusan');

    const existing = await this.prisma.jurusan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Data jurusan dengan ID ${id} udah nggak ada bro!`);

    await this.prisma.jurusan.delete({ where: { id } });
    return { message: 'Data jurusan berhasil dihapus selamanya bro!' };
  }
}