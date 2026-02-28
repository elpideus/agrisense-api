import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data transfer object for creating a field.
 */
export class CreateFieldDto {
    @ApiProperty({ example: 'North Orchard', description: 'Name of the field' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: true, description: 'Is the field certified organic?' })
    @IsBoolean()
    @IsOptional()
    is_bio?: boolean;

    @ApiProperty({ example: 11.1194, description: 'Longitude coordinate' })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiProperty({ example: 46.0664, description: 'Latitude coordinate' })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ example: 'uuid-string', description: 'User ID of the field owner' })
    @IsUUID()
    user_id: string;
}
