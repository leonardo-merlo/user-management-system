import { randomUUID } from 'node:crypto';
import { User } from '../src/user/user.entity';

type Criteria = Partial<Pick<User, 'id' | 'email' | 'username'>>;
// TypeORM reads an array of criteria as OR.
type Where = { where: Criteria | Criteria[] };

function matches(row: User, criteria: Criteria): boolean {
  return (Object.keys(criteria) as (keyof Criteria)[]).every(
    (key) => row[key] === criteria[key],
  );
}

// Stands in for the TypeORM repository so the HTTP tests run without MySQL.
// It implements only the methods UserService calls, and keeps the unique
// e-mail and username rule the real table enforces.
export class InMemoryUserRepository {
  private rows = new Map<string, User>();

  create(data: Omit<User, 'id'>): User {
    return { id: randomUUID(), ...data };
  }

  save(user: User): Promise<User> {
    for (const row of this.rows.values()) {
      if (
        row.id !== user.id &&
        (row.email === user.email || row.username === user.username)
      ) {
        return Promise.reject(new Error('ER_DUP_ENTRY'));
      }
    }
    this.rows.set(user.id, { ...user });
    return Promise.resolve({ ...user });
  }

  find(): Promise<User[]> {
    return Promise.resolve([...this.rows.values()].map((row) => ({ ...row })));
  }

  findOne({ where }: Where): Promise<User | null> {
    const alternatives = Array.isArray(where) ? where : [where];
    const found = [...this.rows.values()].find((row) =>
      alternatives.some((criteria) => matches(row, criteria)),
    );
    return Promise.resolve(found ? { ...found } : null);
  }

  update(id: string, data: Partial<User>): Promise<{ affected: number }> {
    const row = this.rows.get(id);
    if (!row) return Promise.resolve({ affected: 0 });
    this.rows.set(id, { ...row, ...data });
    return Promise.resolve({ affected: 1 });
  }

  delete(id: string): Promise<{ affected: number }> {
    return Promise.resolve({ affected: this.rows.delete(id) ? 1 : 0 });
  }
}
