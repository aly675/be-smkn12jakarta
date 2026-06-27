import { PartialType } from '@nestjs/swagger';
import { CreateExtracurricularDto } from './create-extracurricular.dto';

export class UpdateExtracurricularDto extends PartialType(CreateExtracurricularDto) {}
