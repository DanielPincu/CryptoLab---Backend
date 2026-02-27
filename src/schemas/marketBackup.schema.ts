import { Schema, model } from 'mongoose'
import { IMarketBackup } from '../interfaces/marketBackup.interface'


const marketBackupSchema = new Schema<IMarketBackup>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    marketTimestamp: {
      type: Number,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
)

export const MarketBackupModel = model<IMarketBackup>(
  'marketBackup',
  marketBackupSchema
)