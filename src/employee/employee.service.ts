import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE DATA PEGAWAI
  // ==========================================
  async create(dto: CreateEmployeeDto, createdById: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data pegawai');

    // Cek apakah NIP udah dipakai
    const existingEmployee = await this.prisma.pegawai.findUnique({
      where: { nip: dto.nip },
    });

    if (existingEmployee) {
      throw new ConflictException(`Gagal bro, NIP tersebut sudah digunakan oleh ${existingEmployee.name} bro!!`);
    }

    const newEmployee = await this.prisma.pegawai.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        position: dto.position,
        division: dto.division,
        contact: dto.contact,
        photo: dto.photo,
        createdById: createdById,
      },
    });

    return { message: 'Mantap bro, data pegawai berhasil ditambahkan!', data: newEmployee };
  }

  // ==========================================
  // FIND ALL PEGAWAI (Public + Search + Pagination)
  // ==========================================
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { division: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.pegawai.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.pegawai.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar pegawai bro!',
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
  // FIND ONE PEGAWAI (Public)
  // ==========================================
  async findOne(id: string) {
    const employee = await this.prisma.pegawai.findUnique({ where: { id } });

    if (!employee) throw new NotFoundException(`Waduh, data pegawai dengan ID ${id} nggak ketemu bro!`);

    return { message: 'Berhasil mengambil detail pegawai bro!', data: employee };
  }

  // ==========================================
  // UPDATE DATA PEGAWAI
  // ==========================================
  async update(id: string, dto: UpdateEmployeeDto, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'data pegawai');

    const existingEmployee = await this.prisma.pegawai.findUnique({ where: { id } });
    if (!existingEmployee) throw new NotFoundException(`Waduh, data pegawai dengan ID ${id} nggak ketemu bro!`);

    // Cek bentrok NIP kalau NIP-nya diubah
    if (dto.nip && dto.nip !== existingEmployee.nip) {
      const nipTaken = await this.prisma.pegawai.findUnique({ where: { nip: dto.nip } });
      if (nipTaken) {
        throw new ConflictException(`Gagal bro, NIP ${dto.nip} tersebut sudah digunakan oleh ${nipTaken.name} bro!!`);
      }
    }

    const updatedEmployee = await this.prisma.pegawai.update({
      where: { id },
      data: {
        name: dto.name,
        nip: dto.nip,
        position: dto.position,
        division: dto.division,
        contact: dto.contact,
        photo: dto.photo,
      },
    });

    return { message: 'Mantap bro, data pegawai berhasil diperbarui!', data: updatedEmployee };
  }

  // ==========================================
  // DELETE DATA PEGAWAI
  // ==========================================
  async remove(id: string, userRole: string) {
    AuthHelper.checkIsAdmin(userRole, 'menghapus data pegawai');

    const existingEmployee = await this.prisma.pegawai.findUnique({ where: { id } });
    if (!existingEmployee) throw new NotFoundException(`Data pegawai dengan ID ${id} udah nggak ada bro!`);

    await this.prisma.pegawai.delete({ where: { id } });

    return { message: 'Data pegawai berhasil dihapus selamanya bro!' };
  }
}