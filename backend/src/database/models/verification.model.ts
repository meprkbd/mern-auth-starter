import mongoose, { Schema, type Document } from "mongoose";
import { VerificationEnum } from "../../enums/verificationCode.enum.js";
import { generateUniqueCode } from "../../utils/uuid.js";

export interface VerificationCodeDocument extends Document {
  userId: Schema.Types.ObjectId;
  code: string;
  type: VerificationEnum;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new Schema<VerificationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    default: generateUniqueCode,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(VerificationEnum),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>(
  "VerificationCode",
  verificationCodeSchema,
  "verification_codes",
);

export default VerificationCodeModel;
