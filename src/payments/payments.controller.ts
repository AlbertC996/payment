import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('initiate')
    initiate(@Body() body: any) {
        return this.paymentsService.initiate(body);
    }

    @Get('status')
    status(@Query('txId') txId: string) {
        return this.paymentsService.checkStatus(txId);
    }
}