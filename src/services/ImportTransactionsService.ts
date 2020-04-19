import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(file: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const readStream = fs.createReadStream(file);
    const parser = csvParse({
      delimiter: ',',
      from_line: 2,
    });
    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];
    const parserCSV = readStream.pipe(parser);
    parserCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value || !category) return;
      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parserCSV.on('end', resolve));
    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => {
        return category.title;
      },
    );
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(newCategories);
    const finalCategories = [...newCategories, ...existentCategories];
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(file);
    return createdTransactions;
  }
}

export default ImportTransactionsService;
