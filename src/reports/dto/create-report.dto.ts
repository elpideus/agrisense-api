import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

/**
 * Data transfer object for creating a report.
 */
export class CreateReportDto {
    @ApiProperty({ example: 'Fire Blight outbreak', description: 'Title of the report' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: 'Shepherds crook wilting', description: 'Detailed description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: ReportStatus, example: 'OPEN', description: 'Current status' })
    @IsEnum(ReportStatus)
    @IsOptional()
    status?: ReportStatus;

    @ApiProperty({ example: 'uuid-string', description: 'ID of the problem category' })
    @IsUUID()
    @IsNotEmpty()
    problem_id: string;

    @ApiProperty({ example: 'uuid-string', description: 'ID of the affected field' })
    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}
