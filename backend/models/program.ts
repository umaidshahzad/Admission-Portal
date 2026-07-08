import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
  name: string;
  degreeLevel: 'Bachelors' | 'Masters' | 'PhD';
  department: string;
  capacity: number;
  weightageCriteria: {
    entryTestWeight: number; // Percentage (e.g., 50)
    academicWeight: number;  // Percentage (e.g., 50)
  };
  minimumCriteria: {
    minAcademicScore: number; // HSSC % for BS, CGPA for MS/PhD
    minEntryTestScore: number; // Minimum required to pass entry test
  };
}

const ProgramSchema: Schema = new Schema({
  name: { type: String, required: true },
  degreeLevel: { type: String, enum: ['Bachelors', 'Masters', 'PhD'], required: true },
  department: { type: String, required: true },
  capacity: { type: Number, required: true },
  weightageCriteria: {
    entryTestWeight: { type: Number, required: true },
    academicWeight: { type: Number, required: true }
  },
  minimumCriteria: {
    minAcademicScore: { type: Number, required: true },
    minEntryTestScore: { type: Number, required: true }
  }
});

export const Program = mongoose.model<IProgram>('Program', ProgramSchema);
