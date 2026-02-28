import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

/**
 * Service to manage farm reports/issues.
 */
@Injectable()
export class ReportsService {
    /**
     * Initializes the ReportsService.
     * @param prisma - Database access service.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new report record.
     * @param createReportDto - Details of the report to create.
     * @returns The created report.
     */
    create(createReportDto: CreateReportDto) {
        return this.prisma.report.create({
            data: createReportDto,
            include: { problem: true, field: true, notes: true, images: true }
        });
    }

    /**
     * Retrieves all reports in the system.
     * @returns An array of reports.
     */
    findAll() {
        return this.prisma.report.findMany({
            include: { problem: true, field: true, notes: true },
            orderBy: { created_at: 'desc' }
        });
    }

    /**
     * Retrieves a single report by ID.
     * @param id - The report ID.
     * @returns The requested report details.
     */
    async findOne(id: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: { problem: true, field: true, notes: true, images: true, crops: { include: { crop: true } } }
        });
        if (!report) throw new NotFoundException('Report not found');
        return report;
    }

    /**
     * Updates a report.
     * Automatically sets closure date when marked as closed.
     * @param id - The report ID.
     * @param updateReportDto - Payload containing the updates.
     * @returns The updated report.
     */
    async update(id: string, updateReportDto: UpdateReportDto) {
        await this.findOne(id);

        // Auto-set closed_at if transitioning to CLOSED
        let dataToUpdate: any = { ...updateReportDto };
        if (updateReportDto.status === 'CLOSED') {
            dataToUpdate.closed_at = new Date();
        } else if (updateReportDto.status === 'OPEN') {
            dataToUpdate.closed_at = null;
        }

        return this.prisma.report.update({
            where: { id },
            data: dataToUpdate,
            include: { problem: true, field: true, notes: true }
        });
    }

    /**
     * Deletes a report entirely.
     * @param id - The report ID to delete.
     * @returns The deleted report details.
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.report.delete({ where: { id } });
    }
}
