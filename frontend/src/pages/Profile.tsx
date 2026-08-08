import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-8 text-center sm:text-left sm:flex sm:items-start sm:space-x-8">
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="h-32 w-32 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white mx-auto sm:mx-0 shadow-lg border-4 border-white/10">
            {initials}
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
            <p className="text-slate-400 text-lg">{user.email}</p>
          </div>
          
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-12">
              <div>
                <p className="text-sm font-medium text-slate-400">Role</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-400">Member Since</p>
                <p className="mt-1 text-slate-200 font-medium">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
