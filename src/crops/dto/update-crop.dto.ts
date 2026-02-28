import { PartialType } from '@nestjs/swagger';
import { CreateCropDto } from './create-crop.dto';

/**
 * Data transfer object for updating a crop record.
 */
export class UpdateCropDto extends PartialType(CreateCropDto) { }
