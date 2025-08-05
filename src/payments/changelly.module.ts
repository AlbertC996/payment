import { Module } from '@nestjs/common';
import { ChangellyService } from './changelly.service';

@Module({
    providers: [ChangellyService],
    exports: [ChangellyService],
})
export class ChangellyModule { }