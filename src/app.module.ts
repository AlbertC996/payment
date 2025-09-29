import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChangeNowModule } from './changenow/changenow.module';

@Module({
  imports: [ChangeNowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
