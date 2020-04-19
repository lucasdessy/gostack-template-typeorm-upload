import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    console.log(transactions);
    const income = transactions.reduce((total, currentval) => {
      if (currentval.type === 'income') {
        const currIncome = total + currentval.value;
        return currIncome;
      }
      return total;
    }, 0);
    const outcome = transactions.reduce((total, currentval) => {
      if (currentval.type === 'outcome') {
        const currOutcome = total + currentval.value;
        return currOutcome;
      }
      return total;
    }, 0);
    const total = income - outcome;
    const balance = {
      income,
      outcome,
      total,
    };
    return balance;
  }
}

export default TransactionsRepository;
