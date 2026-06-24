import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
    @ApiProperty({ example: 'SMKN 12 Juara LKS! (Edited)' })
    title!: string;
}
