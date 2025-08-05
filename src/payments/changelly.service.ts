import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChangellyService {
    private readonly logger = new Logger(ChangellyService.name);

    private payments: Record<string, any> = {};

    /**
     * Simulates initiating a Changelly payment
     */
    async initiatePayment(data: {
        fiatAmount: number;
        fiatCurrency: string;
        targetAddress: string;
        userId?: string;
    }): Promise<{ txId: string; status: string }> {
        const txId = `tx_${Date.now()}`;
        this.payments[txId] = {
            ...data,
            status: 'pending',
            createdAt: new Date(),
        };

        this.logger.log(`Mock payment initiated: ${txId}`);
        return {
            txId,
            status: 'pending',
        };
    }

    /**
     * Simulates checking payment status
     */
    async checkPaymentStatus(txId: string): Promise<{ txId: string; status: string }> {
        const payment = this.payments[txId];
        if (!payment) {
            throw new Error('Transaction not found');
        }

        // Simulate progression to "confirmed" after 3 seconds
        const elapsed = (Date.now() - new Date(payment.createdAt).getTime()) / 1000;
        if (elapsed > 3 && payment.status === 'pending') {
            payment.status = 'confirmed';
        }

        this.logger.log(`Mock status for ${txId}: ${payment.status}`);
        return {
            txId,
            status: payment.status,
        };
    }

    /**
     * Simulates a webhook from Changelly
     */
    simulateWebhook(txId: string): { event: string; data: any } {
        const payment = this.payments[txId];
        if (!payment) {
            throw new Error('Transaction not found');
        }

        payment.status = 'confirmed';

        this.logger.log(`Mock webhook simulated for ${txId}`);
        return {
            event: 'payment:status:update',
            data: {
                txId,
                status: 'confirmed',
            },
        };
    }
}