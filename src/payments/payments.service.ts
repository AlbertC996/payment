import { Injectable } from '@nestjs/common';
import { ChangellyService } from './changelly.service';

@Injectable()
export class PaymentsService {
    constructor(private readonly changellyService: ChangellyService) { }

    async initiate(data: any) {
        return this.changellyService.initiatePayment(data);
    }

    async checkStatus(txId: string) {
        return this.changellyService.checkPaymentStatus(txId);
    }
}
