import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../currencies/schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getTransactionById(id: string) {
    return this.transactionModel.findById(id).exec();
  }

  async updateTransactionStatus(payload: any) {
    const { id, status } = payload;

    this.logger.log(`Updating transaction ${id} status to ${status}`);

    const transaction = await this.transactionModel
      .findOne({
        externalOrderId: id,
      })
      .exec();

    if (!transaction) {
      this.logger.warn(`Transaction with externalOrderId ${id} not found`);
      return { success: false, message: 'Transaction not found' };
    }

    transaction.status = status;
    transaction.state = status;
    transaction.metadata = { ...transaction.metadata, ...payload };

    await transaction.save();

    this.logger.log(`Transaction ${id} updated successfully`);

    return { success: true, message: 'Transaction updated' };
  }
}
