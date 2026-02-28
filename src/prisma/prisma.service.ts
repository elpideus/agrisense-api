import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Service extending PrismaClient.
 * Responsible for handling database connections.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    /**
     * Initializes the PrismaService with the pg adapter.
     */
    constructor() {
        const pool = new Pool({ connectionString: process.env.DIRECT_URL });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    /**
     * Connects to the database when the module initializes.
     */
    async onModuleInit() {
        await this.$connect();
    }

    /**
     * Disconnects from the database when the module is destroyed.
     */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
