import { Schema, model } from 'mongoose';
import type { IPosition } from '../interfaces/position.interface';

const PositionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    qty: { type: Number, required: true, default: 0 },
    avgEntryPrice: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

PositionSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const PositionModel = model<IPosition>('Position', PositionSchema);