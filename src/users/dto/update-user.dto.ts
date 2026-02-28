import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Data transfer object for updating a user.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) { }
