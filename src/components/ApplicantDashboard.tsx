import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Program } from '../types.ts';
import { 
  FileText, Plus, HelpCircle, FileCheck, Landmark, Upload, 
  Trash2, ShieldCheck, UserCheck, BarChart3, Clock, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export const ApplicantDashboard: React.FC = () => {
  const { 
    myApplications, programs, submitApplication, fetchMyApplications, isLoading, showToast 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'faq'>('overview');

  // Load applicant data on mount
  useEffect(() => {
    fetchMyApplications();
  }, []);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Form Fields
  const [sscPercentage, setSscPercentage] = useState('');
  const [hsscPercentage, setHsscPercentage] = useState('');
  const [bachelorsCGPA, setBachelorsCGPA] = useState('');
  const [mastersCGPA, setMastersCGPA] = useState('');

  // File Objects
  const [sscFile, setSscFile] = useState<File | null>(null);
  const [hsscFile, setHsscFile] = useState<File | null>(null);
  const [bachFile, setBachFile] = useState<File | null>(null);
  const [mastFile, setMastFile] = useState<File | null>(null);
  const [propFile, setPropFile] = useState<File | null>(null);

  // Handle program selection changes (Step 1)
  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
    const prog = programs.find((p) => p._id === programId) || null;
    setSelectedProgram(prog);
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!selectedProgramId) {
        showToast('Please select a program to continue.', 'error');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      // Validate step 2 conditional inputs
      if (selectedProgram?.degreeLevel === 'Bachelors') {
        if (!sscPercentage || !hsscPercentage) {
          showToast('SSC and HSSC marks are mandatory.', 'error');
          return;
        }
        if (!sscFile || !hsscFile) {
          showToast('Please upload both SSC and HSSC physical transcripts.', 'error');
          return;
        }
      } else if (selectedProgram?.degreeLevel === 'Masters') {
        if (!bachelorsCGPA) {
          showToast('Bachelors CGPA is mandatory.', 'error');
          return;
        }
        if (!bachFile) {
          showToast('Please upload your Bachelors degree transcript.', 'error');
          return;
        }
      } else if (selectedProgram?.degreeLevel === 'PhD') {
        if (!bachelorsCGPA || !mastersCGPA) {
          showToast('Bachelors and Masters CGPA scores are mandatory.', 'error');
          return;
        }
        if (!bachFile || !mastFile || !propFile) {
          showToast('Please upload your Bachelors, Masters transcripts, and the PhD Research Proposal PDF.', 'error');
          return;
        }
      }
      setWizardStep(3);
    }
  };

  const handlePrevStep = () => {
    setWizardStep((p) => Math.max(1, p - 1));
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedProgramId('');
    setSelectedProgram(null);
    setSscPercentage('');
    setHsscPercentage('');
    setBachelorsCGPA('');
    setMastersCGPA('');
    setSscFile(null);
    setHsscFile(null);
    setBachFile(null);
    setMastFile(null);
    setPropFile(null);
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    const formData = new FormData();
    formData.append('programId', selectedProgramId);
    formData.append('degreeLevel', selectedProgram.degreeLevel);

    if (selectedProgram.degreeLevel === 'Bachelors') {
      formData.append('sscPercentage', sscPercentage);
      formData.append('hsscPercentage', hsscPercentage);
      if (sscFile) formData.append('sscTranscript', sscFile);
      if (hsscFile) formData.append('hsscTranscript', hsscFile);
    } else if (selectedProgram.degreeLevel === 'Masters') {
      formData.append('bachelorsCGPA', bachelorsCGPA);
      if (sscFile) formData.append('sscTranscript', sscFile);
      if (hsscFile) formData.append('hsscTranscript', hsscFile);
      if (bachFile) formData.append('bachelorsTranscript', bachFile);
    } else if (selectedProgram.degreeLevel === 'PhD') {
      formData.append('bachelorsCGPA', bachelorsCGPA);
      formData.append('mastersCGPA', mastersCGPA);
      if (sscFile) formData.append('sscTranscript', sscFile);
      if (hsscFile) formData.append('hsscTranscript', hsscFile);
      if (bachFile) formData.append('bachelorsTranscript', bachFile);
      if (mastFile) formData.append('mastersTranscript', mastFile);
      if (propFile) formData.append('researchProposal', propFile);
    }

    const success = await submitApplication(formData);
    if (success) {
      resetWizard();
      setActiveTab('overview');
    }
  };

  // Status badges color parser
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-50 text-amber-800 border border-amber-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Under Review</span>;
      case 'Documents Verified':
        return <span className="bg-blue-50 text-blue-800 border border-blue-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Docs Verified</span>;
      case 'Test Scheduled':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Exam Cleared</span>;
      case 'Failed Test':
        return <span className="bg-red-50 text-red-800 border border-red-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Failed Test</span>;
      case 'Approved':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-bounce">Admitted / Selected</span>;
      case 'Rejected':
        return <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Closed / Waitlist Full</span>;
      default:
        return <span className="bg-gray-50 text-gray-800 border border-gray-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div id="applicant-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Upper Welcome Jumbotron */}
      <div className="bg-white border-2 border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-academic-charcoal mb-1">
            Applicant Portal & Application Engine
          </h2>
          <p className="text-gray-500 text-sm max-w-xl">
            From this workspace you can apply for new degree majors, track document verification stages, review entrance test scheduling, and monitor merit lists dynamically.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('apply')}
          className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2.5 px-5 rounded-md text-sm uppercase tracking-wider shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Apply to a Program</span>
        </button>
      </div>

      {/* Main Grid: Left Navigation Rail, Right Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Rail */}
        <div className="lg:col-span-1 space-y-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center space-x-3 border ${activeTab === 'overview' ? 'bg-academic-crimson text-white border-academic-crimson shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
          >
            <FileText className="h-4 w-4" />
            <span>My Applications ({myApplications.length})</span>
          </button>
          
          <button
            onClick={() => {
              resetWizard();
              setActiveTab('apply');
            }}
            className={`w-full text-left px-4 py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center space-x-3 border ${activeTab === 'apply' ? 'bg-academic-crimson text-white border-academic-crimson shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
          >
            <Plus className="h-4 w-4" />
            <span>Apply Online Wizard</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`w-full text-left px-4 py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center space-x-3 border ${activeTab === 'faq' ? 'bg-academic-crimson text-white border-academic-crimson shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Admissions FAQ</span>
          </button>
        </div>

        {/* Right Active Workspaces */}
        <div className="lg:col-span-3">

          {/* Tab 1: Applications Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-xl text-academic-charcoal mb-1">
                Your Filed Applications
              </h3>
              
              {myApplications.length > 0 ? (
                <div className="space-y-6">
                  {myApplications.map((app) => {
                    const prog = app.programId as Program;
                    return (
                      <div key={app._id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Header Box */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-widest text-academic-crimson font-display block mb-1">
                              {app.degreeLevel} Admission File
                            </span>
                            <h4 className="font-display font-bold text-lg text-academic-charcoal leading-snug">
                              {prog?.name || 'Academic Degree'}
                            </h4>
                          </div>
                          <div>{getStatusBadge(app.status)}</div>
                        </div>

                        {/* Middle Info Block */}
                        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Aggregate Box */}
                          <div className="bg-academic-ivory p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Calculated Merit Score</span>
                            <div>
                              <span className="text-3xl font-extrabold font-mono-numbers text-academic-crimson block">
                                {app.aggregateScore === 0.5 ? '0.5' : `${app.aggregateScore.toFixed(3)}%`}
                              </span>
                              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                <div 
                                  className="bg-academic-crimson h-full rounded-full transition-all" 
                                  style={{ width: `${app.aggregateScore === 0.5 ? 1 : app.aggregateScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Roll Number Block */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Entrance Exam Roll No</span>
                            <div>
                              <span className="font-mono text-base font-bold text-gray-800 tracking-wider block bg-white border border-gray-200 px-2.5 py-1.5 rounded text-center">
                                {app.entryTestDetails.rollNumber || 'Not Allocated'}
                              </span>
                              <div className="text-[10px] text-gray-500 mt-2 flex justify-between">
                                <span>Exam: <strong className="text-gray-700">{app.entryTestDetails.isAttended ? 'Attended' : 'Pending'}</strong></span>
                                {app.entryTestDetails.obtainedMarks > 0 && (
                                  <span>Marks: <strong className="text-academic-crimson font-mono">{app.entryTestDetails.obtainedMarks}/100</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Academic Input verification details */}
                          <div className="p-4 rounded-lg border border-gray-100 flex flex-col justify-between bg-white">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Submitted Parameters</span>
                            <div className="space-y-1 text-xs text-gray-600">
                              {app.academicDetails.sscPercentage && (
                                <div className="flex justify-between">
                                  <span>Matric / SSC Marks:</span>
                                  <span className="font-semibold text-gray-800">{app.academicDetails.sscPercentage}%</span>
                                </div>
                              )}
                              {app.academicDetails.hsscPercentage && (
                                <div className="flex justify-between">
                                  <span>HSSC / Intermediate:</span>
                                  <span className="font-semibold text-gray-800">{app.academicDetails.hsscPercentage}%</span>
                                </div>
                              )}
                              {app.academicDetails.bachelorsCGPA && (
                                <div className="flex justify-between">
                                  <span>Bachelors CGPA:</span>
                                  <span className="font-semibold text-gray-800">{app.academicDetails.bachelorsCGPA.toFixed(2)}/4.0</span>
                                </div>
                              )}
                              {app.academicDetails.mastersCGPA && (
                                <div className="flex justify-between">
                                  <span>Masters CGPA:</span>
                                  <span className="font-semibold text-gray-800">{app.academicDetails.mastersCGPA.toFixed(2)}/4.0</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Comments/Feedback Drawer if available */}
                        {app.comments && (
                          <div className="bg-amber-50 border-t border-amber-100 px-6 py-3 flex items-start space-x-2.5 text-xs text-amber-900 leading-relaxed">
                            <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>Staff Comments:</strong> {app.comments}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-display font-bold text-lg text-gray-800 mb-1">No Active Admissions Files</h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                    You have not registered or filed any admissions application yet. Launch our wizard to start your application process.
                  </p>
                  <button 
                    onClick={() => setActiveTab('apply')}
                    className="bg-academic-crimson hover:bg-red-950 text-white font-semibold py-2 px-4 rounded text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Start Online Application Wizard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Apply Form Wizard */}
          {activeTab === 'apply' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 sm:p-8">
              {/* Wizard Status Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-academic-charcoal mb-1">
                    Multi-Tier Admissions Wizard
                  </h3>
                  <p className="text-xs text-gray-500">
                    Follow steps to select, input, verify, and lock your application file.
                  </p>
                </div>
                {/* Steps markers */}
                <div className="flex items-center space-x-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 1 ? 'bg-academic-crimson text-white' : 'bg-gray-100 text-gray-500'}`}>1</span>
                  <span className="w-6 h-0.5 bg-gray-200" />
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 2 ? 'bg-academic-crimson text-white' : 'bg-gray-100 text-gray-500'}`}>2</span>
                  <span className="w-6 h-0.5 bg-gray-200" />
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 3 ? 'bg-academic-crimson text-white' : 'bg-gray-100 text-gray-500'}`}>3</span>
                </div>
              </div>

              {/* STEP 1: PROGRAM FILTERING */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Target Program</label>
                    <select
                      value={selectedProgramId}
                      onChange={(e) => handleProgramSelect(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
                    >
                      <option value="">-- Choose academic major & degree level --</option>
                      {programs.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.degreeLevel} - {p.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Requirements Card */}
                  {selectedProgram && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-academic-crimson font-display">Admissions Guidelines</span>
                        <span className="text-xs text-amber-800 font-mono font-semibold">{selectedProgram.degreeLevel} level</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-amber-900 leading-relaxed">
                        <div>
                          <strong>Weightage Split ratio:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Entrance Exam Weightage: {selectedProgram.weightageCriteria.entryTestWeight}%</li>
                            <li>Previous Academic Weightage: {selectedProgram.weightageCriteria.academicWeight}%</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Minimum Merit threshold:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Minimum Passing Entrance Exam Score: {selectedProgram.minimumCriteria.minEntryTestScore}/100</li>
                            <li>Minimum Academic Record: {selectedProgram.minimumCriteria.minAcademicScore}% {selectedProgram.degreeLevel === 'Bachelors' ? 'HSSC' : 'CGPA'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={handleNextStep}
                      disabled={!selectedProgramId}
                      className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2.5 px-6 rounded-md text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      Next Step: Qualifications
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTEXT-DRIVEN FORM RENDER */}
              {wizardStep === 2 && selectedProgram && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 text-xs text-gray-500">
                    Applying for: <strong className="text-academic-charcoal">{selectedProgram.name}</strong> ({selectedProgram.degreeLevel}). Please input exact numeric values matching transcripts.
                  </div>

                  {/* BACHELORS FIELDS */}
                  {selectedProgram.degreeLevel === 'Bachelors' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Matric / SSC Percentage (%)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="100"
                          value={sscPercentage}
                          onChange={(e) => setSscPercentage(e.target.value)}
                          placeholder="e.g. 85.50"
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Intermediate / HSSC Percentage (%)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="100"
                          value={hsscPercentage}
                          onChange={(e) => setHsscPercentage(e.target.value)}
                          placeholder="e.g. 82.30"
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm"
                        />
                      </div>

                      {/* File Slots */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">SSC Transcript PDF / Image</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setSscFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{sscFile ? sscFile.name : 'Select or drop transcript'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">HSSC Transcript PDF / Image</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setHsscFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{hsscFile ? hsscFile.name : 'Select or drop transcript'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MASTERS FIELDS */}
                  {selectedProgram.degreeLevel === 'Masters' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Bachelors CGPA (out of 4.00)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="4"
                          value={bachelorsCGPA}
                          onChange={(e) => setBachelorsCGPA(e.target.value)}
                          placeholder="e.g. 3.45"
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Matric & HSSC combined scans (Optional)</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setSscFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{sscFile ? sscFile.name : 'Choose or drop Combined certificate'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Bachelors Transcript PDF / Image</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setBachFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{bachFile ? bachFile.name : 'Choose or drop transcript'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PHD FIELDS */}
                  {selectedProgram.degreeLevel === 'PhD' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Bachelors CGPA (out of 4.00)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="4"
                          value={bachelorsCGPA}
                          onChange={(e) => setBachelorsCGPA(e.target.value)}
                          placeholder="e.g. 3.45"
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Masters CGPA (out of 4.00)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="4"
                          value={mastersCGPA}
                          onChange={(e) => setMastersCGPA(e.target.value)}
                          placeholder="e.g. 3.75"
                          className="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-sm"
                        />
                      </div>

                      {/* PDF Slots */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Bachelors Transcript PDF</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setBachFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{bachFile ? bachFile.name : 'Upload Bachelors PDF'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Masters Transcript PDF</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-4 text-center cursor-pointer relative">
                          <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setMastFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600 block">{mastFile ? mastFile.name : 'Upload Masters PDF'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">PhD Research Proposal PDF</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-academic-crimson rounded-lg p-5 text-center cursor-pointer relative bg-amber-50/20">
                          <input 
                            type="file" 
                            accept=".pdf"
                            onChange={(e) => setPropFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <FileCheck className="h-6 w-6 text-academic-crimson mx-auto mb-1" />
                          <span className="text-xs font-semibold text-academic-charcoal block">
                            {propFile ? propFile.name : 'Mandatory PhD Research Proposal Document (PDF only)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-md text-xs uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={handleNextStep}
                      className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2.5 px-6 rounded-md text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      Next: Confirm & Lock
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PREVIEW & SUBMIT */}
              {wizardStep === 3 && selectedProgram && (
                <form onSubmit={handleWizardSubmit} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start space-x-3 text-amber-900">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">Declaration of Authenticity</h4>
                      <p className="text-xs leading-relaxed">
                        By submitting this file, you declare that all marks and attached credentials are genuine and identical to official boards certificates. Providing falsified information results in immediate, permanent revocation of portal rights.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-100">
                      Summary of Application Package
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-gray-50">
                        <span className="text-gray-400">Target Degree:</span>
                        <strong className="text-gray-800">{selectedProgram.name}</strong>
                      </div>
                      
                      {selectedProgram.degreeLevel === 'Bachelors' && (
                        <>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">SSC Score:</span>
                            <strong className="text-gray-800">{sscPercentage}%</strong>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">HSSC Score:</span>
                            <strong className="text-gray-800">{hsscPercentage}%</strong>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">Matric Certificate:</span>
                            <strong className="text-academic-crimson">{sscFile?.name}</strong>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-gray-400">Intermediate Certificate:</span>
                            <strong className="text-academic-crimson">{hsscFile?.name}</strong>
                          </div>
                        </>
                      )}

                      {selectedProgram.degreeLevel === 'Masters' && (
                        <>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">Bachelors CGPA:</span>
                            <strong className="text-gray-800">{bachelorsCGPA}/4.00</strong>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-gray-400">Bachelors Transcript:</span>
                            <strong className="text-academic-crimson">{bachFile?.name}</strong>
                          </div>
                        </>
                      )}

                      {selectedProgram.degreeLevel === 'PhD' && (
                        <>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">Bachelors CGPA:</span>
                            <strong className="text-gray-800">{bachelorsCGPA}/4.00</strong>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">Masters CGPA:</span>
                            <strong className="text-gray-800">{mastersCGPA}/4.00</strong>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <span className="text-gray-400">Masters PDF:</span>
                            <strong className="text-academic-crimson">{mastFile?.name}</strong>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-gray-400">Research Proposal:</span>
                            <strong className="text-academic-crimson">{propFile?.name}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={isLoading}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-md text-xs uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2.5 px-6 rounded-md text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <span>{isLoading ? 'Uploading to Cloudinary...' : 'Lock and Submit Application'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: FAQ View */}
          {activeTab === 'faq' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-xl text-academic-charcoal mb-4 border-b border-gray-100 pb-3">
                Frequently Asked Admissions Questions
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-gray-800 text-sm">Q: How is the aggregate score calculated?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A: For Bachelors, we normalize your HSSC percentage and combine it with your Entrance Exam score according to program weights. For Masters and PhD, your previous CGPA is translated to a 100-percentage scale (CGPA/4.00 * 100) and mixed with your entrance marks.
                  </p>
                </div>
                
                <hr className="border-gray-100" />

                <div className="space-y-1.5">
                  <h4 className="font-semibold text-gray-800 text-sm">Q: What happens if I score below the exam passing mark?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A: If you score below the program cutoff (e.g. 50/100), your application is immediately updated to "Failed Test" and your aggregate score is set to 0.5 according to university guidelines.
                  </p>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-1.5">
                  <h4 className="font-semibold text-gray-800 text-sm">Q: Where can I download my Roll Number Slip?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A: Your entrance roll number is generated automatically immediately upon application submission and displayed under the "My Applications" tab of this dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
