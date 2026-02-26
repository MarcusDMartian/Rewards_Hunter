// ============================================
// PRISMA SERVICE - Database connection
// ============================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✅ Connected to MongoDB Atlas');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            // Don't throw, let the app start so we can see the health check
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
