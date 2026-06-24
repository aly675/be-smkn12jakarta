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
}