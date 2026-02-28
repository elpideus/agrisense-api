import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling routing for reports.
 */
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    /**
     * Initializes the ReportsController.
     * @param reportsService - Injected ReportsService.
     */
    constructor(private readonly reportsService: ReportsService) { }

    /**
     * Creates a new report record.
     * @param createReportDto - Payload detailing the report.
     * @returns The recorded report.
     */
    @Post()
    @ApiOperation({ summary: 'Create a new issue/pest/disease report' })
    @ApiResponse({ status: 201, description: 'Report registered successfully.' })
    create(@Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(createReportDto);
    }

    /**
     * Retrieves all reports.
     * @returns Array of reports.
     */
    @Get()
    @ApiOperation({ summary: 'Get all reports' })
    findAll() {
        return this.reportsService.findAll();
    }

    /**
     * Retrieves a single report.
     * @param id - The ID of the report.
     * @returns Details of the report.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a report by ID' })
    @ApiResponse({ status: 200, description: 'Return report details including problem, field, notes, images.' })
    @ApiResponse({ status: 404, description: 'Report not found.' })
    findOne(@Param('id') id: string) {
        return this.reportsService.findOne(id);
    }

    /**
     * Updates an existing report.
     * @param id - ID of the report.
     * @param updateReportDto - Payload to modify the report.
     * @returns The updated report.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update report details or status' })
    update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
        return this.reportsService.update(id, updateReportDto);
    }

    /**
     * Deletes a report permanently.
     * @param id - ID of the report to remove.
     * @returns Deletion status.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a report record' })
    remove(@Param('id') id: string) {
        return this.reportsService.remove(id);
    }
}
