import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Program, Application } from '../types.ts';
import { 
  Plus, Edit, Trash2, Save, Users, GraduationCap, 
  Settings, Award, Sparkles, Filter, CheckSquare, ListOrdered 
} from 'lucide-react';

export const DeptHeadDashboard: React.FC = () => {
  const { 
    programs, applications, fetchApplications, fetchPrograms,
    createProgram, updateProgram, deleteProgram, saveTestScore, generateMeritList, showToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'evaluation' | 'merit'>('programs');
  const [confirmingMeritProgramId, setConfirmingMeritProgramId] = useState<string | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);

  // Load backend arrays
  useEffect(() => {
    fetchPrograms();
    fetchApplications();
  }, []);

  // Filter application list for evaluation (only show verified/test scheduled candidates)
  const [filterProgramId, setFilterProgramId] = useState('');

  // CRUD State for Program Form
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  const [progName, setProgName] = useState('');
  const [progLevel, setProgLevel] = useState<'Bachelors' | 'Masters' | 'PhD'>('Bachelors');
  const [progDept, setProgDept] = useState('Computer Science');
  const [progCapacity, setProgCapacity] = useState('50');
  
  const [entryWeight, setEntryWeight] = useState('50');
  const [acadWeight, setAcadWeight] = useState('50');
  
  const [minAcad, setMinAcad] = useState('60');
  const [minEntry, setMinEntry] = useState('50');

  // Input state for test scores editing
  const [scoresState, setScoresState] = useState<{ [appId: string]: { marks: string; attended: boolean } }>({});

  // Sync scores state when applications change
  useEffect(() => {
    const newState: typeof scoresState = {};
    applications.forEach((app) => {
      newState[app._id] = {
        marks: app.entryTestDetails.obtainedMarks?.toString() || '0',
        attended: app.entryTestDetails.isAttended || false
      };
    });
    setScoresState(newState);
  }, [applications]);

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entryW = Number(entryWeight);
    const acadW = Number(acadWeight);

    if (entryW + acadW !== 100) {
      showToast('The sum of Entry Test and Academic weightages must equal 100%!', 'error');
      return;
    }

    const payload = {
      name: progName,
      degreeLevel: progLevel,
      department: progDept,
      capacity: Number(progCapacity),
      weightageCriteria: {
        entryTestWeight: entryW,
        academicWeight: acadW
      },
      minimumCriteria: {
        minAcademicScore: Number(minAcad),
        minEntryTestScore: Number(minEntry)
      }
    };

    let success = false;
    if (editingProgram) {
      success = await updateProgram(editingProgram._id, payload);
    } else {
      success = await createProgram(payload);
    }

    if (success) {
      setShowForm(false);
      setEditingProgram(null);
      resetProgramForm();
    }
  };

  const handleEditProgramClick = (program: Program) => {
    setEditingProgram(program);
    setProgName(program.name);
    setProgLevel(program.degreeLevel);
    setProgDept(program.department);
    setProgCapacity(program.capacity.toString());
    setEntryWeight(program.weightageCriteria.entryTestWeight.toString());
    setAcadWeight(program.weightageCriteria.academicWeight.toString());
    setMinAcad(program.minimumCriteria.minAcademicScore.toString());
    setMinEntry(program.minimumCriteria.minEntryTestScore.toString());
    setShowForm(true);
  };

  const resetProgramForm = () => {
    setProgName('');
    setProgLevel('Bachelors');
    setProgDept('Computer Science');
    setProgCapacity('50');
    setEntryWeight('50');
    setAcadWeight('50');
    setMinAcad('60');
    setMinEntry('50');
  };

  const handleScoreChange = (appId: string, value: string) => {
    setScoresState((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], marks: value }
    }));
  };

  const handleAttendanceChange = (appId: string, checked: boolean) => {
    setScoresState((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], attended: checked }
    }));
  };

  const handleSaveScoreClick = async (appId: string) => {
    const state = scoresState[appId];
    if (!state) return;
    const marks = Number(state.marks);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      showToast('Marks must be a valid number between 0 and 100.', 'error');
      return;
    }
    await saveTestScore(appId, marks, state.attended);
  };

  const handleCompileMeritList = async (programId: string) => {
    await generateMeritList(programId);
  };

  // Filter evaluation candidates
  const evaluationApplicants = applications.filter((app) => {
    // Show applications that are Verified or Scheduled or Failed Test
    const matchesStatus = ['Documents Verified', 'Test Scheduled', 'Failed Test', 'Approved', 'Rejected'].includes(app.status);
    const matchesProgram = !filterProgramId || (app.programId as Program)?._id === filterProgramId;
    return matchesStatus && matchesProgram;
  });

  return (
    <div id="dept-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveSubTab('programs')}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${activeSubTab === 'programs' ? 'border-academic-crimson text-academic-crimson' : 'border-transparent text-gray-500 hover:text-academic-crimson'}`}
        >
          <Settings className="h-4 w-4" />
          <span>Programs Definition CRUD</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evaluation')}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${activeSubTab === 'evaluation' ? 'border-academic-crimson text-academic-crimson' : 'border-transparent text-gray-500 hover:text-academic-crimson'}`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Entrance Marks Evaluation Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('merit')}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${activeSubTab === 'merit' ? 'border-academic-crimson text-academic-crimson' : 'border-transparent text-gray-500 hover:text-academic-crimson'}`}
        >
          <ListOrdered className="h-4 w-4" />
          <span>Merit List compiler</span>
        </button>
      </div>

      {/* ==========================================
          SUBTAB 1: PROGRAMS CRUD DEFINITION
          ========================================== */}
      {activeSubTab === 'programs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-academic-charcoal">
                Academic Program Configuration
              </h3>
              <p className="text-xs text-gray-500">
                Manage degrees, adjust seat capacities, customize aggregate weight ratios, and set minimum eligibility thresholds.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  resetProgramForm();
                  setEditingProgram(null);
                  setShowForm(true);
                }}
                className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-wider shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Program</span>
              </button>
            )}
          </div>

          {/* Create/Edit Program Form */}
          {showForm && (
            <form onSubmit={handleProgramSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-6 animate-fadeIn">
              <h4 className="font-display font-bold text-sm text-academic-crimson uppercase tracking-wider border-b border-gray-100 pb-2">
                {editingProgram ? `Edit Program: ${editingProgram.name}` : 'Instantiate Academic Program'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Program Name</label>
                  <input
                    type="text"
                    required
                    value={progName}
                    onChange={(e) => setProgName(e.target.value)}
                    placeholder="e.g. BS Software Engineering"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Degree Level</label>
                  <select
                    value={progLevel}
                    onChange={(e) => setProgLevel(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  >
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Department Name</label>
                  <input
                    type="text"
                    required
                    value={progDept}
                    onChange={(e) => setProgDept(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Seat Capacity</label>
                  <input
                    type="number"
                    required
                    value={progCapacity}
                    onChange={(e) => setProgCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Min Academic {progLevel === 'Bachelors' ? 'HSSC %' : 'CGPA'}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={minAcad}
                    onChange={(e) => setMinAcad(e.target.value)}
                    placeholder="e.g. 60 or 2.50"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Min Entry Test Score (to Pass)</label>
                  <input
                    type="number"
                    required
                    value={minEntry}
                    onChange={(e) => setMinEntry(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Entry Test Weightage (%)</label>
                  <input
                    type="number"
                    required
                    value={entryWeight}
                    onChange={(e) => setEntryWeight(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Academic weightage (%)</label>
                  <input
                    type="number"
                    required
                    value={acadWeight}
                    onChange={(e) => setAcadWeight(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProgram(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2 px-5 rounded text-xs uppercase tracking-wider"
                >
                  {editingProgram ? 'Save Changes' : 'Publish Program'}
                </button>
              </div>
            </form>
          )}

          {/* Program Catalog Grid with Edit/Delete */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program._id} className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between h-full">
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center text-xs">
                  <span className="font-extrabold uppercase font-display text-academic-crimson">{program.degreeLevel}</span>
                  <span className="text-gray-400">Cap: <strong className="text-gray-800">{program.capacity} Seats</strong></span>
                </div>
                
                <div className="p-5 flex-grow">
                  <h4 className="font-display font-bold text-base text-gray-900 mb-1">{program.name}</h4>
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-4">{program.department}</div>
                  
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Ratios:</span>
                      <strong className="text-gray-800">{program.weightageCriteria.entryTestWeight}% Test / {program.weightageCriteria.academicWeight}% Acad</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cutoff Acad:</span>
                      <strong className="text-gray-800">{program.minimumCriteria.minAcademicScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cutoff Entry Test:</span>
                      <strong className="text-gray-800">{program.minimumCriteria.minEntryTestScore} Marks</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end items-center space-x-2 h-12">
                  {deletingProgramId === program._id ? (
                    <div className="flex items-center space-x-1.5 animate-fadeIn">
                      <button
                        onClick={async () => {
                          await deleteProgram(program._id);
                          setDeletingProgramId(null);
                        }}
                        className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase cursor-pointer shadow-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingProgramId(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded text-[10px] uppercase cursor-pointer shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditProgramClick(program)}
                        className="p-1.5 rounded text-gray-500 hover:text-academic-crimson hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProgramId(program._id)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 2: ENTRANCE MARKS EVALUATION MATRIX
          ========================================== */}
      {activeSubTab === 'evaluation' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-academic-charcoal">
                Entrance Exam Evaluation Matrix
              </h3>
              <p className="text-xs text-gray-500">
                Log entrance exam scores and mark candidate attendance. Saving scores automatically triggers the dynamic formula and auto-fails candidates below cutoff.
              </p>
            </div>
            
            {/* Filter by Program */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterProgramId}
                onChange={(e) => setFilterProgramId(e.target.value)}
                className="bg-white border border-gray-200 rounded p-1.5 text-xs"
              >
                <option value="">Filter: All Programs</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {evaluationApplicants.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Applicant details</th>
                    <th className="px-6 py-4">Academic Program</th>
                    <th className="px-6 py-4">Attendance Check</th>
                    <th className="px-6 py-4">Obtained marks (0-100)</th>
                    <th className="px-6 py-4 text-right">Commit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {evaluationApplicants.map((app) => {
                    const applicant = app.applicantId as any;
                    const prog = app.programId as Program;
                    const rowState = scoresState[app._id] || { marks: '0', attended: false };

                    return (
                      <tr key={app._id} className="hover:bg-academic-ivory/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-academic-crimson text-sm">
                          {app.entryTestDetails.rollNumber || 'Unscheduled'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{applicant?.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{applicant?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{prog?.name}</div>
                          <div className="text-[10px] uppercase text-gray-400 mt-0.5 font-bold">{app.degreeLevel}</div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={rowState.attended}
                            onChange={(e) => handleAttendanceChange(app._id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-academic-crimson focus:ring-academic-crimson cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!rowState.attended}
                            value={rowState.attended ? rowState.marks : ''}
                            onChange={(e) => handleScoreChange(app._id, e.target.value)}
                            placeholder="Absent"
                            className="w-20 bg-gray-50 border border-gray-200 rounded p-1 text-center font-bold font-mono text-xs disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSaveScoreClick(app._id)}
                            className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold p-2 rounded shadow-sm transition-all cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-md mx-auto shadow-sm">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-display font-bold text-lg text-gray-800 mb-1">No Applicants Available</h4>
              <p className="text-gray-500 text-xs">
                There are currently no candidates with verified documents waiting for entrance exam evaluations in the system queue.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SUBTAB 3: MERIT LIST GENERATOR
          ========================================== */}
      {activeSubTab === 'merit' && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <h3 className="font-display font-bold text-lg text-academic-charcoal">
              Rankings & Merit List Generation
            </h3>
            <p className="text-xs text-gray-500">
              Compile and lock final merit lists for individual degree programs. The algorithm automatically ranks students according to their final aggregates and approves candidates up to program seat limits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {programs.map((program) => {
              // Get applicants belonging to this program
              const programApps = applications.filter((app) => (app.programId as Program)?._id === program._id);
              
              // Count verified or test-scheduled candidates
              const eligibleCandidates = programApps.filter((app) => ['Documents Verified', 'Test Scheduled', 'Approved'].includes(app.status));
              const approvedCandidates = programApps.filter((app) => app.status === 'Approved');

              // Sort apps for merit ranking visualization
              const sortedApps = [...programApps]
                .filter((app) => app.status !== 'Pending' && app.status !== 'Rejected')
                .sort((a, b) => b.aggregateScore - a.aggregateScore);

              return (
                <div key={program._id} className="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex flex-col justify-between space-y-6">
                  {/* Stats header */}
                  <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-academic-crimson">{program.degreeLevel} Level</span>
                      <h4 className="font-display font-bold text-base text-gray-900 mt-0.5">{program.name}</h4>
                    </div>
                    {confirmingMeritProgramId === program._id ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={async () => {
                            await handleCompileMeritList(program._id);
                            setConfirmingMeritProgramId(null);
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded text-[10px] uppercase tracking-wider cursor-pointer shadow-sm flex items-center space-x-1 animate-fadeIn"
                        >
                          <span>Confirm Lock</span>
                        </button>
                        <button
                          onClick={() => setConfirmingMeritProgramId(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingMeritProgramId(program._id)}
                        disabled={eligibleCandidates.length === 0}
                        className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-academic-gold" />
                        <span>Generate & Lock</span>
                      </button>
                    )}
                  </div>

                  {/* Summary markers */}
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded border border-gray-100 text-center text-xs">
                    <div>
                      <span className="text-gray-400 block uppercase text-[9px] font-semibold">Seat Capacity</span>
                      <strong className="text-gray-800">{program.capacity}</strong>
                    </div>
                    <div className="border-l border-gray-200">
                      <span className="text-gray-400 block uppercase text-[9px] font-semibold">Eligible Pool</span>
                      <strong className="text-academic-crimson">{eligibleCandidates.length}</strong>
                    </div>
                    <div className="border-l border-gray-200">
                      <span className="text-gray-400 block uppercase text-[9px] font-semibold">Admitted/Approved</span>
                      <strong className="text-emerald-800">{approvedCandidates.length}</strong>
                    </div>
                  </div>

                  {/* Ranking visualizer ledger */}
                  <div className="space-y-2.5">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Ranked Eligible Applicants</span>
                    
                    {sortedApps.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto space-y-1.5 border border-gray-100 rounded p-2 bg-gray-50/50">
                        {sortedApps.map((app, index) => {
                          const applicant = app.applicantId as any;
                          const isAdmitted = index < program.capacity;
                          
                          return (
                            <div 
                              key={app._id} 
                              className={`flex items-center justify-between text-xs p-2 rounded border ${isAdmitted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-100/50 border-gray-200'}`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] ${isAdmitted ? 'bg-emerald-800 text-white shadow-sm' : 'bg-gray-300 text-gray-600'}`}>
                                  {index + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-gray-900">{applicant?.name}</span>
                                  <span className="text-[10px] text-gray-400 block">Roll: {app.entryTestDetails.rollNumber}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold font-mono text-academic-charcoal block">{app.aggregateScore.toFixed(3)}%</span>
                                <span className={`text-[9px] font-bold uppercase ${app.status === 'Approved' ? 'text-emerald-800' : 'text-gray-500'}`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center p-6 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded">
                        No evaluated test scores recorded yet.
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
