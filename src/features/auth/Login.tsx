import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/dashboard');
    },
    onError: () => setError('Invalid email or password. Please try again.'),
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm border border-gray-100"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          loginMutation.mutate({ email, password });
        }}
      >
        <h2 className="text-lg font-bold mb-1 text-[#1034A6]">Staff Portal</h2>
        <p className="text-xs text-gray-500 mb-5">Chemi Surveys &amp; Mapping Consultants</p>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <label className="text-xs text-gray-500 font-medium block mb-1">Email</label>
        <input
          className="w-full p-2.5 mb-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#1034A6]/30"
          type="email"
          placeholder="you@chemisurveys.co.ke"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-xs text-gray-500 font-medium block mb-1">Password</label>
        <input
          className="w-full p-2.5 mb-4 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#1034A6]/30"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-[#39FF14] text-[#0f172a] p-2.5 rounded-md font-bold text-sm disabled:opacity-60"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
