import { PartialType } from '@nestjs/swagger';
import { CreateReportDto } from './create-report.dto';

/**
 * Data transfer object for updating a report.
 */
export class UpdateReportDto extends PartialType(CreateReportDto) { }
