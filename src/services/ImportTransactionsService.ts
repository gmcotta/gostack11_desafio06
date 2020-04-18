import parse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  csvFilename: string;
}

interface TransactionFile {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: RequestDTO): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const parsedTransactions: TransactionFile[] = [];
    const newTransactions: Transaction[] = [];

    const csvFilePath = path.join(uploadConfig.directory, csvFilename);
    fs.createReadStream(csvFilePath)
      .pipe(parse({ delimiter: ', ', from_line: 2 }))
      .on('data', row => {
        const [title, type, value, category] = row;
        parsedTransactions.push({
          title,
          type,
          value: Number(value),
          category,
        });
      });

    parsedTransactions.map(async ({ title, type, value, category }) => {
      const newTransaction = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });
      newTransactions.push(newTransaction);
    });
    console.log(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;
