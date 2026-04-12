import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IResource extends Document {
  userId: string;
  title: string;
  desc: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const Resource = models.Resource || model<IResource>('Resource', ResourceSchema);
export default Resource;
