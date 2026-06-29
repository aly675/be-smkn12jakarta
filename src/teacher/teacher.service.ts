import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class TeacherService {
  constructor( private prisma: PrismaService ) {} 

async create(dto: CreateTeacherDto, createdById: string, userRole: string) {
    // VALIDASI MUTLAK: Cuma Admin yang boleh lewat!
    AuthHelper.checkIsAdmin(userRole, 'data guru');

    // 2. CEK UNIQUE NIP
    const existingTeacher = await this.prisma.guru.findUnique({
      where: { nip: dto.nip },
    });

    if (existingTeacher) {
      throw new ConflictException(
        `Gagal bro, NIP tersebut sudah digunakan oleh ${existingTeacher.name} bro!!`
      );
    }

    // Tembak ke database
    const newTeacher = await this.prisma.guru.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        position: dto.position,
        subject: dto.subject,
        education: dto.education,
        email: dto.email,
        photo: dto.photo,
        createdById: createdById,
      },
    });

    return {
      message: 'Mantap bro, data guru berhasil ditambahkan!',
      data: newTeacher,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter Search multi-kolom
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { education: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.guru.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, 
      }),
      this.prisma.guru.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar guru bro!',
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
    const teacher = await this.prisma.guru.findUnique({
      where: { id: id },
    });

    // Satpam kalau ID yang dimasukin ngasal atau datanya udah dihapus
    if (!teacher) {
      throw new NotFoundException(`Waduh bro, data guru dengan ID ${id} nggak ketemu!`);
    }

    return {
      message: 'Berhasil mengambil detail profil guru bro!',
      data: teacher,
    };
  }

  async update(id: string, dto: UpdateTeacherDto, userRole: string) {

    AuthHelper.checkIsAdmin(userRole, 'data guru');

    // cek data guru yang mau diedit sudah ada atau belum
    const existingTeacher = await this.prisma.guru.findUnique({
      where: { id: id },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Waduh, data guru dengan ID ${id} nggak ketemu bro!`);
    }

    // CEK BENTROK NIP (Kalau NIP-nya ikut diubah)
    if (dto.nip && dto.nip !== existingTeacher.nip) {
      const nipTaken = await this.prisma.guru.findUnique({
        where: { nip: dto.nip },
      });

      if (nipTaken) {
        throw new ConflictException(
          `Gagal bro, NIP ${dto.nip} tersebut sudah digunakan oleh ${nipTaken.name}... bro!! ❌`
        );
      }
    }

    // Eksekusi update ke database
    const teacherUpdated = await this.prisma.guru.update({
      where: { id: id },
      data: {
        name: dto.name,
        nip: dto.nip,
        position: dto.position,
        subject: dto.subject,
        education: dto.education,
        email: dto.email,
        photo: dto.photo,
      },
    });

    return {
      message: 'Mantap bro, data guru berhasil diperbarui! ',
      data: teacherUpdated,
    };
  }

  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data guru');

    const existingTeacher = await this.prisma.guru.findUnique({
      where: { id: id },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Data guru dengan ID ${id} udah nggak ada bro!`);
    }

    // Eksekusi hapus data  
    await this.prisma.guru.delete({
      where: { id: id },
    });

    return {
      message: 'Data guru berhasil dihapus selamanya bro!',
    };
  }
}
