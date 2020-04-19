import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        'You should not be able to create outcome transaction without a valid balance',
      );
    }

    let findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(findCategory);
    }

    delete findCategory.created_at;
    delete findCategory.updated_at;

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });
    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
