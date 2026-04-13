import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ITask extends Document {
  userId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  domain: "dsa" | "system-design" | "frontend" | "backend";
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    domain: {
      type: String,
      enum: [
        "dsa",
        "tips",
        "system design",
        "interview",
        "job",
        "general",
        "other",
      ],
      required: true,
    },
    dueDate: { type: String, default: "" },
  },
  { timestamps: true },
);

const Task = models.Task || model<ITask>("Task", TaskSchema);
export default Task;
