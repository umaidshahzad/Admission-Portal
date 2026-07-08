export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'applicant' | 'officer' | 'dept_head' | 'admin';
  createdAt: string;
}

export interface Program {
  _id: string;
  name: string;
  degreeLevel: 'Bachelors' | 'Masters' | 'PhD';
  department: string;
  capacity: number;
  weightageCriteria: {
    entryTestWeight: number;
    academicWeight: number;
  };
  minimumCriteria: {
    minAcademicScore: number;
    minEntryTestScore: number;
  };
}

export interface AcademicDetails {
  sscPercentage?: number;
  hsscPercentage?: number;
  bachelorsCGPA?: number;
  mastersCGPA?: number;
}

export interface EntryTestDetails {
  rollNumber?: string;
  obtainedMarks: number;
  isAttended: boolean;
}

export interface Documents {
  sscTranscript?: string;
  hsscTranscript?: string;
  bachelorsTranscript?: string;
  mastersTranscript?: string;
  researchProposal?: string;
}

export interface Application {
  _id: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  programId: Program | string;
  degreeLevel: 'Bachelors' | 'Masters' | 'PhD';
  academicDetails: AcademicDetails;
  entryTestDetails: EntryTestDetails;
  documents: Documents;
  aggregateScore: number;
  status: 'Pending' | 'Documents Verified' | 'Test Scheduled' | 'Failed Test' | 'Approved' | 'Rejected';
  comments?: string;
  createdAt: string;
}

export interface GlobalSettings {
  admissionsOpen: boolean;
  deadline: string;
  announcement?: string;
}
