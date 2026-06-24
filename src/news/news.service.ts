import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto, authorId: string) {
    const newsBaru = await this.prisma.berita.create({
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
      data: newsBaru,
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
          // Relasi: Ambil data penulis, TAPI JANGAN BAWA PASSWORD-NYA!
          author: {
            select: { id: true, email: true, avatar: true }, // Sesuaikan dengan nama kolom nama/email di tabel User lu
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
}