import parse from 'csv-parse';
import fs from 'fs';
import csv from 'csvtojson';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  csvFilename: string;
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: RequestDTO): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const parsedTransaction: Transaction[] = [];

    const csvFilePath = path.join(uploadConfig.directory, csvFilename);
    const jsonArray = await csv().fromFile(csvFilePath);

    const transaction = await jsonArray.reduce(async (acc, data) => {
      const result = await acc;
      if (result instanceof Transaction) parsedTransaction.push(result);
      return createTransaction.execute(data);
    }, Promise.resolve());

    parsedTransaction.push(transaction);

    return parsedTransaction;

    // const csvStream = fs
    //   .createReadStream(csvFilePath)
    //   .pipe(parse({ delimiter: ', ', from_line: 2 }));

    // csvStream.on('data', async row => {
    //   const [title, type, value, category] = row;

    //   const newTransaction = await createTransaction.execute({
    //     title,
    //     type,
    //     value: Number(value),
    //     category,
    //   });
    //   parsedTransaction.push(newTransaction);
    //   console.log(parsedTransaction);
    // });

    // return parsedTransaction;
  }
}

export default ImportTransactionsService;
