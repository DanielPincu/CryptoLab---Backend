import { Schema, model } from 'mongoose';
import type { IUser } from '../interfaces/user.interface';

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', UserSchema);