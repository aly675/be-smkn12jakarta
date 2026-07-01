import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrincipalDto } from './dto/create-principal.dto';
import { UpdatePrincipalDto } from './dto/update-principal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class PrincipalService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE DATA KEPALA SEKOLAH BARU
  // ==========================================
  async create(dto: CreatePrincipalDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data kepala sekolah');

    const principalBaru = await this.prisma.kepalaSekolah.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        photo: dto.photo,
        greeting: dto.greeting,
        motto: dto.motto,
        createdById: createdById,
      },
    });

    return { 
      message: 'Mantap bro, data Kepala Sekolah baru berhasil ditambahkan!', 
      data: principalBaru 
    };
  }

  // ==========================================
  // MENCARI KEPALA SEKOLAH YANG AKTIF SAAT INI (TAMPIL DI FE)
  // ==========================================
  async findActive() {
    // Ngambil 1 data urutan paling atas berdasarkan tanggal pembuatan terbaru
    const activePrincipal = await this.prisma.kepalaSekolah.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!activePrincipal) {
      throw new NotFoundException('Belum ada data Kepala Sekolah sama sekali bro di database!');
    }

    return {
      message: 'Berhasil mengambil data Kepala Sekolah yang menjabat saat ini!',
      data: activePrincipal,
    };
  }

 // ==========================================
  // FIND ALL (Buat Admin ngeliat sejarah Kepsek + Pagination)
  // ==========================================
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.kepalaSekolah.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.kepalaSekolah.count(),
    ]);

    return {
      message: 'Berhasil mengambil riwayat semua Kepala Sekolah bro!',
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
  // FIND ONE (Detail spesifik Kepsek masa lalu/sekarang)
  // ==========================================
  async findOne(id: string) {
    const principal = await this.prisma.kepalaSekolah.findUnique({ 
      where: { id } 
    });

    if (!principal) throw new NotFoundException(`Data dengan ID ${id} nggak ketemu bro!`);

    return { message: 'Berhasil mengambil detail Kepala Sekolah!', data: principal };
  }

  // ==========================================
  // UPDATE DATA KEPALA SEKOLAH
  // ==========================================
  async update(id: string, dto: UpdatePrincipalDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'mengedit data kepala sekolah');

    const existing = await this.prisma.kepalaSekolah.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Data dengan ID ${id} nggak ketemu bro!`);

    const updated = await this.prisma.kepalaSekolah.update({
      where: { id },
      data: {
        name: dto.name,
        nip: dto.nip,
        photo: dto.photo,
        greeting: dto.greeting,
        motto: dto.motto,
      },
    });

    return { 
      message: 'Mantap bro, data Kepala Sekolah berhasil diperbarui!', 
      data: updated 
    };
  }

  // ==========================================
  // DELETE DATA KEPALA SEKOLAH (Hanya kalau ada salah input)
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data kepala sekolah');

    const existing = await this.prisma.kepalaSekolah.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Data dengan ID ${id} udah nggak ada bro!`);

    await this.prisma.kepalaSekolah.delete({ where: { id } });

    return { message: 'Data Kepala Sekolah berhasil dihapus bro!' };
  }
}