import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getTransactionById(id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async getAllTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: TransactionDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments().exec(),
    ]);

    return { transactions, total };
  }

  async updateTransactionStatus(
    payload: any,
  ): Promise<{ success: boolean; message: string }> {
    const { id, status } = payload;

    this.logger.log(`🔄 Updating transaction ${id} status to ${status}`);

    const transaction = await this.transactionModel
      .findOne({
        $or: [{ externalOrderId: id }, { orderId: id }],
      })
      .exec();

    if (!transaction) {
      this.logger.warn(`❌ Transaction with ID ${id} not found`);
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Update transaction
    transaction.status = status;
    transaction.state = status;
    transaction.metadata = {
      ...transaction.metadata,
      webhookPayload: payload,
      lastWebhookUpdate: new Date(),
    };
    transaction.updatedAt = new Date();

    await transaction.save();

    this.logger.log(
      `✅ Transaction ${id} updated successfully to status: ${status}`,
    );

    return {
      success: true,
      message: `Transaction ${id} updated to ${status}`,
    };
  }

  async getTransactionByExternalId(
    externalOrderId: string,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findOne({ externalOrderId })
      .exec();

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with external ID ${externalOrderId} not found`,
      );
    }

    return transaction;
  }
}
