import { Injectable, ConflictException, NotFoundException, BadRequestException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService
  ) {}

async create(dto: CreateUserDto) {
    // 1. Validasi Unique: Cek apakah username atau email udah ada di database
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          // Cek email hanya jika dikirim dari frontend
          ...(dto.email ? [{ email: dto.email }] : []), 
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException('Gagal bro, Username ini udah dipakai orang lain!');
      }
      if (existingUser.email === dto.email) {
        throw new ConflictException('Gagal bro, Email ini udah terdaftar di sistem!');
      }
    }

    // 2. Hash Password sebelum disimpen
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Simpan ke database
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'SISWA', 
      },
      // 4. Pilih kolom yang dikembalikan ke frontend (tanpa password)
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'User baru berhasil didaftarkan!',
      data: newUser,
    };
  }

    // Fungsi buat ngambil semua data user
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }, 
        { role: { contains: search, mode: 'insensitive' } }, 
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // Mengurutkan dari user paling baru dibuat
        select: {
          // WAJIB: Jangan pernah kirim password ke Frontend!
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: 'Berhasil mengambil daftar user bro',
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, username: true, email: true, role: true, avatar: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} nggak ketemu bro!`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    // 1. Pastikan usernya emang ada di database
    await this.findOne(id);

    Object.keys(dto).forEach((key) => {
      if (typeof dto[key] === 'string' && dto[key].trim() === '') {
        delete dto[key];
      } else if (dto[key] === undefined || dto[key] === null) {
        delete dto[key];
      }
    });

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Nggak ada data valid yang dikirim buat di-update bro!');
    }

    // 2. Validasi Unique: Cek username/email tapi abaikan ID milik diri sendiri
    if (dto.username || dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          id: { not: id }, 
          OR: [
            ...(dto.username ? [{ username: dto.username }] : []),
            ...(dto.email ? [{ email: dto.email }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username === dto.username) {
          throw new ConflictException('Gagal update, Username ini udah dipake orang lain bro!');
        }
        if (existingUser.email === dto.email) {
          throw new ConflictException('Gagal update, Email ini udah terdaftar di sistem!');
        }
      }
    }

    // 3. Kalau ada password baru yang dikirim, kita hash dulu
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // 4. Eksekusi update ke database
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Data user berhasil diperbarui bro!',
      data: updatedUser,
    };
  }

  async remove(id: string, currentUserId: string) {
    // 1. Validasi Anti-Bunuh Diri: Jangan biarin admin ngehapus dirinya sendiri
    if (id === currentUserId) {
      throw new BadRequestException('Lu nggak bisa menghapus akun lu sendiri pas lagi login bro! Bahaya!');
    }

    // 2. Cek dulu usernya beneran ada atau nggak di database
    await this.findOne(id);

    // 3. Eksekusi mati (hapus dari database)
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User berhasil dihapus dari muka bumi tanpa sisa bro!',
    };
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    // 1. Pastikan usernya ada dulu sebelum capek-capek upload
    await this.findOne(id);

    // 2. Suruh MinioService nge-upload dan kita tangkep URL-nya
    const avatarUrl = await this.minioService.uploadFile(file, 'avatars');

    // 3. Simpan URL tersebut ke database Postgres kita
    await this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
    });

    return {
      message: 'Avatar berhasil di-update bro!',
      avatarUrl: avatarUrl,
    };
  }


}
