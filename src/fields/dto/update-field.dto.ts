import { PartialType } from '@nestjs/swagger';
import { CreateFieldDto } from './create-field.dto';

/**
 * Data transfer object for updating a field.
 */
export class UpdateFieldDto extends PartialType(CreateFieldDto) { }
