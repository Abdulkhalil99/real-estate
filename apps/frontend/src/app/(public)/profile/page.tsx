'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, Save, Key, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { User as UserType } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();

  const [user,       setUser]       = useState<UserType | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [activeTab,  setActiveTab]  = useState<'profile' | 'password'>('profile');

  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [profileError,   setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [pwErrors,  setPwErrors]  = useState<Record<string, string>>({});
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    const u = authHelper.getUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setPhone(u.phone || '');
    setLoading(false);
  }, [router]);

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!firstName.trim() || !lastName.trim()) {
      setProfileError('First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ firstName, lastName, phone });

      // Update stored user
      const currentToken = authHelper.getAccessToken()  || '';
      const refreshToken = authHelper.getRefreshToken() || '';
      authHelper.saveSession({ user: updated, accessToken: currentToken, refreshToken });
      setUser(updated);
      setProfileSuccess('Profile updated successfully');
      toast.success('Profile updated');
    } catch (err) {
      const msg = getErrorMessage(err);
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const validatePw = () => {
    const e: Record<string, string> = {};
    if (!currentPassword)  e.currentPassword = 'Current password is required';
    if (!newPassword)      e.newPassword      = 'New password is required';
    else if (newPassword.length < 8)
      e.newPassword = 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword))
      e.newPassword = 'Must include uppercase, lowercase and a number';
    if (newPassword !== confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!validatePw()) return;

    setChangingPw(true);
    try {
      // Call the correct backend endpoint with currentPassword + newPassword
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setPwSuccess('Password changed successfully. Please log in again.');
      toast.success('Password changed!');

      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Log out after 2 seconds so user logs in with new password
      setTimeout(() => {
        authHelper.clearSession();
        router.push('/auth/login');
      }, 2000);

    } catch (err) {
      const msg = getErrorMessage(err);
      setPwError(msg);
      toast.error(msg);
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = async () => {
    try {
      const rt = authHelper.getRefreshToken();
      if (rt) await authApi.logout(rt);
    } catch {}
    authHelper.clearSession();
    toast.success('Logged out');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#f4f6f9' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8edf2' }}>
        <div className="container py-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2c3e50' }}>My Profile</h1>
          <p className="text-sm mt-1" style={{ color: '#7f8c8d' }}>
            Manage your account settings
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 text-center">
              <div className="avatar avatar-xl mx-auto mb-3"
                style={{ background: '#ebf5fb', color: '#1a6fa3' }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <p className="font-bold" style={{ color: '#2c3e50' }}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm mt-0.5" style={{ color: '#7f8c8d' }}>{user.email}</p>
              <span className="badge badge-info mt-2 inline-block">{user.role}</span>
            </div>

            <div className="card overflow-hidden">
              {[
                { id: 'profile',  icon: User, label: 'Profile info'    },
                { id: 'password', icon: Key,  label: 'Change password' },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id}
                  onClick={() => {
                    setActiveTab(id as 'profile' | 'password');
                    setProfileError(''); setProfileSuccess('');
                    setPwError('');     setPwSuccess('');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors text-left"
                  style={{
                    background:   activeTab === id ? '#ebf5fb' : 'transparent',
                    color:        activeTab === id ? '#1a6fa3' : '#5d6d7e',
                    borderBottom: '1px solid #f0f3f6',
                  }}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}

              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium"
                style={{ color: '#e74c3c' }}>
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3">

            {/* ── Profile tab ──────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold mb-5" style={{ color: '#2c3e50' }}>
                  Profile information
                </h2>

                {profileError && (
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: '#fadbd8', border: '1px solid #f1948a' }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#e74c3c' }} />
                    <p className="text-sm font-medium" style={{ color: '#922b21' }}>
                      {profileError}
                    </p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: '#d5f5e3', border: '1px solid #82e0aa' }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1e8449' }} />
                    <p className="text-sm font-medium" style={{ color: '#1e8449' }}>
                      {profileSuccess}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: '#95a5a6' }} />
                        <input type="text" className="input pl-10"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Last name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: '#95a5a6' }} />
                        <input type="text" className="input pl-10"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#95a5a6' }} />
                      <input type="email" className="input pl-10"
                        style={{ opacity: 0.6 }}
                        value={user.email} disabled />
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#95a5a6' }}>
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="label">Phone number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#95a5a6' }} />
                      <input type="tel" className="input pl-10"
                        placeholder="+216 XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Role</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: '#95a5a6' }} />
                      <input type="text" className="input pl-10"
                        style={{ opacity: 0.6 }}
                        value={user.role} disabled />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit"
                      className="btn btn-primary flex items-center gap-2"
                      disabled={saving}>
                      {saving
                        ? <span className="spinner" style={{ width: 16, height: 16 }} />
                        : <><Save className="w-4 h-4" />Save changes</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Password tab ─────────────────────────────────────────── */}
            {activeTab === 'password' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold mb-2" style={{ color: '#2c3e50' }}>
                  Change password
                </h2>
                <p className="text-sm mb-5" style={{ color: '#7f8c8d' }}>
                  After changing your password you will be logged out automatically.
                </p>

                {/* Error banner */}
                {pwError && (
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: '#fadbd8', border: '1px solid #f1948a' }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#e74c3c' }} />
                    <p className="text-sm font-medium" style={{ color: '#922b21' }}>
                      {pwError}
                    </p>
                  </div>
                )}

                {/* Success banner */}
                {pwSuccess && (
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                    style={{ background: '#d5f5e3', border: '1px solid #82e0aa' }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1e8449' }} />
                    <p className="text-sm font-medium" style={{ color: '#1e8449' }}>
                      {pwSuccess}
                    </p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">

                  <div>
                    <label className="label">Current password</label>
                    <input type="password"
                      className={'input ' + (pwErrors.currentPassword ? 'input-error' : '')}
                      placeholder="Your current password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPwError('');
                        setPwErrors((p) => ({ ...p, currentPassword: '' }));
                      }} />
                    {pwErrors.currentPassword && (
                      <p className="error-msg">{pwErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">New password</label>
                    <input type="password"
                      className={'input ' + (pwErrors.newPassword ? 'input-error' : '')}
                      placeholder="Min 8 chars, upper + lower + number"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPwError('');
                        setPwErrors((p) => ({ ...p, newPassword: '' }));
                      }} />
                    {pwErrors.newPassword && (
                      <p className="error-msg">{pwErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Confirm new password</label>
                    <input type="password"
                      className={'input ' + (pwErrors.confirmPassword ? 'input-error' : '')}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPwErrors((p) => ({ ...p, confirmPassword: '' }));
                      }} />
                    {pwErrors.confirmPassword && (
                      <p className="error-msg">{pwErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button type="submit"
                      className="btn btn-primary flex items-center gap-2"
                      disabled={changingPw || !!pwSuccess}>
                      {changingPw
                        ? <span className="spinner" style={{ width: 16, height: 16 }} />
                        : <><Key className="w-4 h-4" />Change password</>
                      }
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
