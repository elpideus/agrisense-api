import { PartialType } from '@nestjs/swagger';
import { CreateHarvestDto } from './create-harvest.dto';

/**
 * Data transfer object for updating a recorded harvest.
 */
export class UpdateHarvestDto extends PartialType(CreateHarvestDto) { }
