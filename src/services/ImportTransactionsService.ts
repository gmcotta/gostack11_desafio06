import parse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  csvFilename: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: RequestDTO): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const parsedTransaction: Transaction[] = [];

    const csvFilePath = path.join(uploadConfig.directory, csvFilename);
    const csvStream = fs
      .createReadStream(csvFilePath)
      .pipe(parse({ delimiter: ', ', from_line: 2 }));

    csvStream.on('data', async row => {
      const [title, type, value, category] = row;

      const newTransaction = await createTransaction.execute({
        title,
        type,
        value: Number(value),
        category,
      });
      parsedTransaction.push(newTransaction);
      console.log(parsedTransaction);
    });

    return parsedTransaction;
  }
}

export default ImportTransactionsService;
