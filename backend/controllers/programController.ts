import { Response } from 'express';
import { Program } from '../models/index.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

/**
 * Get all available academic programs
 */
export async function getPrograms(req: AuthRequest, res: Response) {
  try {
    const programs = await Program.find({}).sort({ name: 1 });
    return res.json({ programs });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return res.status(500).json({ message: 'Failed to retrieve academic programs.' });
  }
}

/**
 * Get details of a single program
 */
export async function getProgramById(req: AuthRequest, res: Response) {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }
    return res.json({ program });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving program.' });
  }
}

/**
 * Create a new academic program (Admin and Dept Head only)
 */
export async function createProgram(req: AuthRequest, res: Response) {
  try {
    const { name, degreeLevel, department, capacity, weightageCriteria, minimumCriteria } = req.body;

    if (!name || !degreeLevel || !department || capacity === undefined || !weightageCriteria || !minimumCriteria) {
      return res.status(400).json({ message: 'All program fields are required.' });
    }

    const { entryTestWeight, academicWeight } = weightageCriteria;
    const { minAcademicScore, minEntryTestScore } = minimumCriteria;

    if (entryTestWeight + academicWeight !== 100) {
      return res.status(400).json({ message: 'The sum of entry test and academic weights must equal 100%.' });
    }

    const newProgram = await Program.create({
      name,
      degreeLevel,
      department,
      capacity: Number(capacity),
      weightageCriteria: {
        entryTestWeight: Number(entryTestWeight),
        academicWeight: Number(academicWeight)
      },
      minimumCriteria: {
        minAcademicScore: Number(minAcademicScore),
        minEntryTestScore: Number(minEntryTestScore)
      }
    });

    return res.status(201).json({
      message: 'Academic program created successfully.',
      program: newProgram
    });
  } catch (error: any) {
    console.error('Error creating program:', error);
    return res.status(500).json({ message: 'Failed to create academic program.' });
  }
}

/**
 * Update an existing academic program
 */
export async function updateProgram(req: AuthRequest, res: Response) {
  try {
    const { name, degreeLevel, department, capacity, weightageCriteria, minimumCriteria } = req.body;
    const programId = req.params.id;

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    if (weightageCriteria) {
      const { entryTestWeight, academicWeight } = weightageCriteria;
      if (entryTestWeight !== undefined && academicWeight !== undefined) {
        if (Number(entryTestWeight) + Number(academicWeight) !== 100) {
          return res.status(400).json({ message: 'The sum of entry test and academic weights must equal 100%.' });
        }
      }
    }

    if (name) program.name = name;
    if (degreeLevel) program.degreeLevel = degreeLevel;
    if (department) program.department = department;
    if (capacity !== undefined) program.capacity = Number(capacity);
    
    if (weightageCriteria) {
      program.weightageCriteria = {
        entryTestWeight: Number(weightageCriteria.entryTestWeight),
        academicWeight: Number(weightageCriteria.academicWeight)
      };
    }

    if (minimumCriteria) {
      program.minimumCriteria = {
        minAcademicScore: Number(minimumCriteria.minAcademicScore),
        minEntryTestScore: Number(minimumCriteria.minEntryTestScore)
      };
    }

    await program.save();

    return res.json({
      message: 'Academic program updated successfully.',
      program
    });
  } catch (error: any) {
    console.error('Error updating program:', error);
    return res.status(500).json({ message: 'Failed to update academic program.' });
  }
}

/**
 * Delete an academic program
 */
export async function deleteProgram(req: AuthRequest, res: Response) {
  try {
    const programId = req.params.id;
    const deletedProgram = await Program.findByIdAndDelete(programId);
    
    if (!deletedProgram) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    return res.json({ message: 'Academic program deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting program:', error);
    return res.status(500).json({ message: 'Failed to delete academic program.' });
  }
}
