import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Application, Program } from '../types.ts';
import { 
  FileCheck, ShieldAlert, Check, X, FileText, Search, 
  ExternalLink, Layers, GraduationCap, ChevronRight 
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { applications, verifyApplication, fetchApplications } = useApp();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [comments, setComments] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFileTab, setActiveFileTab] = useState<'ssc' | 'hssc' | 'bachelors' | 'masters' | 'proposal'>('ssc');

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update form values when selected application shifts
  useEffect(() => {
    if (selectedApp) {
      setComments(selectedApp.comments || '');
      // Select appropriate initial document tab
      if (selectedApp.degreeLevel === 'Bachelors') {
        setActiveFileTab('ssc');
      } else if (selectedApp.degreeLevel === 'Masters') {
        setActiveFileTab('bachelors');
      } else {
        setActiveFileTab('proposal');
      }
    }
  }, [selectedApp]);

  const handleVerify = async (status: 'Documents Verified' | 'Rejected') => {
    if (!selectedApp) return;
    const success = await verifyApplication(selectedApp._id, status, comments);
    if (success) {
      setSelectedApp(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    const applicant = app.applicantId as any;
    const prog = app.programId as Program;
    const nameMatch = applicant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = applicant?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const progMatch = prog?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || progMatch;
  });

  // Get Cloudinary document URL for active tab
  const getActiveDocUrl = (): string | undefined => {
    if (!selectedApp) return undefined;
    switch (activeFileTab) {
      case 'ssc': return selectedApp.documents.sscTranscript;
      case 'hssc': return selectedApp.documents.hsscTranscript;
      case 'bachelors': return selectedApp.documents.bachelorsTranscript;
      case 'masters': return selectedApp.documents.mastersTranscript;
      case 'proposal': return selectedApp.documents.researchProposal;
      default: return undefined;
    }
  };

  // Helper to convert Cloudinary PDF/raw delivery URLs to bypass 401 restrictions
  const getDeliverableDocUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.includes('cloudinary.com')) {
      const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
      if (!hasImageExtension) {
        if (url.toLowerCase().endsWith('.pdf')) {
          return url.substring(0, url.length - 4) + '.jpg';
        }
        return url + '.jpg';
      }
    }
    return url;
  };

  return (
    <div id="officer-dashboard-layout" className="bg-academic-ivory min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8">
      
      {!selectedApp ? (
        /* LISTING VIEW OF PENDING APPLICATIONS */
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold font-display text-academic-charcoal">
                Admissions Document Verification Matrix
              </h2>
              <p className="text-xs text-gray-500">
                Compare numerical credentials entered by applicants with Cloudinary physical transcripts scans in a split-screen workspace.
              </p>
            </div>
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicant name, email, major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson shadow-sm"
              />
            </div>
          </div>

          {filteredApps.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Applicant details</th>
                    <th className="px-6 py-4">Degree applied</th>
                    <th className="px-6 py-4">Verification state</th>
                    <th className="px-6 py-4">Entrance exam roll</th>
                    <th className="px-6 py-4 text-right">Verification Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredApps.map((app) => {
                    const applicant = app.applicantId as any;
                    const prog = app.programId as Program;
                    return (
                      <tr key={app._id} className="hover:bg-academic-ivory/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{applicant?.name || 'Anonymous Applicant'}</div>
                          <div className="text-gray-400 text-[10px] mt-0.5">{applicant?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{prog?.name || 'Unmapped Major'}</div>
                          <div className="text-[10px] text-academic-crimson mt-0.5 font-bold uppercase tracking-wider">{app.degreeLevel}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold border ${
                            app.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                            app.status === 'Documents Verified' ? 'bg-teal-50 text-teal-800 border-teal-100' :
                            app.status === 'Test Scheduled' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                            app.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                            app.status === 'Failed Test' ? 'bg-red-50 text-red-800 border-red-100' :
                            app.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {app.status === 'Pending' ? 'Awaiting verification' : 
                             app.status === 'Approved' ? 'Admitted / Selected' : 
                             app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-gray-600">
                            {app.entryTestDetails.rollNumber || 'Not Set'}
                          </div>
                          {app.entryTestDetails.isAttended && (
                            <div className="text-[10px] text-academic-crimson font-bold mt-0.5">
                              Marks: {app.entryTestDetails.obtainedMarks}/100
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center space-x-1.5 bg-academic-crimson hover:bg-red-950 text-white font-semibold px-4 py-2 rounded text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            <span>Verify Transcripts</span>
                            <ChevronRight className="h-3.5 w-3.5" />
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
              <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-display font-bold text-lg text-gray-800 mb-1">No Applications Filed</h4>
              <p className="text-gray-500 text-xs">
                There are currently no filed applications matching your searching keywords in the database queue.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* SPLIT-SCREEN WORKSPACE FOR TRANSCRIPTS VERIFICATION */
        <div id="split-screen-workspace" className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          
          {/* LEFT PANEL: APPLICATION METADATA & COMPILATION STATE */}
          <div className="bg-white border-2 border-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="bg-academic-charcoal text-white px-6 py-4 border-b-2 border-academic-gold flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-academic-gold font-bold font-display">Verification Workspace</span>
                <h3 className="font-display font-bold text-base text-white">
                  Applicant: {(selectedApp.applicantId as any)?.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                Close File
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              
              {/* Applicant profile brief */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-semibold">Degree Program</span>
                  <strong className="text-gray-800">{(selectedApp.programId as Program)?.name}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-semibold">Degree level</span>
                  <strong className="text-academic-crimson uppercase tracking-wider font-bold">{selectedApp.degreeLevel}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-semibold">Email address</span>
                  <strong className="text-gray-800">{(selectedApp.applicantId as any)?.email}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-semibold">Roll number Assigned</span>
                  <strong className="text-gray-800 font-mono">{selectedApp.entryTestDetails.rollNumber || 'Not Set'}</strong>
                </div>
                {selectedApp.entryTestDetails.isAttended && (
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] font-semibold">Entry Test Marks</span>
                    <strong className="text-academic-crimson font-mono font-bold text-xs">{selectedApp.entryTestDetails.obtainedMarks}/100</strong>
                  </div>
                )}
                {selectedApp.aggregateScore > 0.5 && (
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] font-semibold">Calculated Merit Score</span>
                    <strong className="text-emerald-800 font-mono font-bold text-xs">{selectedApp.aggregateScore.toFixed(3)}%</strong>
                  </div>
                )}
              </div>

              {/* Numeric scores entered vs required */}
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Entered Academic Qualification Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedApp.academicDetails.sscPercentage && (
                    <div className="bg-academic-ivory border border-gray-100 p-3 rounded text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-semibold block">SSC Marks</span>
                      <strong className="text-sm font-extrabold text-academic-charcoal">{selectedApp.academicDetails.sscPercentage}%</strong>
                    </div>
                  )}
                  {selectedApp.academicDetails.hsscPercentage && (
                    <div className="bg-academic-ivory border border-gray-100 p-3 rounded text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-semibold block">HSSC Marks</span>
                      <strong className="text-sm font-extrabold text-academic-charcoal">{selectedApp.academicDetails.hsscPercentage}%</strong>
                    </div>
                  )}
                  {selectedApp.academicDetails.bachelorsCGPA && (
                    <div className="bg-academic-ivory border border-gray-100 p-3 rounded text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-semibold block">Bach CGPA</span>
                      <strong className="text-sm font-extrabold text-academic-charcoal">{selectedApp.academicDetails.bachelorsCGPA.toFixed(2)}</strong>
                    </div>
                  )}
                  {selectedApp.academicDetails.mastersCGPA && (
                    <div className="bg-academic-ivory border border-gray-100 p-3 rounded text-center">
                      <span className="text-[9px] text-gray-400 uppercase font-semibold block">Mast CGPA</span>
                      <strong className="text-sm font-extrabold text-academic-charcoal">{selectedApp.academicDetails.mastersCGPA.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Upload Scans Checklist (Cloudinary Backup)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.documents.sscTranscript && (
                    <button 
                      onClick={() => setActiveFileTab('ssc')}
                      className={`px-3 py-2 rounded text-xs font-semibold border ${activeFileTab === 'ssc' ? 'bg-academic-crimson text-white border-academic-crimson' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      SSC Certificate
                    </button>
                  )}
                  {selectedApp.documents.hsscTranscript && (
                    <button 
                      onClick={() => setActiveFileTab('hssc')}
                      className={`px-3 py-2 rounded text-xs font-semibold border ${activeFileTab === 'hssc' ? 'bg-academic-crimson text-white border-academic-crimson' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      HSSC Certificate
                    </button>
                  )}
                  {selectedApp.documents.bachelorsTranscript && (
                    <button 
                      onClick={() => setActiveFileTab('bachelors')}
                      className={`px-3 py-2 rounded text-xs font-semibold border ${activeFileTab === 'bachelors' ? 'bg-academic-crimson text-white border-academic-crimson' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      Bachelors Transcript
                    </button>
                  )}
                  {selectedApp.documents.mastersTranscript && (
                    <button 
                      onClick={() => setActiveFileTab('masters')}
                      className={`px-3 py-2 rounded text-xs font-semibold border ${activeFileTab === 'masters' ? 'bg-academic-crimson text-white border-academic-crimson' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      Masters Transcript
                    </button>
                  )}
                  {selectedApp.documents.researchProposal && (
                    <button 
                      onClick={() => setActiveFileTab('proposal')}
                      className={`px-3 py-2 rounded text-xs font-semibold border ${activeFileTab === 'proposal' ? 'bg-academic-crimson text-white border-academic-crimson' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      PhD Research Proposal
                    </button>
                  )}
                </div>
              </div>

              {/* Status Mutator Form */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Evaluation Comments</label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide a reason for rejection or a verification note..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleVerify('Rejected')}
                    className="bg-transparent hover:bg-red-50 text-red-700 border border-red-300 hover:border-red-400 font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider transition-all cursor-pointer flex justify-center items-center space-x-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject Application</span>
                  </button>
                  
                  <button
                    onClick={() => handleVerify('Documents Verified')}
                    className="bg-emerald-800 hover:bg-emerald-950 text-white border border-emerald-800 hover:border-emerald-950 font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex justify-center items-center space-x-1.5"
                  >
                    <Check className="h-4 w-4 text-academic-gold" />
                    <span>Verify Documents</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: CREDENTIALS PREVIEWER */}
          <div className="bg-white border-2 border-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col h-full">
            <div className="bg-academic-charcoal px-4 py-3 text-white border-b border-gray-100 flex justify-between items-center text-xs">
              <span className="font-semibold text-white uppercase tracking-wider font-display">Physical Scan Viewer</span>
              <div className="flex items-center space-x-3">
                <span className="text-academic-gold uppercase tracking-widest font-mono font-bold">{activeFileTab} Document</span>
                {getActiveDocUrl() && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={getDeliverableDocUrl(getActiveDocUrl())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase transition-all"
                      title="Open high-resolution optimized image in a new tab"
                    >
                      <span>Open External</span>
                      <ExternalLink className="h-3 w-3 text-academic-gold" />
                    </a>
                    <a
                      href={getActiveDocUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-1 px-2.5 rounded text-[10px] uppercase transition-all border border-white/15"
                      title="Open or download original uploaded format"
                    >
                      <span>Original</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow bg-gray-50 relative flex items-center justify-center overflow-auto min-h-[400px]">
              {(() => {
                const url = getActiveDocUrl();
                if (!url) {
                  return (
                    <div className="text-center p-8 max-w-sm space-y-3">
                      <ShieldAlert className="h-10 w-10 text-gray-400 mx-auto" />
                      <h5 className="font-bold text-gray-700 text-sm">No Document Available</h5>
                      <p className="text-gray-400 text-xs">
                        The active document slot does not contain any file or is not applicable to the candidate's degree level.
                      </p>
                    </div>
                  );
                }

                const deliverableUrl = getDeliverableDocUrl(url);
                const isBase64Pdf = url.startsWith('data:application/pdf');

                if (isBase64Pdf) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <iframe
                        src={url}
                        title={`${activeFileTab} Transcript PDF`}
                        className="w-full h-[550px] border border-gray-200 rounded shadow-sm bg-white"
                      />
                      <div className="mt-2.5 text-[10px] text-gray-400 flex flex-col items-center space-y-0.5 text-center">
                        <span className="font-medium text-gray-500">PDF Document rendered inline from local secure base64 data.</span>
                        <span>Pro-Tip: Use "Open External" in the top bar to inspect or print in a separate tab.</span>
                      </div>
                    </div>
                  );
                }

                // Render as a secure image with support for on-the-fly PDF conversion to JPEG
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <img
                      src={deliverableUrl}
                      alt={`${activeFileTab} Transcript Scan`}
                      className="max-h-[calc(100vh-220px)] max-w-full object-contain rounded border border-gray-200 shadow-sm bg-white"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // If it fails, fallback to the raw url
                        const target = e.target as HTMLImageElement;
                        if (target.src !== url) {
                          target.src = url || '';
                        }
                      }}
                    />
                    <div className="mt-2.5 text-[10px] text-gray-400 flex flex-col items-center space-y-0.5 text-center">
                      <span className="font-medium text-gray-500">Document converted to high-resolution JPEG to bypass iframe & Cloudinary sandbox constraints.</span>
                      <span>Pro-Tip: Use "Open External" in the top bar to inspect in full screen.</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
