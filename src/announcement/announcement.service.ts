import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PengumumanType, PengumumanTarget } from '@prisma/client';
import { AuthHelper } from 'src/common/helper/auth.helper';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnnouncementDto, createdById: string) {
    const newAnnouncement = await this.prisma.pengumuman.create({
      data: {
        title: dto.title,
        content: dto.content,
        important: dto.important,
        type: dto.type,
        linkUrl: dto.linkUrl,
        
        // Karena di skema kita tipenya Json, TypeScript mungkin protes kalau kita masukin array object langsung.
        // Triknya, kita cast jadi sembarang (any) biar Prisma nge-handle conversinya ke JsonB Postgres
        files: dto.files as any, 
        
        target: dto.target,
        targetDetails: dto.targetDetails || [],
        startDate: dto.startDate,
        endDate: dto.endDate,
        createdById: createdById, 
      },
    });

    return {
      message: 'Pengumuman berhasil diterbitkan bro!',
      data: newAnnouncement,
    };
  }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    type?: PengumumanType, 
    target?: PengumumanTarget
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // 1. Filter Search (Judul atau Konten)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 2. Filter Tipe Pengumuman (teks, link, file)
    if (type) {
      where.type = type;
    }

    // 3. Filter Target Pengumuman (semua, siswa, guru, dll)
    if (target) {
      where.target = target;
    }

    // Tarik data dan hitung total sekaligus
    const [data, total] = await Promise.all([
      this.prisma.pengumuman.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, 
        include: {
          createdBy: {
            select: { id: true, email: true, name: true, avatar: true }, 
          },
        },
      }),
      this.prisma.pengumuman.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar pengumuman bro',
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
    const announcement = await this.prisma.pengumuman.findUnique({
      where: { id: id },
      include: {
        // Bawa data pembuatnya biar FE tau ini pengumuman dari siapa
        createdBy: {
          select: { 
            id: true, 
            email: true, 
            name: true,
            role: true,
            avatar: true 
          },
        },
      },
    });

    // Validasi kalau ID-nya nggak ada di database
    if (!announcement) {
      throw new NotFoundException(`Waduh bro, pengumuman dengan ID ${id} nggak ketemu!`);
    }

    return {
      message: 'Berhasil mengambil detail pengumuman',
      data: announcement,
    };
  }

  async update(id: string, dto: UpdateAnnouncementDto, loggedInUserId: string, userRole: string) {
    // 1. Cek pengumuman ada atau nggak
    const pengumuman = await this.prisma.pengumuman.findUnique({
      where: { id: id },
    });

    if (!pengumuman) {
      throw new NotFoundException(`Waduh, pengumuman dengan ID ${id} nggak ketemu bro!`);
    }

    // 2. VALIDASI KEAMANAN: Pemilik data atau Admin yang boleh lewat
    AuthHelper.checkOwnershipOrAdmin(pengumuman.createdById, loggedInUserId, userRole, 'pengumuman');

    // 3. Eksekusi update
    const pengumumanUpdated = await this.prisma.pengumuman.update({
      where: { id: id },
      data: {
        title: dto.title,
        content: dto.content,
        important: dto.important,
        type: dto.type,
        linkUrl: dto.linkUrl,
        files: dto.files ? (dto.files as any) : undefined, 
        target: dto.target,
        targetDetails: dto.targetDetails,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });

    return {
      message: 'Pengumuman berhasil di-update bro!',
      data: pengumumanUpdated,
    };
  }

  async remove(id: string, loggedInUserId: string, userRole: string) {
    // 1. Cek dulu pengumumannya ada atau nggak
    const pengumuman = await this.prisma.pengumuman.findUnique({
      where: { id: id },
    });

    if (!pengumuman) {
      throw new NotFoundException(`Pengumuman dengan ID ${id} udah nggak ada bro!`);
    }

    // 2. VALIDASI KEAMANAN: Cek kepemilikan atau Hak Veto Admin
    AuthHelper.checkOwnershipOrAdmin(pengumuman.createdById, loggedInUserId, userRole, 'pengumuman');

    // 3. Eksekusi hapus data dari Postgres
    await this.prisma.pengumuman.delete({
      where: { id: id },
    });

    return {
      message: 'Pengumuman berhasil dihapus selamanya bro!',
    };
  }
}
