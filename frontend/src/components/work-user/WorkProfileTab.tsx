import React, { useState, useEffect } from 'react';
import { User, Batch } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Layers,
  CheckCircle2,
  Radio,
  Check,
  AlertCircle,
  RefreshCw,
  Calendar,
  Sparkles,
  Globe,
  ExternalLink,
  Plus,
  Lock,
} from 'lucide-react';

interface WorkProfileTabProps {
  currentUser: User;
  batches: Batch[];
}

export const WorkProfileTab: React.FC<WorkProfileTabProps> = ({
  currentUser,
  batches,
}) => {
  const { updateUser, refreshWorkspaceUsers } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    designation: currentUser.designation || 'Team Member',
    avatar: currentUser.avatar || '',
    linkedin: currentUser.linkedin || '',
    github: currentUser.github || '',
    portfolioUrl: currentUser.portfolioUrl || '',
  });

  // Keep in sync with currentUser
  useEffect(() => {
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      designation: currentUser.designation || 'Team Member',
      avatar: currentUser.avatar || '',
      linkedin: currentUser.linkedin || '',
      github: currentUser.github || '',
      portfolioUrl: currentUser.portfolioUrl || '',
    });
  }, [currentUser]);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const updatedUser: User = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        // Designation / Job Role is strictly assigned by Admin and cannot be edited by the employee
        designation: currentUser.designation || 'Team Member',
        avatar: formData.avatar.trim(),
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
      };

      await updateUser(updatedUser);
      setIsEditing(false);
      showToast('Employee profile updated and saved successfully in real time.');
    } catch (err) {
      console.error('Failed to update employee profile:', err);
      setErrorMessage('Failed to save profile. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      designation: currentUser.designation || 'Team Member',
      avatar: currentUser.avatar || '',
      linkedin: currentUser.linkedin || '',
      github: currentUser.github || '',
      portfolioUrl: currentUser.portfolioUrl || '',
    });
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWorkspaceUsers();
      showToast('Employee profile re-synchronized in real time.');
    } catch {
      showToast('Refresh failed.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Real-Time Sync</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-2xl flex items-center space-x-2 shadow-2xs animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Hero Banner Header */}
        <div className="relative h-32 sm:h-36 bg-linear-to-r from-amber-600 via-orange-600 to-indigo-700 p-6 flex items-end justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh latest profile from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 text-[11px] font-medium backdrop-blur-xs">
              <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
              <span>Real-Time Active</span>
            </div>
          </div>
        </div>

        {/* Profile Info & Action Bar */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative -mt-14 sm:-mt-16 shrink-0">
                <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center ring-1 ring-slate-900/5">
                  <UserAvatar name={formData.name || currentUser.name} size="xl" className="w-full h-full text-2xl font-black rounded-none" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" title="Active Employee" />
              </div>

              {/* Name & Details - pushed down cleanly into the white section */}
              <div className="pt-2 sm:pt-4 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                    <Briefcase className="w-3 h-3 text-amber-600" />
                    Employee Contributor
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentUser.companyName || 'Enterprise Organization'}</span>
                  <span className="text-slate-300">•</span>
                  <span>{currentUser.designation || 'Team Member'}</span>
                </p>

                {/* Professional Links Badges (LinkedIn, GitHub, Portfolio) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {currentUser.linkedin ? (
                    <a
                      href={currentUser.linkedin.startsWith('http') ? currentUser.linkedin : `https://${currentUser.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] text-[11px] font-bold border border-[#0077b5]/20 transition-all cursor-pointer shadow-2xs"
                      title="Open LinkedIn Profile"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
                      </svg>
                      <span>LinkedIn</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ) : null}

                  {currentUser.github ? (
                    <a
                      href={currentUser.github.startsWith('http') ? currentUser.github : `https://${currentUser.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 text-[11px] font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                      title="Open GitHub Profile / Repositories"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                      </svg>
                      <span>GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ) : null}

                  {currentUser.portfolioUrl ? (
                    <a
                      href={currentUser.portfolioUrl.startsWith('http') ? currentUser.portfolioUrl : `https://${currentUser.portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                      title="Open Portfolio or Website"
                    >
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Portfolio</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ) : null}

                  {!currentUser.linkedin && !currentUser.github && !currentUser.portfolioUrl && !isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-slate-400 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add LinkedIn & GitHub</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions: Edit / Cancel / Save */}
            <div className="flex items-center gap-2 sm:self-center pt-2 sm:pt-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body: Form (Edit Mode) or Overview (View Mode) */}
          {isEditing ? (
            <form onSubmit={handleSave} className="pt-6 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Edit Employee Profile
                </h3>
                <span className="text-xs text-slate-400">Updates save to database in real time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex.dev@acme.internal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                    required
                  />
                </div>

                {/* Mobile / Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    Mobile / Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 492-1102"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                  />
                </div>

                {/* Designation / Title (Read-only, Assigned by Admin) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      Designation / Title
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                      <Lock className="w-2.5 h-2.5 text-slate-400" /> Assigned by Admin
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentUser.designation || 'Team Member'}
                      readOnly
                      disabled
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 bg-slate-100/70 cursor-not-allowed select-none shadow-none"
                      title="Designation is assigned by the admin and cannot be edited directly."
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Designation is managed and assigned by the administrator.</p>
                </div>

                {/* Section Header: Professional & Developer Profiles */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    Professional & Developer Links
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">Connect your LinkedIn profile, GitHub repository, and personal portfolio.</p>
                </div>

                {/* LinkedIn Profile URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-[#0077b5]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
                    </svg>
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                  />
                </div>

                {/* GitHub Profile / Repo URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-slate-800" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                    </svg>
                    GitHub Profile / Repository
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                  />
                </div>

                {/* Personal Portfolio / Website */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    Personal Portfolio / Website
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Contact Information */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    Contact & Professional
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Email
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={currentUser.email}>{currentUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Mobile
                      </span>
                      <span className="font-semibold text-slate-800">{currentUser.phone || 'Not configured'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Role
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{currentUser.designation || 'Team Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Organization & Account Info */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    Organization & Employment
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Employing Company</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{currentUser.companyName || 'Acme Solutions'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Employee ID</span>
                      <span className="font-mono text-slate-800 font-semibold text-[11px] truncate max-w-[140px]">{currentUser.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Account Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active & Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Links & Developer Repos */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-600" />
                      Profiles & Repos
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {/* LinkedIn */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-[#0077b5] shrink-0" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
                        </svg>
                        LinkedIn
                      </span>
                      {currentUser.linkedin ? (
                        <a
                          href={currentUser.linkedin.startsWith('http') ? currentUser.linkedin : `https://${currentUser.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[140px]"
                        >
                          <span>Connected</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not linked</span>
                      )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-slate-800 shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                        </svg>
                        GitHub Repo
                      </span>
                      {currentUser.github ? (
                        <a
                          href={currentUser.github.startsWith('http') ? currentUser.github : `https://${currentUser.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[140px]"
                        >
                          <span>Connected</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not linked</span>
                      )}
                    </div>

                    {/* Portfolio */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Portfolio
                      </span>
                      {currentUser.portfolioUrl ? (
                        <a
                          href={currentUser.portfolioUrl.startsWith('http') ? currentUser.portfolioUrl : `https://${currentUser.portfolioUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[140px]"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not linked</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Batches */}
              <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Assigned Project Batches ({batches.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Assigned deliverable workspaces</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {batches.length > 0 ? (
                    batches.map((batch) => (
                      <span
                        key={batch.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-semibold">{batch.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({batch.code})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No active batches assigned.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
