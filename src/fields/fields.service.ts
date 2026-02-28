import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

/**
 * Service managing fields with geographical capabilities.
 */
@Injectable()
export class FieldsService {
    /**
     * Initializes the FieldsService.
     * @param prisma - Database service.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new agricultural field.
     * @param createFieldDto - Data to create a field.
     * @returns The created field record.
     */
    async create(createFieldDto: CreateFieldDto) {
        const { name, is_bio, longitude, latitude, user_id } = createFieldDto;

        const rows = await this.prisma.$queryRawUnsafe<any[]>(
            `INSERT INTO "Field" (id, created_at, name, gps_coords, is_bio, user_id)
       VALUES (gen_random_uuid(), now(), $1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5::uuid)
       RETURNING id, name, is_bio, user_id, ST_X(gps_coords::geometry) AS longitude, ST_Y(gps_coords::geometry) AS latitude, created_at`,
            name,
            longitude,
            latitude,
            is_bio ?? false,
            user_id,
        );

        return rows[0];
    }

    /**
     * Retrieves all fields.
     * @returns Array of field records.
     */
    async findAll() {
        return this.prisma.$queryRawUnsafe<any[]>(
            `SELECT id, name, is_bio, user_id, created_at, 
              ST_X(gps_coords::geometry) AS longitude, 
              ST_Y(gps_coords::geometry) AS latitude 
       FROM "Field" ORDER BY created_at DESC`
        );
    }

    /**
     * Retrieves a single field by its ID.
     * @param id - The ID of the field.
     * @returns The field record.
     */
    async findOne(id: string) {
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
            `SELECT id, name, is_bio, user_id, created_at, 
              ST_X(gps_coords::geometry) AS longitude, 
              ST_Y(gps_coords::geometry) AS latitude 
       FROM "Field" WHERE id = $1::uuid LIMIT 1`,
            id
        );
        if (!rows.length) throw new NotFoundException('Field not found');
        return rows[0];
    }

    /**
     * Updates an existing field.
     * @param id - The ID of the field to update.
     * @param updateFieldDto - Updated field data.
     * @returns The updated field record.
     */
    async update(id: string, updateFieldDto: UpdateFieldDto) {
        const field = await this.findOne(id);

        const name = updateFieldDto.name ?? field.name;
        const is_bio = updateFieldDto.is_bio ?? field.is_bio;
        const longitude = updateFieldDto.longitude ?? field.longitude;
        const latitude = updateFieldDto.latitude ?? field.latitude;
        const user_id = updateFieldDto.user_id ?? field.user_id;

        const rows = await this.prisma.$queryRawUnsafe<any[]>(
            `UPDATE "Field" SET 
          name = $1, 
          is_bio = $2, 
          user_id = $3::uuid,
          gps_coords = ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography
       WHERE id = $6::uuid
       RETURNING id, name, is_bio, user_id, ST_X(gps_coords::geometry) AS longitude, ST_Y(gps_coords::geometry) AS latitude, created_at`,
            name,
            is_bio,
            user_id,
            longitude,
            latitude,
            id
        );
        return rows[0];
    }

    /**
     * Removes a field from the database.
     * @param id - The ID of the field to remove.
     * @returns ID of the removed field.
     */
    async remove(id: string) {
        await this.findOne(id);
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
            `DELETE FROM "Field" WHERE id = $1::uuid RETURNING id`, id
        );
        return rows[0];
    }
}

