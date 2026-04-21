import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, ShieldCheck, Users, Lock, Mail, ArrowRight, BrainCircuit } from 'lucide-react';
import { Role, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const PALETTE = {
  primary: '#1F3A5F', // Navy
  secondary: '#2E8BC0', // Steel Blue
  accent: '#27AE60', // Emerald
  background: '#F7F9FC', // Light Gray
};

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Better student name mapping for demo
    let name = selectedRole === 'staff' ? 'Faculty Member' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + ' User';
    
    if (selectedRole === 'student') {
      const emailLower = (email || '').toLowerCase();
      if (emailLower.includes('alex')) name = 'Alex Johnson';
      else if (emailLower.includes('emma')) name = 'Emma Wilson';
      else if (emailLower.includes('james')) name = 'James Chen';
      else if (emailLower.includes('sophia')) name = 'Sophia Garcia';
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: email || `${selectedRole}@unipath.ai`,
      role: selectedRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRole}`,
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F9FC]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="bg-gradient-to-br from-[#1F3A5F] to-[#2E8BC0] p-10 text-white text-center">
          <div className="inline-flex p-4 rounded-2xl bg-white/10 mb-6 backdrop-blur-md">
            <BrainCircuit size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">UniPath AI</h1>
          <p className="text-blue-50 text-sm mt-2 font-medium">University Success & Career Intelligence</p>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl">
            {(['student', 'staff', 'admin'] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                  selectedRole === role 
                    ? 'bg-white text-[#1F3A5F] shadow-md' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {role === 'student' && <UserCircle size={14} />}
                {role === 'staff' && <Users size={14} />}
                {role === 'admin' && <ShieldCheck size={14} />}
                {role === 'staff' ? 'Faculty' : role}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">University Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@unipath.ai`}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#2E8BC0] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#2E8BC0] outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1F3A5F] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#152a45] transition-all shadow-xl shadow-slate-100 mt-8"
            >
              Sign In as {selectedRole === 'staff' ? 'Faculty' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            {selectedRole === 'student' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sample Student Accounts</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['alex', 'emma', 'james', 'sophia'].map(account => (
                    <span key={account} className="text-[10px] bg-white px-2 py-1 rounded-lg text-slate-500 border border-slate-100">
                      {account}@unipath.ai
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">
              Authorized personnel only. Access is monitored and logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
