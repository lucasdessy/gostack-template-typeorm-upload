import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
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
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const category_id = await this.findCategory(category);
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });
    transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
