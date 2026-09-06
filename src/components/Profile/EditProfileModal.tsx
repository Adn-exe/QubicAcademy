// ============================================================
// QuantumLearn AI — Edit Profile Modal
// Design Tokens: --void (#0A0E1A), --panel (#12172A), --paper (#F7F6F1),
//                --ink (#1B1E24 / #E2E8F0), --signal-cyan (#4FD1D9),
//                --cryostat-gold (#D9A441), --error (#C1543A), --success (#4E9E7B)
// Modal Convention: Normal-flow flex container with centered card, flat dim backdrop (no blur).
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { useProfileStore, type UserProfileData } from '../../core/profileStore';
import { updateProfile } from '../../lib/db';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onSuccessToast: (message: string) => void;
}

const ROLE_OPTIONS = [
  'Student',
  'Researcher',
  'Educator',
  'Professional',
  'Other',
] as const;

const ACCENT_COLORS = [
  { name: 'Cryostat Gold', value: '#D9A441' },
  { name: 'Signal Cyan', value: '#4FD1D9' },
  { name: 'Quantum Teal', value: '#4E9E7B' },
  { name: 'Violet', value: '#A78BFA' },
  { name: 'Coral', value: '#F87171' },
];

function applyTheme(theme: 'light' | 'dark' | 'system') {
  if (theme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (theme === 'dark') {
    document.documentElement.classList.remove('light-theme');
  } else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    document.documentElement.classList.toggle('light-theme', prefersLight);
  }
}

export function EditProfileModal({
  isOpen,
  onClose,
  triggerRef,
  onSuccessToast,
}: EditProfileModalProps) {
  const currentProfile = useProfileStore((s) => s.data.profile);
  const updateProfileHeader = useProfileStore((s) => s.updateProfileHeader);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<string>('Student');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [avatarInitials, setAvatarInitials] = useState('QL');
  const [avatarAccent, setAvatarAccent] = useState('#D9A441');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

  // Validation & Error states
  const [nameError, setNameError] = useState('');
  const [bioError, setBioError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Track initial values for rollback & diffing
  const initialThemeRef = useRef<'light' | 'dark' | 'system'>('dark');
  const initialProfileRef = useRef<UserProfileData['profile'] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill on open & remember initial theme for cancel revert
  useEffect(() => {
    if (isOpen) {
      const activeTheme = currentProfile.theme || (localStorage.getItem('quantumlearn-theme') as 'light' | 'dark' | 'system') || 'dark';
      initialThemeRef.current = activeTheme;
      initialProfileRef.current = { ...currentProfile };

      setName(currentProfile.name || '');
      setBio(currentProfile.bio || '');

      // Normalize role to one of the 5 options if matching
      const foundRole = ROLE_OPTIONS.find((r) => r.toLowerCase() === currentProfile.role.toLowerCase())
        || (currentProfile.role.toLowerCase().includes('student') ? 'Student' : null)
        || (currentProfile.role.toLowerCase().includes('research') ? 'Researcher' : null)
        || (currentProfile.role.toLowerCase().includes('educat') ? 'Educator' : null)
        || (currentProfile.role.toLowerCase().includes('prof') ? 'Professional' : null)
        || (ROLE_OPTIONS.includes(currentProfile.role as any) ? currentProfile.role : 'Other');
      setRole(foundRole);

      setTheme(activeTheme);
      setAvatarInitials(
        currentProfile.avatarInitials ||
        (currentProfile.name
          ? currentProfile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
          : 'QL')
      );

      setNameError('');
      setBioError('');
      setServerError('');
      setShowAvatarCustomizer(false);
      setIsSaving(false);
    }
  }, [isOpen, currentProfile]);

  // Focus trapping & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus on the first interactive element
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 40);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle live theme preview
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Revert preview and close
  const handleCancel = () => {
    // Revert live theme preview back to initial saved value
    applyTheme(initialThemeRef.current);
    onClose();
    // Return focus to trigger button
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 20);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateBio = () => {
    if (bio.length > 160) {
      setBioError('Bio must be 160 characters or less');
      return false;
    }
    setBioError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const isNameValid = validateName();
    const isBioValid = validateBio();
    if (!isNameValid || !isBioValid) {
      return;
    }

    const initial = initialProfileRef.current || currentProfile;

    // Send only fields that changed
    const changedFields: Partial<UserProfileData['profile']> = {};
    if (name.trim() !== initial.name) {
      changedFields.name = name.trim();
    }
    if (bio.trim() !== (initial.bio || '').trim()) {
      changedFields.bio = bio.trim();
    }
    if (role !== initial.role) {
      changedFields.role = role;
    }
    if (theme !== initial.theme) {
      changedFields.theme = theme;
    }
    if (avatarInitials.trim() && avatarInitials.trim() !== initial.avatarInitials) {
      changedFields.avatarInitials = avatarInitials.trim().toUpperCase();
    }

    // If nothing changed, just close cleanly
    if (Object.keys(changedFields).length === 0) {
      onClose();
      triggerRef.current?.focus();
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update Supabase backend
      await updateProfile(changedFields);

      // 2. Update local Zustand store and storage immediately
      updateProfileHeader(changedFields);

      // 3. Persist theme setting in localStorage if theme changed
      if (changedFields.theme) {
        localStorage.setItem('quantumlearn-theme', changedFields.theme);
        applyTheme(changedFields.theme);
      }

      setIsSaving(false);
      onClose();
      onSuccessToast('Profile updated');
      triggerRef.current?.focus();
    } catch (err: any) {
      console.error('Failed to save profile changes:', err);
      setIsSaving(false);
      setServerError("Couldn't save your changes. Try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex min-h-full items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[480px] bg-[var(--panel)] border border-white/10 rounded-[12px] shadow-2xl p-6 text-[var(--ink)] my-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2
            id="edit-profile-title"
            className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight"
          >
            Edit profile
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-lg bg-[var(--error)]/15 border border-[var(--error)]/40 text-[var(--error)] text-xs sm:text-[13px] flex items-center gap-2.5 animate-fade-in"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2.5">
            {/* Initials Circle Preview */}
            <div
              className="w-16 h-16 rounded-full bg-[var(--void)] flex items-center justify-center font-mono font-bold text-xl shadow-inner transition-colors duration-200"
              style={{
                border: `2px solid ${avatarAccent}`,
                color: avatarAccent,
              }}
            >
              {avatarInitials || 'QL'}
            </div>

            {/* Change Affordance */}
            <button
              type="button"
              onClick={() => setShowAvatarCustomizer(!showAvatarCustomizer)}
              className="text-xs font-mono text-[var(--signal-cyan)] hover:underline flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-white/5 transition-colors"
            >
              <Palette size={13} />
              <span>{showAvatarCustomizer ? 'Done changing avatar' : 'Change initials & accent'}</span>
            </button>

            {/* Avatar Customizer Dropdown */}
            {showAvatarCustomizer && (
              <div className="w-full bg-[var(--void)] border border-white/10 rounded-xl p-3 space-y-3 animate-fade-in text-left">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-mono text-slate-400">
                    Initials (1-3 chars):
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={avatarInitials}
                    onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                    className="w-20 bg-[var(--panel)] border border-white/15 rounded-md px-2 py-1 text-xs font-mono text-center text-white focus:border-[var(--signal-cyan)] outline-none"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                    Accent Color:
                  </span>
                  <div className="flex items-center gap-2">
                    {ACCENT_COLORS.map((accent) => (
                      <button
                        key={accent.name}
                        type="button"
                        onClick={() => setAvatarAccent(accent.value)}
                        title={accent.name}
                        style={{ backgroundColor: accent.value }}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                          avatarAccent === accent.value
                            ? 'ring-2 ring-white scale-110 border-transparent'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        aria-label={`Select ${accent.name} accent`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Name Field (Required) */}
          <div>
            <label
              htmlFor="edit-profile-name"
              className="block text-xs font-mono text-slate-300 font-medium mb-1.5"
            >
              Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="edit-profile-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              onBlur={validateName}
              placeholder="e.g. Marie Curie"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-error' : undefined}
              className={`w-full bg-[var(--void)] border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[var(--ink)] font-sans transition-colors outline-none ${
                nameError
                  ? 'border-[var(--error)] focus:border-[var(--error)]'
                  : 'border-white/15 focus:border-[var(--signal-cyan)]'
              }`}
            />
            {nameError && (
              <p id="name-error" className="text-[13px] text-[var(--error)] mt-1.5 animate-fade-in font-sans">
                {nameError}
              </p>
            )}
          </div>

          {/* Bio Field (Optional, 160 chars max) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="edit-profile-bio"
                className="text-xs font-mono text-slate-300 font-medium"
              >
                Bio
              </label>
              <span
                className={`text-xs font-mono transition-colors ${
                  bio.length > 160
                    ? 'text-[var(--error)] font-bold'
                    : 'text-slate-400'
                }`}
              >
                {bio.length}/160
              </span>
            </div>
            <textarea
              id="edit-profile-bio"
              rows={2}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if (bioError && e.target.value.length <= 160) setBioError('');
              }}
              onBlur={validateBio}
              placeholder="A brief note about your background or quantum interests..."
              aria-invalid={!!bioError}
              aria-describedby={bioError ? 'bio-error' : undefined}
              className={`w-full bg-[var(--void)] border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[var(--ink)] font-sans transition-colors outline-none resize-none leading-relaxed ${
                bioError || bio.length > 160
                  ? 'border-[var(--error)] focus:border-[var(--error)]'
                  : 'border-white/15 focus:border-[var(--signal-cyan)]'
              }`}
            />
            {bioError && (
              <p id="bio-error" className="text-[13px] text-[var(--error)] mt-1.5 animate-fade-in font-sans">
                {bioError}
              </p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <label
              htmlFor="edit-profile-role"
              className="block text-xs font-mono text-slate-300 font-medium mb-1.5"
            >
              Role
            </label>
            <div className="relative">
              <select
                id="edit-profile-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[var(--void)] border border-white/15 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[var(--ink)] font-sans focus:border-[var(--signal-cyan)] outline-none appearance-none cursor-pointer pr-9"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#12172A] text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Theme Preference (Segmented Control with Live Preview) */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-medium mb-1.5">
              Theme preference
            </label>
            <div
              className="grid grid-cols-3 gap-1 p-1 bg-[var(--void)] rounded-xl border border-white/10"
              role="radiogroup"
              aria-label="Theme preference"
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[var(--panel)] text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/5'
                }`}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[var(--panel)] text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/5'
                }`}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'system'}
                onClick={() => handleThemeChange('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-[var(--panel)] text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/5'
                }`}
              >
                <Laptop size={13} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10 mt-6">
            {/* Cancel (Ghost / Outline) */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-white/15 text-xs sm:text-sm font-mono text-slate-300 hover:text-[var(--ink)] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save Changes (Primary Cryostat Gold) */}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[var(--cryostat-gold)] hover:bg-[#c49235] text-[#0A0E1A] font-mono font-bold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0A0E1A] border-t-transparent rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
