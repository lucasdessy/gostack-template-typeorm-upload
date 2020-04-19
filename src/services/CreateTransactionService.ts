import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
interface TransactionFormatted {
  id: string;
  title: string;
  value: number;
  type: string;
  category: string;
}
class CreateTransactionService {
  private async findCategory(category: string): Promise<string> {
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (categoryExists) {
      const category_id = categoryExists.id;
      return category_id;
    }
    const newCategory = categoryRepository.create({
      title: category,
    });
    await categoryRepository.save(newCategory);
    const { id: category_id } = newCategory;
    return category_id;
  }

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<TransactionFormatted> {
    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Type of transaction is not valid.');
    }
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total - value < 0) {
      throw new AppError('Outcome exceeds balance.');
    }
    const category_id = await this.findCategory(category);
    const transaction = transactionRepository.create({
      category: {
        id: category_id,
        title: category,
      },
      title,
      value,
      type,
    });
    await transactionRepository.save(transaction);
    const transactionFormatted = {
      id: transaction.id,
      title,
      value,
      type,
      category,
    };
    return transactionFormatted;
  }
}

export default CreateTransactionService;
