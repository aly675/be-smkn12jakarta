import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AuthHelper } from 'src/common/helper/auth.helper';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto, authorId: string) {
    const currentNews = await this.prisma.berita.create({
      data: {
        title: createNewsDto.title,
        content: createNewsDto.content,
        excerpt: createNewsDto.excerpt,
        category: createNewsDto.category,
        tags: createNewsDto.tags || [], 
        image: createNewsDto.image,
        authorId: authorId,
      },
    });

    return {
      message: 'Berita berhasil diterbitkan bro!',
      data: currentNews,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, category?: string) {
    // 1. Rumus Pagination (Lewati data ke berapa)
    const skip = (page - 1) * limit;

    // 2. Rakit Kondisi Pencarian (Filter)
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // 3. Tarik Data dan Hitung Total Bersamaan (Biar Cepat)
    const [data, total] = await Promise.all([
      this.prisma.berita.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, 
        include: {
          author: {
            select: { 
              id: true, 
              email: true, 
              name: true,
              avatar: true 
            }, 
          },
        },
      }),
      this.prisma.berita.count({ where }), // Hitung total data yang cocok buat FE
    ]);

    // 4. Balikin dengan format rapi beserta Meta Data Pagination
    return {
      message: 'Berhasil mengambil daftar berita',
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
    const news = await this.prisma.berita.findUnique({
      where: { id: id },
      include: {
        // Tarik data penulisnya juga biar FE senang
        author: {
          select: { 
            id: true, 
            email: true, 
            name: true,
            avatar: true
          },
        },
      },
    });

    // Validasi kalau beritanya nggak ada di database
    if (!news) {
      throw new NotFoundException(`Waduh bro, berita dengan ID ${id} nggak ketemu!`);
    }

    return {
      message: 'Berhasil mengambil detail berita',
      data: news,
    };
  }

  async update(id: string, updateNewsDto: UpdateNewsDto, loggedInUserId: string, userRole: string) {
    // 1. Cek apakah beritanya beneran ada di DB
    const news = await this.prisma.berita.findUnique({
      where: { id: id },
    });

    if (!news) {
      throw new NotFoundException(`Berita dengan ID ${id} nggak ketemu bro!`);
    }

    // 2. VALIDASI KEAMANAN: Cek apakah yang mau ngedit adalah pemilik beritanya
    AuthHelper.checkOwnershipOrAdmin(news.authorId, loggedInUserId, userRole, 'berita');

    // 3. Eksekusi update data
    const newsUpdated = await this.prisma.berita.update({
      where: { id: id },
      data: {
        title: updateNewsDto.title,
        content: updateNewsDto.content,
        excerpt: updateNewsDto.excerpt,
        category: updateNewsDto.category,
        tags: updateNewsDto.tags,
        image: updateNewsDto.image,
      },
    });

    return {
      message: 'Berita berhasil diperbarui bro!',
      data: newsUpdated,
    };
  }

  async remove(id: string, loggedInUserId: string, userRole: string) {
    // 1. Cek dulu beritanya ada atau nggak
    const news = await this.prisma.berita.findUnique({
      where: { id: id },
    });

    if (!news) {
      throw new NotFoundException(`Berita dengan ID ${id} udah nggak ada bro!`);
    }

    // 2. Validasi Kepemilikan: Cek apakah yang mau hapus adalah pemilik beritanya atau Admin
    AuthHelper.checkOwnershipOrAdmin(news.authorId, loggedInUserId, userRole, 'berita');

    // 3. Eksekusi hapus data dari Postgres
    await this.prisma.berita.delete({
      where: { id: id },
    });

    return {
      message: 'Berita berhasil dihapus selamanya bro!',
    };
  }
}