import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { MinioModule } from 'src/minio/minio.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [MinioModule],
  controllers: [PartnerController],
  providers: [PartnerService, PrismaService],
})
export class PartnerModule {}
