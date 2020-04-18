// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface TransactionDTO {
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
  }: TransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let category_id = '';

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    console.log(findCategory);

    if (!findCategory) {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      console.log(newCategory);

      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = findCategory.id;
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
