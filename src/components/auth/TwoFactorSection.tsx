'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield, Loader2, Eye, EyeOff, Lock, Key, Check, Copy, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Simple QR code component using Google Charts API
function QRCodeImage({ value, size = 180 }: { value: string; size?: number }) {
  const encodedData = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;

  return (
    <Image
      src={qrUrl}
      alt="QR Code for authenticator"
      width={size}
      height={size}
      className="mx-auto"
      unoptimized
    />
  );
}

interface TwoFactorSectionProps {
  isEnabled: boolean;
  onStatusChange: () => void;
}

export function TwoFactorSection({ isEnabled, onStatusChange }: TwoFactorSectionProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Setup state
  const [setupData, setSetupData] = useState<{
    secret: string;
    authUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Disable state
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  // Handle start setup
  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to start 2FA setup');
      }

      const data = await response.json();
      setSetupData({
        secret: data.secret,
        authUrl: data.auth_url,
        backupCodes: data.backup_codes,
      });
      setShowSetup(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify and enable
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid verification code');
      }

      toast.success('Two-factor authentication enabled successfully!');
      setShowSetup(false);
      setSetupData(null);
      setVerificationCode('');
      onStatusChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disable
  const handleDisable = async () => {
    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: disablePassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to disable 2FA');
      }

      toast.success('Two-factor authentication disabled');
      setShowDisable(false);
      setDisablePassword('');
      onStatusChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    const content = [
      'ScamNemesis - Two-Factor Authentication Backup Codes',
      '====================================================',
      '',
      'Store these codes in a safe place. Each code can only be used once.',
      'If you lose access to your authenticator app, use one of these codes to log in.',
      '',
      ...setupData.backupCodes,
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scamnemesis-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-slate-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-500">
                {isEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Not Enabled
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!showSetup && !showDisable ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {isEnabled
                ? 'Two-factor authentication is currently enabled. You can disable it if needed.'
                : 'Protect your account with an authenticator app like Google Authenticator or Authy.'}
            </p>
            {isEnabled ? (
              <button
                onClick={() => setShowDisable(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleStartSetup}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0E74FF] hover:bg-[#0a5fd6] rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enable 2FA'}
              </button>
            )}
          </div>
        ) : showSetup && setupData ? (
          <div className="space-y-6">
            {/* Step 1: QR Code */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Step 1: Scan QR Code</h4>
              <p className="text-xs text-slate-500">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-6 bg-white rounded-xl border border-slate-200">
                <QRCodeImage value={setupData.authUrl} size={180} />
              </div>
              <div className="text-center">
                <button
                  onClick={() => copyToClipboard(setupData.secret, 'Secret key')}
                  className="text-xs text-[#0E74FF] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Copy className="h-3 w-3" />
                  Can&apos;t scan? Copy secret key manually
                </button>
              </div>
            </div>

            {/* Step 2: Backup Codes */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Step 2: Save Backup Codes</h4>
              <p className="text-xs text-slate-500">
                Store these codes in a safe place. You&apos;ll need them if you lose access to your authenticator.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono text-slate-700 bg-white px-3 py-1.5 rounded border border-slate-200 text-center">
                      {code}
                    </code>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'Backup codes')}
                    className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    These codes will only be shown once. Save them now!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Verify */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Step 3: Verify Setup</h4>
              <p className="text-xs text-slate-500">
                Enter the 6-digit code from your authenticator app to complete setup.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 text-center text-lg font-mono tracking-widest rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowSetup(false);
                  setSetupData(null);
                  setVerificationCode('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                className="px-6 py-2 text-sm font-medium text-white bg-[#0E74FF] hover:bg-[#0a5fd6] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Verify & Enable
              </button>
            </div>
          </div>
        ) : showDisable ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Warning</p>
                  <p className="text-xs text-red-600 mt-1">
                    Disabling two-factor authentication will make your account less secure.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Enter your password to disable 2FA
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showDisablePassword ? 'text' : 'password'}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-[#0E74FF] focus:ring-4 focus:ring-[#0E74FF]/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showDisablePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowDisable(false);
                  setDisablePassword('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable}
                disabled={isLoading || !disablePassword}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Disable 2FA
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
