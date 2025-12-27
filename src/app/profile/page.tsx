'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar, CheckCircle, AlertCircle, Save, Loader2, FileText, Lock, Eye, EyeOff, Key, Check } from 'lucide-react';
import { useUser, useRequireAuth } from '@/lib/auth/user-context';
import { toast } from 'sonner';
import { TwoFactorSection } from '@/components/auth/TwoFactorSection';

const passwordRequirements = [
  { label: 'At least 9 characters', test: (pwd: string) => pwd.length >= 9 },
  { label: 'Contains uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd: string) => /[0-9]/.test(pwd) },
  { label: 'Contains special character', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshUser, logout } = useUser();
  const { isLoading: authCheckLoading } = useRequireAuth('/auth/login');

  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    try {
      const response = await fetch('/api/v1/auth/2fa/status', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  // Load user data into form
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setName(user.name || '');
      setBio(user.bio || '');
      fetch2FAStatus();
    }
  }, [user]);

  // Handle profile update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim() || undefined,
          displayName: displayName.trim() || undefined,
          bio: bio.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save changes');
      }

      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    setIsResendingVerification(true);

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user?.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send verification email');
      }

      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
    if (!allRequirementsMet) {
      toast.error('New password does not meet all requirements');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/v1/auth/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      toast.success('Password changed successfully. You will be redirected to login.');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordSection(false);

      // Logout and redirect to login (sessions were invalidated)
      setTimeout(() => {
        if (logout) {
          logout();
        }
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const allPasswordRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
  const passwordsMatch = newPassword === confirmNewPassword && confirmNewPassword.length > 0;

  // Get role display name
  const getRoleDisplay = (role?: string) => {
    const roles: Record<string, { label: string; color: string }> = {
      BASIC: { label: 'Basic', color: 'bg-slate-100 text-slate-700' },
      STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-700' },
      GOLD: { label: 'Gold', color: 'bg-amber-100 text-amber-700' },
      ADMIN: { label: 'Administrator', color: 'bg-purple-100 text-purple-700' },
      SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
    };
    return roles[role || 'BASIC'] || roles.BASIC;
  };

  // Show loading state
  if (authLoading || authCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0E74FF]" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleInfo = getRoleDisplay(user.role);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your personal information and account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#0E74FF] to-blue-700 px-6 py-8">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.displayName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-xl font-semibold">{user.displayName || user.name || user.email.split('@')[0]}</h2>
                <p className="text-blue-100">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                    <Shield className="h-3 w-3 mr-1.5" />
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Verification Status */}
          {!user.emailVerified && (
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Email not verified</p>
                    <p className="text-xs text-amber-600">Verify your email for full access to features</p>
                  </div>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isResendingVerification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Resend'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Display Name (Public Nickname) */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
                Display Name (public)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others will see you"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm"
                />
              </div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                This name will be visible to other users
              </p>
            </div>

            {/* Full Name (Private) */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Full Name (private)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Your name is private and will not be shown to others
              </p>
            </div>

            {/* Bio (Optional) */}
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">
                About me (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={3}
                  maxLength={500}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm resize-none"
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">A short description about you (optional)</span>
                <span className={`${bio.length > 450 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {bio.length}/500
                </span>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
                {user.emailVerified && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">Account Type</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{roleInfo.label}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium">Member Since</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">December 2024</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0E74FF] hover:bg-[#0a5fd6] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="px-4 py-2 text-sm font-medium text-[#0E74FF] hover:bg-[#0E74FF]/10 rounded-lg transition-colors"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-600 mb-2">Password requirements:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {passwordRequirements.map((req, index) => {
                        const met = req.test(newPassword);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-500' : 'bg-slate-200'}`}>
                              {met && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <span className={`text-xs ${met ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Enter new password again"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all text-sm ${
                      confirmNewPassword && !passwordsMatch
                        ? 'border-red-300 bg-red-50'
                        : confirmNewPassword && passwordsMatch
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200'
                    } focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmNewPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    After changing your password, you will be logged out from all devices and will need to log in again.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword || !allPasswordRequirementsMet || !passwordsMatch || !currentPassword}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0E74FF] hover:bg-[#0a5fd6] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Key className="h-5 w-5" />
                )}
                {isChangingPassword ? 'Changing password...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="mt-8">
          <TwoFactorSection
            isEnabled={is2FAEnabled}
            onStatusChange={fetch2FAStatus}
          />
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Delete Account</p>
                <p className="text-xs text-slate-500 mt-1">This action is irreversible. All your data will be deleted.</p>
              </div>
              <button
                onClick={() => toast.info('Contact support to delete your account')}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
