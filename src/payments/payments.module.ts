import { Module } from '@nestjs/common';
import { ChangellyService } from './changelly.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ChangellyModule } from './changelly.module';

@Module({
    imports: [ChangellyModule],
    providers: [ChangellyService, PaymentsService],
    controllers: [PaymentsController],
})
export class PaymentsModule { }