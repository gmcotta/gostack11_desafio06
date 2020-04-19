import parse from 'csv-parse';
import fs from 'fs';
import { In, getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  csvPath: string;
}

interface CSVTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvPath }: RequestDTO): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const parsedCategories: string[] = [];
    const parsedTransactions: CSVTransactionDTO[] = [];

    const csvStream = fs
      .createReadStream(csvPath)
      .pipe(parse({ from_line: 2, trim: true }));

    csvStream.on('data', async row => {
      const [title, type, value, category] = row;

      if (!title || !type || !value) return;

      parsedTransactions.push({ title, type, value: Number(value), category });
      parsedCategories.push(category);
    });

    await new Promise(resolve => csvStream.on('end', resolve));

    const findCategories = await categoryRepository.find({
      where: {
        title: In(parsedCategories),
      },
    });

    const categoryTitleFound = findCategories.map(category => category.title);

    const addCategoryTitles = parsedCategories
      .filter(category => !categoryTitleFound.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(newCategories);

    const allCategories = [...newCategories, ...findCategories];

    const newTransactions = transactionRepository.create(
      parsedTransactions.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category: allCategories.find(
          categoryDB => categoryDB.title === category,
        ),
      })),
    );
    await transactionRepository.save(newTransactions);

    await fs.promises.unlink(csvPath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
