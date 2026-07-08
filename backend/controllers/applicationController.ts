import { Response } from 'express';
import { Application, Program, User } from '../models/index.ts';
import { uploadToCloudinary } from '../config/cloudinary.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

interface CalculateParams {
  degreeLevel: 'Bachelors' | 'Masters' | 'PhD';
  academicDetails: {
    sscPercentage?: number;
    hsscPercentage?: number;
    bachelorsCGPA?: number;
    mastersCGPA?: number;
  };
  obtainedMarks: number;
  academicWeight: number;
  entryTestWeight: number;
}

/**
 * Calculates aggregate score based on degree level and weights.
 * Normalizes academic scores to 100-scale percentage.
 */
export function calculateAggregateScore(params: CalculateParams): number {
  const { degreeLevel, academicDetails, obtainedMarks, academicWeight, entryTestWeight } = params;
  
  // Normalized academic percentage (0-100)
  let academicPercentage = 0;

  if (degreeLevel === 'Bachelors') {
    // Academic score is directly HSSC percentage
    academicPercentage = academicDetails.hsscPercentage || 0;
  } else if (degreeLevel === 'Masters') {
    // Translate CGPA into percentage score: (CGPA / 4.0) * 100
    const cgpa = academicDetails.bachelorsCGPA || 0;
    academicPercentage = (cgpa / 4.0) * 100;
  } else if (degreeLevel === 'PhD') {
    // Average CGPAs for PhD or bachelors/masters. We will use the mastersCGPA primarily or average them.
    // Standard approach: Use Masters CGPA for PhD, or average of Bachelors + Masters CGPA.
    // Let's use Masters CGPA as primary, normalized to 100.
    const mastersCgpa = academicDetails.mastersCGPA || 0;
    academicPercentage = (mastersCgpa / 4.0) * 100;
  }

  // Cap academic percentage at 100
  if (academicPercentage > 100) academicPercentage = 100;

  // Entry test obtained marks (out of 100)
  const entryTestPercentage = obtainedMarks; // Assumed out of 100

  // Calculate final aggregate
  const score = (academicPercentage * (academicWeight / 100)) + (entryTestPercentage * (entryTestWeight / 100));
  
  // Round to 3 decimal places for absolute accuracy
  return Math.round(score * 1000) / 1000;
}

/**
 * Submit an application (Applicant only)
 */
export async function apply(req: AuthRequest, res: Response) {
  try {
    const { programId, sscPercentage, hsscPercentage, bachelorsCGPA, mastersCGPA } = req.body;

    if (!programId) {
      return res.status(400).json({ message: 'Target academic program is required.' });
    }

    // Check if the user already applied to this program
    const existingApp = await Application.findOne({ 
      applicantId: req.user?.id, 
      programId 
    });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already submitted an application for this program.' });
    }

    // Retrieve program details
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'The selected program does not exist.' });
    }

    const { degreeLevel } = program;

    // Validate and build academic details
    const academicDetails: any = {};
    const documents: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (degreeLevel === 'Bachelors') {
      if (!sscPercentage || !hsscPercentage) {
        return res.status(400).json({ message: 'SSC and HSSC percentages are required for Bachelors admissions.' });
      }
      academicDetails.sscPercentage = Number(sscPercentage);
      academicDetails.hsscPercentage = Number(hsscPercentage);

      // Verify files
      if (!files || !files['sscTranscript'] || !files['hsscTranscript']) {
        return res.status(400).json({ message: 'Both SSC and HSSC transcript documents are required.' });
      }
    } else if (degreeLevel === 'Masters') {
      if (!bachelorsCGPA) {
        return res.status(400).json({ message: 'Bachelors CGPA is required for Masters admissions.' });
      }
      academicDetails.bachelorsCGPA = Number(bachelorsCGPA);
      if (academicDetails.bachelorsCGPA > 4.0) {
        return res.status(400).json({ message: 'Bachelors CGPA cannot exceed 4.0.' });
      }

      // Verify files
      if (!files || !files['bachelorsTranscript']) {
        return res.status(400).json({ message: 'Bachelors transcript document is required.' });
      }
    } else if (degreeLevel === 'PhD') {
      if (!bachelorsCGPA || !mastersCGPA) {
        return res.status(400).json({ message: 'Bachelors and Masters CGPA are required for PhD admissions.' });
      }
      academicDetails.bachelorsCGPA = Number(bachelorsCGPA);
      academicDetails.mastersCGPA = Number(mastersCGPA);
      if (academicDetails.bachelorsCGPA > 4.0 || academicDetails.mastersCGPA > 4.0) {
        return res.status(400).json({ message: 'CGPAs cannot exceed 4.0.' });
      }

      // Verify files
      if (!files || !files['mastersTranscript'] || !files['researchProposal']) {
        return res.status(400).json({ message: 'Masters transcript and Research Proposal PDF are required for PhD.' });
      }
    }

    // Upload files to Cloudinary
    if (files) {
      const uploadPromises = Object.keys(files).map(async (fieldName) => {
        const fileArray = files[fieldName];
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          const url = await uploadToCloudinary(file.buffer, `${req.user?.id}/${fieldName}`, file.mimetype);
          documents[fieldName] = url;
        }
      });
      await Promise.all(uploadPromises);
    }

    // Generate a unique entrance exam Roll Number
    // Format: ADM-[Year]-[Random 4-Digit String]
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const rollNumber = `ADM-${currentYear}-${randomSuffix}`;

    // Create application
    const application = await Application.create({
      applicantId: req.user?.id,
      programId,
      degreeLevel,
      academicDetails,
      entryTestDetails: {
        rollNumber,
        obtainedMarks: 0,
        isAttended: false
      },
      documents,
      aggregateScore: 0,
      status: 'Pending'
    });

    return res.status(201).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return res.status(500).json({ message: 'Internal server error during application submission.' });
  }
}

/**
 * Get all applications submitted by the current user (Applicant only)
 */
export async function getMyApplications(req: AuthRequest, res: Response) {
  try {
    const applications = await Application.find({ applicantId: req.user?.id })
      .populate('programId')
      .sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to retrieve applications.' });
  }
}

/**
 * Get all applications (Admin, Officer, Dept Head)
 */
export async function getApplications(req: AuthRequest, res: Response) {
  try {
    const applications = await Application.find({})
      .populate('applicantId', 'name email')
      .populate('programId')
      .sort({ aggregateScore: -1, createdAt: -1 });

    return res.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Failed to retrieve applications.' });
  }
}

/**
 * Verify documents of an application (Admissions Officer & Admin only)
 */
export async function verifyDocuments(req: AuthRequest, res: Response) {
  try {
    const { status, comments } = req.body;
    const applicationId = req.params.id;

    if (!['Documents Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status. Must be "Documents Verified" or "Rejected".' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = status;
    application.comments = comments || '';

    // If documents are verified, make sure it moves to a state allowing test scheduling/input
    if (status === 'Documents Verified') {
      application.status = 'Documents Verified';
    }

    await application.save();

    return res.json({
      message: `Application successfully updated to ${status}.`,
      application
    });
  } catch (error: any) {
    console.error('Document verification error:', error);
    return res.status(500).json({ message: 'Failed to complete document verification.' });
  }
}

/**
 * Update entry test marks for an application (Dept Head and Admin only)
 */
export async function updateTestScores(req: AuthRequest, res: Response) {
  try {
    const { obtainedMarks, isAttended } = req.body;
    const applicationId = req.params.id;

    if (obtainedMarks === undefined) {
      return res.status(400).json({ message: 'Obtained entry test marks are required.' });
    }

    // Find application and populate program
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const program = await Program.findById(application.programId);
    if (!program) {
      return res.status(404).json({ message: 'Associated academic program not found.' });
    }

    const marks = Number(obtainedMarks);
    if (marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Entry test marks must be between 0 and 100.' });
    }

    // Update test state
    application.entryTestDetails.obtainedMarks = marks;
    application.entryTestDetails.isAttended = isAttended === undefined ? true : !!isAttended;

    // RULE: If entry test obtained marks fall below the passing mark:
    // status flips to 'Failed Test' and aggregateScore is hardcoded to 0.5.
    if (marks < program.minimumCriteria.minEntryTestScore) {
      application.status = 'Failed Test';
      application.aggregateScore = 0.5;
      application.comments = `Failed Entry Test. Minimum passing score required: ${program.minimumCriteria.minEntryTestScore}`;
    } else {
      // Calculate dynamic aggregate score
      const aggScore = calculateAggregateScore({
        degreeLevel: application.degreeLevel,
        academicDetails: application.academicDetails,
        obtainedMarks: marks,
        academicWeight: program.weightageCriteria.academicWeight,
        entryTestWeight: program.weightageCriteria.entryTestWeight
      });

      application.aggregateScore = aggScore;
      application.status = 'Test Scheduled'; // Move to scheduled/passed test evaluation state
      application.comments = 'Passed entrance exam. Score calculated successfully.';
    }

    await application.save();

    return res.json({
      message: 'Entry test marks recorded and aggregate score calculated successfully!',
      application
    });
  } catch (error: any) {
    console.error('Test score update error:', error);
    return res.status(500).json({ message: 'Failed to record entry test score.' });
  }
}

/**
 * Generate and lock merit list for a program (Dept Head and Admin only)
 */
export async function generateMeritList(req: AuthRequest, res: Response) {
  try {
    const programId = req.params.programId;

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    // Fetch all eligible applications
    const applications = await Application.find({
      programId,
      status: { $in: ['Documents Verified', 'Test Scheduled', 'Approved'] }
    });

    if (applications.length === 0) {
      return res.status(400).json({ 
        message: 'No eligible applicants found for this program to compile the merit list.' 
      });
    }

    // Sort by aggregate score in descending order
    applications.sort((a, b) => b.aggregateScore - a.aggregateScore);

    const capacity = program.capacity;
    const updatedApps = [];

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      if (i < capacity) {
        app.status = 'Approved';
        app.comments = `Selected in Merit List! Position: ${i + 1}`;
      } else {
        app.status = 'Rejected';
        app.comments = `Admission Full. Merit list cap exceeded. Position: ${i + 1}`;
      }
      await app.save();
      updatedApps.push(app);
    }

    return res.json({
      message: `Successfully generated and locked merit list for ${program.name}. Assigned ${Math.min(capacity, applications.length)} seats out of ${capacity}.`,
      applications: updatedApps
    });
  } catch (error: any) {
    console.error('Merit list generation error:', error);
    return res.status(500).json({ message: 'Failed to generate merit list.' });
  }
}
