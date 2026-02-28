import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data transfer object for creating a user.
 */
export class CreateUserDto {
    @ApiProperty({ example: 'Alice Rossi', description: 'Full name of the user' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'alice.rossi@agrisense.dev', description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'securepassword123', description: 'Plain-text password (will be hashed)' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: '+39 333 1111111', description: 'Optional phone number' })
    @IsString()
    @IsOptional()
    phone?: string;
}
