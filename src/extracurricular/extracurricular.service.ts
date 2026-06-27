import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class ExtracurricularService {
  constructor( private prisma: PrismaService) {}

async create(dto: CreateExtracurricularDto, createdById: string) {
    // Langsung tembak ke tabel ekskul
    const newExtracurricular = await this.prisma.ekskul.create({
      data: {
        name: dto.name,
        description: dto.description,
        schedule: dto.schedule,
        coach: dto.coach,
        image: dto.image,
        createdById: createdById, 
      },
    });

    return {
      message: 'Data ekstrakurikuler berhasil ditambahkan bro! ',
      data: newExtracurricular,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter Search (Bisa cari nama ekskul, deskripsi, atau nama pelatihnya)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { coach: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Eksekusi query ambil data dan hitung total data sekaligus
    const [data, total] = await Promise.all([
      this.prisma.ekskul.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, 
        // include: {
        //   createdBy: {
        //     select: { id: true, name: true, role: true }, 
        //   },
        // },
      }),
      this.prisma.ekskul.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar ekstrakurikuler bro!',
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
    const extracurricular = await this.prisma.ekskul.findUnique({
      where: { id: id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }, 
        },
      },
    });

    // Pasang satpam: kalau ID ngasal, kasih error 404
    if (!extracurricular) {
      throw new NotFoundException(`Waduh bro, ekskul dengan ID ${id} nggak ketemu!`);
    }

    return {
      message: 'Berhasil mengambil detail ekstrakurikuler bro!',
      data: extracurricular,
    };
  }

  async update(id: string, dto: UpdateExtracurricularDto, loggedInUserId: string, userRole: string) {
    // 1. Pastiin data ekskulnya ada
    const extracurricular = await this.prisma.ekskul.findUnique({
      where: { id: id },
    });

    if (!extracurricular) {
      throw new NotFoundException(`Waduh, data ekskul dengan ID ${id} nggak ketemu bro!`);
    }

    // 2. VALIDASI KEAMANAN: Cuma boleh di-update sama yang bikin ATAU Admin
    AuthHelper.checkOwnershipOrAdmin(extracurricular.createdById, loggedInUserId, userRole, 'ekskul');

    // 3. Eksekusi update ke database
    const updatedExtracurricular = await this.prisma.ekskul.update({
      where: { id: id },
      data: {
        name: dto.name,
        description: dto.description,
        schedule: dto.schedule,
        coach: dto.coach,
        image: dto.image,
      },
    });

    return {
      message: 'Data ekstrakurikuler berhasil diperbarui bro!',
      data: updatedExtracurricular,
    };
  }

  async remove(id: string, loggedInUserId: string, userRole: string) {
    // 1. Cek dulu data ekskulnya beneran ada atau nggak
    const ekskul = await this.prisma.ekskul.findUnique({
      where: { id: id },
    });

    if (!ekskul) {
      throw new NotFoundException(`Data ekskul dengan ID ${id} udah nggak ada bro!`);
    }

    // 2. VALIDASI KEAMANAN: Cek kepemilikan atau Hak Veto Admin
    AuthHelper.checkOwnershipOrAdmin(ekskul.createdById, loggedInUserId, userRole, 'ekskul');

    // 3. Eksekusi hapus data dari Postgres
    await this.prisma.ekskul.delete({
      where: { id: id },
    });

    return {
      message: 'Data ekstrakurikuler berhasil dihapus selamanya bro!',
    };
  }
}
