import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ 
  timestamps: true
})
export class Transaction {
  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  externalUserId: string;

  @Prop({ required: false, index: true })
  externalOrderId?: string;

  @Prop({ required: true, default: 'changenow' })
  providerCode: string;

  @Prop({ required: true })
  currencyFrom: string;

  @Prop({ required: true })
  currencyTo: string;

  @Prop({ required: true })
  amountFrom: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  state?: string;

  @Prop()
  ip?: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop()
  walletExtraId?: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  redirectUrl?: string;

  @Prop({ 
    required: true, 
    default: 'pending',
    enum: ['pending', 'waiting', 'confirming', 'exchanging', 'sending', 'finished', 'failed', 'refunded', 'verifying']
  })
  status: string;

  @Prop()
  errorType?: string;

  @Prop()
  errorMessage?: string;

  @Prop({ type: [Object] })
  errorDetails?: any[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Create indexes for better query performance
TransactionSchema.index({ externalUserId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ externalOrderId: 1 });