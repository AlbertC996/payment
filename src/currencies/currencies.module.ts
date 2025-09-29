import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
