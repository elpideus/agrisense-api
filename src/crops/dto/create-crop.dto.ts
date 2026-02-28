import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data transfer object for creating a crop record.
 */
export class CreateCropDto {
    @ApiProperty({ example: 'uuid-string', description: 'Field ID where crop is planted' })
    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    @ApiProperty({ example: 'uuid-string', description: 'Variety ID of the crop' })
    @IsUUID()
    @IsNotEmpty()
    variety_id: string;

    @ApiPropertyOptional({ example: '2026-04-12T00:00:00.000Z', description: 'Date the crop was planted' })
    @IsDateString()
    @IsOptional()
    planted_at?: Date;

    @ApiPropertyOptional({ example: 'uuid-string', description: 'Current bloom stage ID' })
    @IsUUID()
    @IsOptional()
    current_bloom_stage_id?: string;
}
