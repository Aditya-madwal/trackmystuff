import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IDSAQuestion extends Document {
  userId: string;
  title: string;
  problemStatement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  strategy: string;
  codeImplementation: string;
  language: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DSAQuestionSchema = new Schema<IDSAQuestion>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    problemStatement: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    strategy: { type: String, default: '' },
    codeImplementation: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const DSAQuestion = models.DSAQuestion || model<IDSAQuestion>('DSAQuestion', DSAQuestionSchema);
export default DSAQuestion;
