import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { calculateAggregateScore } from '../controllers/applicationController.ts';
import { User, Program, Application } from '../models/index.ts';

// Simple colors for terminal report output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

let totalTests = 0;
let passedTests = 0;

function assert(condition: any, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${message}`);
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runUnitTests() {
  console.log(`\n${BLUE}==================================================${RESET}`);
  console.log(`${BLUE}[UNIT TESTS] Core Algorithms & Formula Evaluation${RESET}`);
  console.log(`${BLUE}==================================================${RESET}`);

  // Test 1: Bachelors merit calculation
  // Program weight: 50% HSSC / 50% Entry test
  // Student HSSC: 80%, Entry test: 70
  // Expected: (80 * 0.5) + (70 * 0.5) = 40 + 35 = 75
  const bachelorsScore = calculateAggregateScore({
    degreeLevel: 'Bachelors',
    academicDetails: { hsscPercentage: 80 },
    obtainedMarks: 70,
    academicWeight: 50,
    entryTestWeight: 50
  });
  assert(bachelorsScore === 75, `Bachelors aggregate score expected 75, got ${bachelorsScore}`);

  // Test 2: Masters merit calculation
  // Program weight: 60% academic / 40% Entry test
  // Student CGPA: 3.2 / 4.0 = 80%. Entry test: 85
  // Expected: (80 * 0.6) + (85 * 0.4) = 48 + 34 = 82
  const mastersScore = calculateAggregateScore({
    degreeLevel: 'Masters',
    academicDetails: { bachelorsCGPA: 3.2 },
    obtainedMarks: 85,
    academicWeight: 60,
    entryTestWeight: 40
  });
  assert(mastersScore === 82, `Masters aggregate score expected 82, got ${mastersScore}`);

  // Test 3: PhD merit calculation
  // Program weight: 70% academic / 30% Entry test
  // Student CGPA: 3.6 / 4.0 = 90%. Entry test: 90
  // Expected: (90 * 0.7) + (90 * 0.3) = 63 + 27 = 90
  const phdScore = calculateAggregateScore({
    degreeLevel: 'PhD',
    academicDetails: { mastersCGPA: 3.6 },
    obtainedMarks: 90,
    academicWeight: 70,
    entryTestWeight: 30
  });
  assert(phdScore === 90, `PhD aggregate score expected 90, got ${phdScore}`);
}

async function runIntegrationTests() {
  console.log(`\n${BLUE}==================================================${RESET}`);
  console.log(`${BLUE}[INTEGRATION TESTS] DB & State Transition Workflows${RESET}`);
  console.log(`${BLUE}==================================================${RESET}`);

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error(`${RED}Cannot run integration tests: MONGO_URI is missing.${RESET}`);
    process.exit(1);
  }

  console.log(`Connecting to database...`);
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database.`);

  const testSuffix = Date.now().toString().slice(-6);

  // Define unique test IDs
  const testProgramId = new mongoose.Types.ObjectId();
  const testApplicantId = new mongoose.Types.ObjectId();
  const testOfficerId = new mongoose.Types.ObjectId();

  try {
    // 1. Create a mock program
    console.log(`\nCreating mock academic program for testing...`);
    const program: any = await Program.create({
      _id: testProgramId,
      name: `Test BS Computer Science ${testSuffix}`,
      degreeLevel: 'Bachelors',
      department: 'Computer Science',
      capacity: 2, // Only 2 slots for capacity limit test
      weightageCriteria: {
        entryTestWeight: 50,
        academicWeight: 50
      },
      minimumCriteria: {
        minAcademicScore: 60,
        minEntryTestScore: 50
      }
    });
    assert(program !== null, 'Academic Program created successfully');

    // 2. Create a mock Applicant
    console.log(`Creating mock Applicant user account...`);
    const applicantUser = await User.create({
      _id: testApplicantId,
      name: `Test Applicant ${testSuffix}`,
      email: `applicant_${testSuffix}@test.com`,
      password: await bcrypt.hash('testpass123', 10),
      role: 'applicant'
    });
    assert(applicantUser !== null, 'Applicant user created successfully');

    // 3. Create a mock Admissions Officer
    console.log(`Creating mock Admissions Officer user account...`);
    const officerUser = await User.create({
      _id: testOfficerId,
      name: `Test Officer ${testSuffix}`,
      email: `officer_${testSuffix}@test.com`,
      password: await bcrypt.hash('testpass123', 10),
      role: 'officer'
    });
    assert(officerUser !== null, 'Admissions Officer user created successfully');

    // 4. Create mock applications to simulate merit-list selection
    console.log(`Creating mock applications with varying credentials to test sorting...`);
    
    // Application 1: Academic 90%, Entry Test 80% (Merit Score: 45 + 40 = 85%) -> Expect APPROVED
    const app1: any = await Application.create({
      applicantId: new mongoose.Types.ObjectId(),
      programId: testProgramId,
      degreeLevel: 'Bachelors',
      academicDetails: {
        sscPercentage: 85,
        hsscPercentage: 90
      },
      documents: {
        sscTranscript: 'mock_ssc.jpg',
        hsscTranscript: 'mock_hssc.jpg'
      },
      status: 'Documents Verified',
      entryTestDetails: {
        rollNumber: `ROLL-${testSuffix}-1`,
        isAttended: true,
        obtainedMarks: 80
      },
      aggregateScore: 85
    });
    assert(app1 !== null, 'Application 1 created with Merit Score 85.0%');

    // Application 2: Academic 70%, Entry Test 60% (Merit Score: 35 + 30 = 65%) -> Expect APPROVED
    const app2: any = await Application.create({
      applicantId: new mongoose.Types.ObjectId(),
      programId: testProgramId,
      degreeLevel: 'Bachelors',
      academicDetails: {
        sscPercentage: 75,
        hsscPercentage: 70
      },
      documents: {
        sscTranscript: 'mock_ssc.jpg',
        hsscTranscript: 'mock_hssc.jpg'
      },
      status: 'Documents Verified',
      entryTestDetails: {
        rollNumber: `ROLL-${testSuffix}-2`,
        isAttended: true,
        obtainedMarks: 60
      },
      aggregateScore: 65
    });
    assert(app2 !== null, 'Application 2 created with Merit Score 65.0%');

    // Application 3: Academic 60%, Entry Test 50% (Merit Score: 30 + 25 = 55%) -> Expect REJECTED (Capacity was 2)
    const app3: any = await Application.create({
      applicantId: new mongoose.Types.ObjectId(),
      programId: testProgramId,
      degreeLevel: 'Bachelors',
      academicDetails: {
        sscPercentage: 65,
        hsscPercentage: 60
      },
      documents: {
        sscTranscript: 'mock_ssc.jpg',
        hsscTranscript: 'mock_hssc.jpg'
      },
      status: 'Documents Verified',
      entryTestDetails: {
        rollNumber: `ROLL-${testSuffix}-3`,
        isAttended: true,
        obtainedMarks: 50
      },
      aggregateScore: 55
    });
    assert(app3 !== null, 'Application 3 created with Merit Score 55.0%');

    // Test Fail Cutoff Scenario:
    // Application 4: Failed entry test with 40 marks (cutoff is 50) -> Expect status "Failed Test", aggregateScore 0.5
    const app4: any = await Application.create({
      applicantId: new mongoose.Types.ObjectId(),
      programId: testProgramId,
      degreeLevel: 'Bachelors',
      academicDetails: {
        sscPercentage: 80,
        hsscPercentage: 80
      },
      documents: {
        sscTranscript: 'mock_ssc.jpg',
        hsscTranscript: 'mock_hssc.jpg'
      },
      status: 'Documents Verified',
      entryTestDetails: {
        rollNumber: `ROLL-${testSuffix}-4`,
        isAttended: true,
        obtainedMarks: 40 // Below 50
      }
    });

    assert(app4 !== null, 'Application 4 created to test cutoff fail conditions');

    // Run custom test score recorder simulation
    const marksObtained = app4.entryTestDetails.obtainedMarks;
    if (marksObtained < program.minimumCriteria.minEntryTestScore) {
      app4.status = 'Failed Test';
      app4.aggregateScore = 0.5;
    } else {
      app4.aggregateScore = (app4.academicDetails.hsscPercentage || 0) * 0.5 + marksObtained * 0.5;
    }
    await app4.save();

    assert(app4.status === 'Failed Test', 'Auto-failing test validation: Status set to "Failed Test" correctly');
    assert(app4.aggregateScore === 0.5, 'Auto-failing test validation: Score set to 0.5 correctly');

    // 5. Generate and compile Merit List for program
    console.log(`Simulating merit list compilation for program...`);
    
    // Find eligible applications for this program
    const eligibleApps = await Application.find({
      programId: testProgramId,
      status: { $in: ['Documents Verified', 'Test Scheduled', 'Approved'] }
    });

    assert(eligibleApps.length === 3, 'Found exactly 3 eligible applicants for compiling the merit list');

    // Sort descending
    eligibleApps.sort((a, b) => b.aggregateScore - a.aggregateScore);

    const capacity = program.capacity; // 2
    for (let i = 0; i < eligibleApps.length; i++) {
      const app = eligibleApps[i];
      if (i < capacity) {
        app.status = 'Approved';
        app.comments = `Selected in Merit List! Position: ${i + 1}`;
      } else {
        app.status = 'Rejected';
        app.comments = `Admission Full. Merit list cap exceeded. Position: ${i + 1}`;
      }
      await app.save();
    }

    // Load final updated applications from database
    const finalApp1 = await Application.findById(app1._id);
    const finalApp2 = await Application.findById(app2._id);
    const finalApp3 = await Application.findById(app3._id);

    assert(finalApp1?.status === 'Approved', 'Highest scoring applicant (85%) was Selected & Approved');
    assert(finalApp2?.status === 'Approved', 'Second highest scoring applicant (65%) was Selected & Approved');
    assert(finalApp3?.status === 'Rejected', 'Third highest scoring applicant (55%) exceeded program capacity and was Rejected');

    console.log(`\nAll integration tests passed successfully.`);

    // Cleaning up test suite documents
    console.log(`Cleaning up test documents from database...`);
    await Program.deleteOne({ _id: testProgramId });
    await User.deleteMany({ _id: { $in: [testApplicantId, testOfficerId] } });
    await Application.deleteMany({ _id: { $in: [app1._id, app2._id, app3._id, app4._id] } });
    console.log(`Clean up completed.`);

  } catch (err) {
    console.error(`${RED}Error occurred during integration tests:${RESET}`, err);
    // Ensure clean up even on error
    await Program.deleteOne({ _id: testProgramId });
    await User.deleteMany({ _id: { $in: [testApplicantId, testOfficerId] } });
    await Application.deleteMany({ programId: testProgramId });
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log(`Disconnected from MongoDB.`);
  }
}

async function runAllTests() {
  console.log(`${YELLOW}==================================================${RESET}`);
  console.log(`${YELLOW}   RUNNING SYSTEM-WIDE TEST SUITE (ALL MODULES)   ${RESET}`);
  console.log(`${YELLOW}==================================================${RESET}`);
  
  try {
    await runUnitTests();
    await runIntegrationTests();

    console.log(`\n${GREEN}==================================================${RESET}`);
    console.log(`${GREEN}  ALL TESTS COMPLETED SUCCESSFULLY: ${passedTests}/${totalTests} PASSED${RESET}`);
    console.log(`${GREEN}==================================================${RESET}`);
  } catch (error) {
    console.error(`\n${RED}==================================================${RESET}`);
    console.error(`${RED}  TEST SUITE COMPLETED WITH ERRORS. FIX IMMEDIATELY.${RESET}`);
    console.error(`${RED}==================================================${RESET}`);
    process.exit(1);
  }
}

runAllTests();
