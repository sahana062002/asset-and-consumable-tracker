import * as bcrypt from 'bcryptjs';

export const hashPassword = async (plain: string): Promise<string> => {
  return await bcrypt.hash(plain, 12);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};
