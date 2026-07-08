import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { User } from '../types.ts';
import { 
  Users, Landmark, ShieldCheck, Calendar, Radio, CheckCircle2,
  Trash2, Edit3, Plus, Search, ShieldAlert, Key, UserPlus 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    globalSettings, updateGlobalSettings, applications, programs,
    createUser, updateUser, deleteUser, showToast, fetchApplications
  } = useApp();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  // Account Form State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'applicant' | 'officer' | 'dept_head' | 'admin'>('applicant');

  // Load all user accounts from API on mount
  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admissions_token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching system users:', err);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchApplications();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: userName,
      email: userEmail,
      password: userPassword,
      role: userRole
    };

    let success = false;
    if (editingUser) {
      const targetId = editingUser._id || (editingUser as any).id;
      success = await updateUser(targetId, payload);
    } else {
      if (!userPassword) {
        showToast('Password is required for creating new users.', 'error');
        return;
      }
      success = await createUser(payload);
    }

    if (success) {
      setShowUserForm(false);
      setEditingUser(null);
      resetUserForm();
      fetchAllUsers();
    }
  };

  const handleEditUserClick = (usr: User) => {
    setEditingUser(usr);
    setUserName(usr.name);
    setUserEmail(usr.email);
    setUserPassword(''); // Keep blank unless resetting
    setUserRole(usr.role);
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('applicant');
  };

  // Filter accounts
  const filteredUsers = usersList.filter((usr) => {
    return usr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           usr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           usr.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate high-level core analytics
  const totalApps = applications.length;
  const docsVerifiedCount = applications.filter((a) => a.status === 'Documents Verified' || a.status === 'Test Scheduled' || a.status === 'Approved').length;
  const failedTestCount = applications.filter((a) => a.status === 'Failed Test').length;
  const admittedCount = applications.filter((a) => a.status === 'Approved').length;

  return (
    <div id="admin-workspace-layout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. GLOBAL OVERRIDES MODULE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <h3 className="font-display font-bold text-lg text-academic-charcoal mb-4 flex items-center space-x-2">
          <Radio className="h-5 w-5 text-academic-crimson animate-pulse" />
          <span>Global Variable Override & Portal State Control</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admissions Open Variable */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 block uppercase">Admissions portal status</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Toggle global capability to file new admissions applications</span>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => updateGlobalSettings({ admissionsOpen: !globalSettings.admissionsOpen })}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm ${globalSettings.admissionsOpen ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'}`}
              >
                {globalSettings.admissionsOpen ? 'Admissions: OPEN' : 'Admissions: CLOSED'}
              </button>
            </div>
          </div>

          {/* Deadline Variable */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 block uppercase">Admission deadline date</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Edit system closing timeline dates</span>
            </div>
            <div className="mt-4">
              <input
                type="date"
                value={globalSettings.deadline}
                onChange={(e) => updateGlobalSettings({ deadline: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-bold"
              />
            </div>
          </div>

          {/* Marquee message banner */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 block uppercase">Portal announcement text</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">System-wide header marquee ticker</span>
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={globalSettings.announcement}
                onChange={(e) => updateGlobalSettings({ announcement: e.target.value })}
                placeholder="Alert marquee ticker alert text..."
                className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. UNIVERSITY CORE ANALYTICS BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total applications</span>
              <h4 className="text-3xl font-extrabold font-mono-numbers text-academic-charcoal mt-1">{totalApps}</h4>
            </div>
            <span className="bg-indigo-50 p-2.5 rounded-lg text-indigo-800"><Landmark className="h-5 w-5" /></span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Verified Credentials</span>
              <h4 className="text-3xl font-extrabold font-mono-numbers text-emerald-800 mt-1">{docsVerifiedCount}</h4>
            </div>
            <span className="bg-emerald-50 p-2.5 rounded-lg text-emerald-800"><ShieldCheck className="h-5 w-5" /></span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Entrance auto-failed</span>
              <h4 className="text-3xl font-extrabold font-mono-numbers text-red-800 mt-1">{failedTestCount}</h4>
            </div>
            <span className="bg-red-50 p-2.5 rounded-lg text-red-800"><ShieldAlert className="h-5 w-5" /></span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Final Seats Awarded</span>
              <h4 className="text-3xl font-extrabold font-mono-numbers text-amber-800 mt-1">{admittedCount}</h4>
            </div>
            <span className="bg-amber-50 p-2.5 rounded-lg text-amber-800"><Calendar className="h-5 w-5" /></span>
          </div>
        </div>
      </div>

      {/* 3. STAFF ACCOUNTS SYSTEM CRUD */}
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-academic-charcoal">
              Staff & Users Directory Manager (Role CRUD)
            </h3>
            <p className="text-xs text-gray-500">
              Revoke token entries, terminate user admissions files, register new Admissions Officers, or assign Academic Department Heads.
            </p>
          </div>
          {!showUserForm && (
            <button
              onClick={() => {
                resetUserForm();
                setEditingUser(null);
                setShowUserForm(true);
              }}
              className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-wider shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-academic-gold" />
              <span>Register Staff Member</span>
            </button>
          )}
        </div>

        {/* User Form Drawer */}
        {showUserForm && (
          <form onSubmit={handleUserSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-6 animate-fadeIn">
            <h4 className="font-display font-bold text-sm text-academic-crimson uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>{editingUser ? `Override Account: ${editingUser.name}` : 'Instantiate Academic Staff Account'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Legal Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. j.smith@university.edu"
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  {editingUser ? 'Reset Password (Optional)' : 'Secret Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={editingUser ? 'Leave blank to retain password' : '••••••••'}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Allocated Role Permission</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
                >
                  <option value="applicant">Applicant</option>
                  <option value="officer">Admissions Officer</option>
                  <option value="dept_head">Academic Dept Head</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-academic-crimson hover:bg-red-950 text-white font-bold py-2 px-5 rounded text-xs uppercase tracking-wider"
              >
                {editingUser ? 'Save Override' : 'Provision Account'}
              </button>
            </div>
          </form>
        )}

        {/* Directory Listings Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-xs uppercase text-gray-500">System Accounts Catalog</span>
            {/* Search Box */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded pl-8 pr-4 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">User Legal Name</th>
                <th className="px-6 py-3">Role permissions badge</th>
                <th className="px-6 py-3">Sign-in email pointer</th>
                <th className="px-6 py-3 text-right">Directory actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredUsers.map((usr) => {
                const userId = usr._id || (usr as any).id;
                return (
                  <tr key={userId} className="hover:bg-academic-ivory/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-gray-900">{usr.name}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded text-[9px] uppercase tracking-wider font-extrabold border ${
                        usr.role === 'admin' ? 'bg-red-900/10 text-red-800 border-red-200' :
                        usr.role === 'dept_head' ? 'bg-amber-900/10 text-amber-800 border-amber-200' :
                        usr.role === 'officer' ? 'bg-emerald-900/10 text-emerald-800 border-emerald-200' :
                        'bg-slate-900/10 text-slate-800 border-slate-200'
                      }`}>
                        {usr.role === 'admin' ? 'System admin' : usr.role === 'dept_head' ? 'Dept Head' : usr.role === 'officer' ? 'Admissions Officer' : 'Applicant'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-gray-500">{usr.email}</td>
                    <td className="px-6 py-3.5 text-right flex justify-end items-center h-full min-h-[38px]">
                      {deletingUserId === userId ? (
                        <div className="flex items-center space-x-1.5 animate-fadeIn">
                          <button
                            onClick={async () => {
                              const success = await deleteUser(userId);
                              if (success) {
                                fetchAllUsers();
                              }
                              setDeletingUserId(null);
                            }}
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingUserId(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded text-[10px] uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUserClick(usr)}
                            className="p-1 rounded text-gray-400 hover:text-academic-crimson hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUserId(userId)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
