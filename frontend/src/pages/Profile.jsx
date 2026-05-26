import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { User, Camera, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Profile = () => {
  const { user, updateProfile, updateAvatarState } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  // Status management
  const [submitLoading, setSubmitLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setSkills(user.skills || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await updateProfile(fullName, bio, skills);
      setStatusMsg({ type: 'success', text: 'Profile details updated successfully.' });
    } catch (error) {
      setStatusMsg({ type: 'error', text: error });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and type
    if (file.size > 2 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Avatar file size must be less than 2MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await API.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Update local storage and context
      updateAvatarState(res.data.profileImage);
      setStatusMsg({ type: 'success', text: 'Profile avatar updated successfully.' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload image.' });
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!user) return null;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center space-x-3 mb-8">
        <User className="text-cyan-400 w-8 h-8" />
        <div>
          <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-1">Configure your public freelancer & client identities.</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`mb-6 p-4 rounded-lg border text-sm flex items-start space-x-2 animate-fadeIn ${
          statusMsg.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-350'
            : 'bg-rose-950/40 border-rose-800/40 text-rose-350'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Sidebar Panel */}
        <div className="md:col-span-1">
          <GlassCard className="border border-slate-900 text-center flex flex-col items-center">
            <div className="relative mb-4 group">
              <img
                src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE}${user.profileImage}`) : '/uploads/default-avatar.png'}
                alt={user.fullName}
                className="w-32 h-32 rounded-full border border-slate-800 object-cover shadow-xl"
              />
              {avatarLoading && (
                <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 cursor-pointer shadow-lg transition-transform group-hover:scale-110">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarLoading}
                />
              </label>
            </div>

            <h3 className="text-white font-bold text-base mb-1">{user.fullName}</h3>
            <p className="text-xs text-slate-500 mb-6">{user.email}</p>

            <div className="w-full border-t border-slate-900 pt-4 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold mb-2">
                Identity Status
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified Account (Client/Freelancer)</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Bio & Details Form */}
        <div className="md:col-span-2">
          <GlassCard className="border border-slate-900">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Biography / Professional Statement
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg placeholder-slate-650"
                  placeholder="Describe your freelance business, projects you look to post, or specialized coding services you offer..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg placeholder-slate-650"
                  placeholder="e.g. React, Node.js, Tailwind CSS, Database Optimization"
                />
                <span className="text-[10px] text-slate-500 mt-2 block">
                  Add tags to display on your freelancer applications. Separate tags with a comma.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-sm transition-all hover:brightness-110 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
