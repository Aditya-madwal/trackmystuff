import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);
export default User;
