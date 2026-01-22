import { useState, useEffect, FormEvent } from 'react';
import { User, Mail, Phone, FileText, Camera, Save, LogOut } from 'lucide-react';
import { Profile, profileService } from '../lib/database';
import { supabase } from '../lib/supabase';

export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    phone: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const profileData = await profileService.get();
        if (profileData) {
          setProfile(profileData);
          setFormData({
            fullName: profileData.fullName || '',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            avatarUrl: profileData.avatarUrl || '',
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updatedProfile = await profileService.update({
        fullName: formData.fullName || undefined,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setError('');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message || 'Failed to sign out');
        setIsLoggingOut(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#537d90] rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#537d90] h-32"></div>

        <div className="px-6 pb-6">
          <div className="flex items-start -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-[#F8F9FA] p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera size={18} />
                </button>
              )}
            </div>

            <div className="ml-6 flex-1 mt-16">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#F8F9FA]">
                    {profile?.fullName || 'User Profile'}
                  </h1>
                  <p className="text-gray-300 mt-1">{email}</p>
                </div>

                {!isEditing && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-[#F8F9FA] rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                      className="px-4 py-2 border border-gray-300 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={18} />
                      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <Save size={18} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-300">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="+44 7700 900000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself and your property portfolio..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Camera size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-[#F8F9FA] font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-1">Full Name</h3>
                <p className="text-lg text-[#F8F9FA]">{profile?.fullName || 'Not provided'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-1">Email</h3>
                <p className="text-lg text-[#F8F9FA]">{email}</p>
              </div>

              {profile?.phone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Phone Number</h3>
                  <p className="text-lg text-[#F8F9FA]">{profile.phone}</p>
                </div>
              )}

              {profile?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Bio</h3>
                  <p className="text-lg text-[#F8F9FA] whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {!profile?.fullName && !profile?.phone && !profile?.bio && (
                <div className="text-center py-8">
                  <User size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-300">No profile information yet</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add your information
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
