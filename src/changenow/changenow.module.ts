import { Module } from '@nestjs/common';
import { ChangeNowController } from './changenow.controller';
import { ChangeNowService } from './changenow.service';

@Module({
  controllers: [ChangeNowController],
  providers: [ChangeNowService],
  exports: [ChangeNowService],
})
export class ChangeNowModule {}
