import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISystemDesign extends Document {
  userId: string;
  title: string;
  content: string;
  diagrams: string[];
  references: { title: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const SystemDesignSchema = new Schema<ISystemDesign>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    diagrams: { type: [String], default: [] },
    references: {
      type: [
        {
          title: { type: String },
          url: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const SystemDesign = models.SystemDesign || model<ISystemDesign>('SystemDesign', SystemDesignSchema);
export default SystemDesign;
