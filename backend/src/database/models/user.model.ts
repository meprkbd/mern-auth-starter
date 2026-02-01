import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../../utils/bcrypt.js";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(value: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
});

userSchema.methods.comparePassword = async function (value: string) {
  return compareValue(value, this.password);
};

userSchema.set("toJSON", {
  transform: function (doc, ret: { password?: string }) {
    delete ret.password;
    return ret;
  },
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
