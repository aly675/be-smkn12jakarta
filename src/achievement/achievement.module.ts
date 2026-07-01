import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [ MinioModule ],
  controllers: [ AchievementController ],
  providers: [ AchievementService, PrismaService ],
})
export class AchievementModule {}
