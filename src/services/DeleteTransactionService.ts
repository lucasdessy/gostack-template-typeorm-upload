import { getRepository, getConnection } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    try {
      const transactionsRepository = getRepository(Transaction);
      const existsTransacion = await transactionsRepository.findOne({
        where: {
          id,
        },
      });

      if (!existsTransacion) {
        throw new AppError('Transaction ID not valid.');
      } else {
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Transaction)
          .where('id = :id', { id })
          .execute();
      }
    } catch (err) {
      throw new AppError(err.message, 500);
    }
  }
}

export default DeleteTransactionService;
