import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../currencies/schemas/transaction.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const tx = await this.transactionModel.findById(id).lean();
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }
}
