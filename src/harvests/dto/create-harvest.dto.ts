import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data transfer object for recording a harvest.
 */
export class CreateHarvestDto {
    @ApiProperty({ example: '2026-09-15T00:00:00.000Z', description: 'Date of harvest' })
    @IsDateString()
    @IsNotEmpty()
    harvested_at: Date;

    @ApiProperty({ example: 'uuid-string', description: 'ID of the harvested crop' })
    @IsUUID()
    @IsNotEmpty()
    crop_id: string;

    @ApiProperty({ example: 'uuid-string', description: 'ID of the field (denormalized)' })
    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    @ApiProperty({ example: 4800, description: 'Total yield/weight' })
    @IsNumber()
    @Min(0)
    total: number;

    @ApiPropertyOptional({ example: 3200, description: 'First quality yield' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    first_quality?: number;

    @ApiPropertyOptional({ example: 1200, description: 'Second quality yield' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    second_quality?: number;

    @ApiPropertyOptional({ example: 400, description: 'Garbage/waste yield' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    garbage?: number;

    @ApiPropertyOptional({ example: 'Good yield overall.', description: 'Additional notes' })
    @IsString()
    @IsOptional()
    notes?: string;
}
