import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import type { User } from '../types';
import { User as UserIcon, Save, Mail, Lock, Download, Upload, FileJson } from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name);
      setEmail(currentUser.email);
      setBio(currentUser.bio || '');
    }
  }, []);

  const handleSave = () => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      name,
      email,
      bio,
    };

    if (newPassword) {
      updatedUser.password = newPassword;
    }

    StorageService.updateUser(updatedUser);
    setUser(updatedUser);
    showMessage('Profile updated successfully!', 'success');
    setNewPassword('');
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadBackup = () => {
    const backupData = StorageService.createBackup();
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindbase_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('Backup downloaded successfully.', 'success');
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = StorageService.restoreBackup(content);
      if (success) {
        showMessage('Data restored successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showMessage('Failed to restore data. Invalid file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Profile</h2>

      <div className="bg-surface border border-slate-700 rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-4 border-4 border-slate-600">
            <UserIcon size={48} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-slate-500">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
          <div className="mt-2 text-xs text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">
            Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
          </div>
        </div>

        {message && (
          <div className={`px-4 py-2 rounded-lg mb-6 text-center text-sm border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Personal Bio / Notes</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-1">Change Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password to change"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>

        {/* Data Management Section */}
        <div className="mt-10 pt-8 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileJson size={20} className="text-indigo-400" />
                Data Management
            </h4>
            <p className="text-slate-400 text-sm mb-4">
                Your data is stored securely in this browser. To keep it safe or move it to another device, download a backup file.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={handleDownloadBackup}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-indigo-300 py-3 rounded-xl transition-colors"
                >
                    <Download size={18} /> Download Backup
                </button>
                <div className="flex-1 relative">
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef}
                        onChange={handleUploadBackup}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="w-full h-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-300 py-3 rounded-xl transition-colors pointer-events-none">
                        <Upload size={18} /> Restore from Backup
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;