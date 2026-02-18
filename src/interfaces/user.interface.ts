// src/interfaces/user.interface.ts

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}