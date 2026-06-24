import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MinioModule } from '../minio/minio.module'; 

@Module({
  imports: [MinioModule], 
  controllers: [NewsController],
  providers: [NewsService, PrismaService],
})
export class NewsModule {}