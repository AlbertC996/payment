import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class FraudService {
    generateFraudIdentifier(paymentDetails: {
        type: string;
        userId?: string;
        expiration?: string;
        lastFour?: string;
        accountNumber?: string;
        bankName?: string;
    }): string {
        const secret = process.env.HMAC_SECRET || 'default-secret';
        let input = '';

        if (paymentDetails.type === 'googlepay' && paymentDetails.userId) {
            input = `${paymentDetails.type}${paymentDetails.userId}`;
        } else if (paymentDetails.expiration && paymentDetails.lastFour) {
            input = `${paymentDetails.expiration}${paymentDetails.lastFour}`;
        } else if (paymentDetails.accountNumber && paymentDetails.bankName) {
            input = `${paymentDetails.accountNumber}${paymentDetails.bankName}`;
        }

        return createHmac('sha256', secret).update(input).digest('hex');
    }
}
