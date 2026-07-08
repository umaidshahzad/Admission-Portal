import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  applicantId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  degreeLevel: 'Bachelors' | 'Masters' | 'PhD';
  academicDetails: {
    sscPercentage?: number;
    hsscPercentage?: number;
    bachelorsCGPA?: number;
    mastersCGPA?: number;
  };
  entryTestDetails: {
    rollNumber?: string;
    obtainedMarks: number;
    isAttended: boolean;
  };
  documents: {
    sscTranscript?: string;
    hsscTranscript?: string;
    bachelorsTranscript?: string;
    mastersTranscript?: string;
    researchProposal?: string;
  };
  aggregateScore: number;
  status: 'Pending' | 'Documents Verified' | 'Test Scheduled' | 'Failed Test' | 'Approved' | 'Rejected';
  comments?: string;
}

const ApplicationSchema: Schema = new Schema({
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  degreeLevel: { type: String, enum: ['Bachelors', 'Masters', 'PhD'], required: true },
  
  academicDetails: {
    sscPercentage: { type: Number },
    hsscPercentage: { type: Number },
    bachelorsCGPA: { type: Number },
    mastersCGPA: { type: Number }
  },
  
  entryTestDetails: {
    rollNumber: { type: String, sparse: true },
    obtainedMarks: { type: Number, default: 0 },
    isAttended: { type: Boolean, default: false }
  },

  documents: {
    sscTranscript: { type: String },
    hsscTranscript: { type: String },
    bachelorsTranscript: { type: String },
    mastersTranscript: { type: String },
    researchProposal: { type: String }
  },
  
  aggregateScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Documents Verified', 'Test Scheduled', 'Failed Test', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  comments: { type: String }
});

// Sparse compound indexing or single indexing for unique rollNumber to avoid conflicts
ApplicationSchema.index({ 'entryTestDetails.rollNumber': 1 }, { unique: true, sparse: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
