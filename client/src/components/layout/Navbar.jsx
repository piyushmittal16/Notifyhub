import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Sun, Moon, ChevronDown, Check, Plus, LogOut, Shield, Pencil, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin, updateProfile } = useAuth();
  const { projects, selectedProject, selectProject, openCreateProject } = useProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const projectMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setProjectDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile(profileName.trim());
      setIsEditProfileOpen(false);
    } catch (err) {
      // handled in context
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <header className="h-14 border-b border-line bg-surface flex items-center gap-3 px-4 sticky top-0 z-20">
      {/* Brand Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-base text-ink">
        <span className="w-7 h-7 rounded-lg bg-brand text-white grid place-items-center text-xs font-bold">
          N
        </span>
        NotifyHub
      </Link>

      {/* 📁 Project Switcher Dropdown */}
      <div className="relative ml-2" ref={projectMenuRef}>
        <button
          onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
          className="hidden sm:flex items-center gap-2 border border-line rounded-lg px-3 py-1.5 text-sub hover:bg-elev text-xs font-medium cursor-pointer transition-colors"
        >
          <span>Project:</span>
          <b className="text-ink font-semibold max-w-[140px] truncate">
            {selectedProject ? selectedProject.name : 'No Projects'}
          </b>
          <ChevronDown className="w-3.5 h-3.5 text-mute" />
        </button>

        {projectDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-xl z-50">
            <div className="px-2 py-1 text-[11px] font-semibold text-mute uppercase tracking-wider">
              Your Projects
            </div>
            
            <div className="max-h-56 overflow-y-auto my-1 flex flex-col gap-0.5">
              {projects.length === 0 ? (
                <div className="px-2 py-2 text-xs text-sub text-center">
                  No projects found.
                </div>
              ) : (
                projects.map((proj) => (
                  <button
                    key={proj._id}
                    onClick={() => {
                      selectProject(proj);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer text-left transition-colors ${
                      selectedProject?._id === proj._id
                        ? 'bg-elev text-ink font-semibold'
                        : 'text-sub hover:bg-elev hover:text-ink'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    {selectedProject?._id === proj._id && (
                      <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-line pt-1 mt-1">
              <button
                onClick={() => {
                  setProjectDropdownOpen(false);
                  openCreateProject();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-elev cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-3">
        {/* 🌙 Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 grid place-items-center rounded-lg border border-line hover:bg-elev text-ink cursor-pointer transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warn" />
          ) : (
            <Moon className="w-4 h-4 text-ink" />
          )}
        </button>

        {/* 👤 User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-elev grid place-items-center text-xs font-semibold text-ink border border-line">
              {getInitials(user?.name)}
            </span>
            <span className="hidden md:inline text-xs rounded-full px-2 py-0.5 bg-elev text-sub font-medium capitalize">
              {user?.role || 'Developer'}
            </span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-surface p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-line">
                <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                <p className="text-[11px] text-mute truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-brand bg-elev px-1.5 py-0.5 rounded">
                    <Shield className="w-3 h-3" /> Admin Account
                  </span>
                )}
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setProfileName(user?.name || '');
                    setIsEditProfileOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-sub hover:text-ink hover:bg-elev cursor-pointer transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile Name</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-bad hover:bg-elev cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> Edit Profile Name
              </h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-mute hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-sub block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-line text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-3.5 py-1.5 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
