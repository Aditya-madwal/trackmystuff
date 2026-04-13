import mongoose, { Schema, Document, models, model } from 'mongoose';

export type NoteCategory = 'dsa' | 'tips' | 'system design' | 'interview' | 'job' | 'general' | 'other';

export interface INote extends Document {
  userId: string;
  title: string;
  description: string;
  category: NoteCategory;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['dsa', 'tips', 'system design', 'interview', 'job', 'general', 'other'],
      default: 'general',
    },
  },
  { timestamps: true }
);

const Note = models.Note || model<INote>('Note', NoteSchema);
export default Note;
