// ============================================
// KUDOS MODULE
// ============================================
import { Module } from '@nestjs/common';
import { KudosService } from './kudos.service';
import { KudosController } from './kudos.controller';

@Module({
    controllers: [KudosController],
    providers: [KudosService],
    exports: [KudosService],
})
export class KudosModule { }
