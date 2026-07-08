import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { BookOpen, GraduationCap, Award, ShieldCheck, Search, Users, Calendar, HelpCircle, ChevronRight, MessageSquareCode } from 'lucide-react';

export const Home: React.FC = () => {
  const { programs, globalSettings, user, setRoute } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Bachelors' | 'Masters' | 'PhD'>('All');

  // Filter programs based on search query and selected degree level
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          program.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || program.degreeLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleApplyClick = () => {
    if (user) {
      setRoute('dashboard');
    } else {
      setRoute('register');
    }
  };

  return (
    <div id="landing-page" className="bg-academic-ivory min-h-screen pb-16">
      {/* Announcement Alert */}
      {globalSettings.announcement && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap text-amber-900 text-xs sm:text-sm font-medium">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded mr-2">
                Announcement
              </span>
              <span>{globalSettings.announcement}</span>
            </div>
            <span className="text-amber-700 text-xs font-semibold whitespace-nowrap">
              Closing Date: {globalSettings.deadline}
            </span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-academic-charcoal text-white relative overflow-hidden border-b-4 border-academic-gold shadow-lg py-16 sm:py-24">
        {/* Abstract background graphics */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 flex justify-end items-center pr-10">
          <GraduationCap className="w-96 h-96" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-tight tracking-tight text-white mb-6">
              Empowering the Next <br />
              <span className="text-academic-gold">Generation of Engineers</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl font-normal leading-relaxed">
              Experience a rigorous, world-class learning environment with strict meritocratic standards, automated grading systems, and streamlined admissions for Bachelors, Masters, and PhD degrees.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                id="hero-apply-btn"
                onClick={handleApplyClick}
                className="bg-academic-gold text-academic-charcoal hover:bg-yellow-500 font-bold px-6 py-3.5 rounded-lg border border-academic-gold transition-all text-center cursor-pointer shadow-md"
              >
                Apply Online Autumn 2026
              </button>
              <button 
                id="hero-programs-btn"
                onClick={() => {
                  const el = document.getElementById('programs-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-lg border border-white/40 transition-all text-center cursor-pointer"
              >
                Explore Degrees
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Trust Statistics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-4 p-2 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="bg-amber-100 p-3 rounded-lg text-amber-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display font-mono-numbers text-academic-charcoal leading-none">12,000+</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Yearly Applicants</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-2 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-800">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display font-mono-numbers text-academic-charcoal leading-none">No. 1</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Technical University</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-2 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="bg-red-100 p-3 rounded-lg text-red-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display font-mono-numbers text-academic-charcoal leading-none">100%</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Merit Integrity</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-2">
            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-800">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-display text-academic-charcoal leading-none">Aug 31</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Admissions Close</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Programs Browser */}
      <div id="programs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold font-display text-academic-charcoal mb-4">
            Undergraduate & Postgraduate Programs
          </h2>
          <p className="text-gray-500">
            Please review the academic weightage formulas, seat capacities, and mandatory minimum entry test passing marks before submitting your application.
          </p>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-8">
          {/* Degree Level Tabs */}
          <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-gray-200">
            {(['All', 'Bachelors', 'Masters', 'PhD'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${selectedLevel === level ? 'bg-academic-crimson text-white shadow-md' : 'text-gray-600 hover:text-academic-crimson'}`}
              >
                {level === 'All' ? 'All Degrees' : level}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs or departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-academic-crimson focus:border-academic-crimson"
            />
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div 
                key={program._id} 
                className="bg-white border-2 border-gray-100 hover:border-academic-crimson rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
              >
                {/* Degree Header Badge */}
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex justify-between items-center">
                  <span className={`text-[10px] uppercase tracking-widest font-extrabold font-display px-2.5 py-1 rounded-full border ${
                    program.degreeLevel === 'Bachelors' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                    program.degreeLevel === 'Masters' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                    'bg-indigo-50 text-indigo-800 border-indigo-100'
                  }`}>
                    {program.degreeLevel}
                  </span>
                  <span className="text-xs text-gray-400 font-mono font-medium uppercase">
                    Cap: <span className="text-gray-800 font-semibold">{program.capacity} Seats</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-5 py-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-academic-charcoal mb-2 leading-snug">
                      {program.name}
                    </h3>
                    <div className="text-xs text-gray-500 font-medium mb-6 uppercase tracking-wider">
                      Department: {program.department}
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Weightage Formulas */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex justify-between">
                          <span>Admissions Weightage</span>
                          <span className="text-academic-crimson">Formula Matrix</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs bg-gray-50 p-2.5 rounded border border-gray-100">
                          <div>
                            <span className="text-gray-400 block uppercase text-[9px] font-semibold">Entry Test Weight</span>
                            <span className="font-mono-numbers font-bold text-academic-charcoal">{program.weightageCriteria.entryTestWeight}%</span>
                          </div>
                          <div className="border-l border-gray-200">
                            <span className="text-gray-400 block uppercase text-[9px] font-semibold">Academic Weight</span>
                            <span className="font-mono-numbers font-bold text-academic-charcoal">{program.weightageCriteria.academicWeight}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Criteria */}
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                          Minimum Passing Eligibility
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <div className="flex justify-between items-center">
                            <span>Academic Record:</span>
                            <span className="font-semibold text-gray-800">
                              {program.degreeLevel === 'Bachelors' ? `${program.minimumCriteria.minAcademicScore}% in HSSC` : `${program.minimumCriteria.minAcademicScore.toFixed(2)} CGPA`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Entrance Exam Cutoff:</span>
                            <span className="font-semibold text-gray-800">{program.minimumCriteria.minEntryTestScore} Marks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Link */}
                  <div className="mt-8 pt-4">
                    <button
                      onClick={handleApplyClick}
                      className="w-full bg-academic-crimson hover:bg-red-950 text-white py-2 px-4 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Initiate Application</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-lg mx-auto shadow-sm">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-gray-800 mb-1">No Academic Programs Found</h3>
            <p className="text-gray-500 text-sm">
              We couldn't find any programs matching your filters or search query. Try broadening your keywords.
            </p>
          </div>
        )}
      </div>

      {/* Helpful admissions info section */}
      <div className="bg-white border-t border-b border-gray-100 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="bg-academic-ivory w-12 h-12 flex items-center justify-center rounded-lg text-academic-crimson border border-academic-gold/30">
                <BookOpen className="h-6 w-6 text-academic-crimson" />
              </div>
              <h3 className="font-display font-bold text-lg text-academic-charcoal">Step 1: Application Wizard</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Choose your program and input academic markers (HSSC score or CGPA). Upload required document credentials safely through Cloudinary servers.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-academic-ivory w-12 h-12 flex items-center justify-center rounded-lg text-academic-crimson border border-academic-gold/30">
                <ShieldCheck className="h-6 w-6 text-academic-crimson" />
              </div>
              <h3 className="font-display font-bold text-lg text-academic-charcoal">Step 2: Officer Verification</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Admissions officers inspect submitted physical transcript PDF scans side-by-side with entered marks. Upon verification, roll numbers are confirmed.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-academic-ivory w-12 h-12 flex items-center justify-center rounded-lg text-academic-crimson border border-academic-gold/30">
                <GraduationCap className="h-6 w-6 text-academic-crimson" />
              </div>
              <h3 className="font-display font-bold text-lg text-academic-charcoal">Step 3: Test score & Merit Compilation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enter test scores, automatically trigger mathematical aggregates, rank eligible students, and publish program-wise merit lists with a single click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
