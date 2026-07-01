import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MinioModule } from './minio/minio.module';
import { NewsModule } from './news/news.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { ExtracurricularModule } from './extracurricular/extracurricular.module';
import { TeacherModule } from './teacher/teacher.module';
import { EmployeeModule } from './employee/employee.module';
import { AchievementModule } from './achievement/achievement.module';

@Module({
  imports: [AuthModule, UsersModule, MinioModule, NewsModule, AnnouncementModule, ExtracurricularModule, TeacherModule, EmployeeModule, AchievementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
