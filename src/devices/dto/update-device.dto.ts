import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';

/**
 * Data transfer object for updating a physical device record.
 */
export class UpdateDeviceDto extends PartialType(CreateDeviceDto) { }
