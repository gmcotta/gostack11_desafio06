import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface BalanceDTO {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<BalanceDTO> {
    const transactions = await this.find();

    const income = transactions.reduce((acc, { value, type }) => {
      return type === 'income' ? acc + value : acc;
    }, 0);
    const outcome = transactions.reduce((acc, { value, type }) => {
      return type === 'outcome' ? acc + value : acc;
    }, 0);
    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
