import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('admin@dof.test');
    const [password, setPassword] = useState('123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Artistic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">

                {/* Hero Section / Brand */}
                <div className="w-full md:w-1/2 text-center md:text-left pt-10 md:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Sistem Manajemen Digital
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
                        DOF <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                            Project
                        </span>
                    </h1>

                    <p className="text-lg text-slate-300 max-w-xl mx-auto md:mx-0 leading-relaxed mb-8">
                        Revolusi cara organisasi Anda mengelola, menyetujui, dan mendistribusikan dokumen penting dengan antarmuka yang cepat dan aman.
                    </p>

                    <div className="hidden md:flex flex-wrap gap-4 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">❖</div>
                            Workflow Otomatis
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">🔒</div>
                            Akses Aman
                        </div>
                    </div>
                </div>

                {/* Login Form Container */}
                <div className="w-full md:w-[450px] mt-8 md:mt-0 pb-16 md:pb-0">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative">
                        {/* Shimmer effect top border */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                        <div className="p-8 sm:p-10">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
                                <p className="text-slate-400 text-sm">Masuk untuk melanjutkan ke dashboard Anda</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block pl-11 p-3.5 transition-all duration-200"
                                            placeholder="admin@dof.test"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-medium text-slate-300">Password</label>
                                        <a href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Lupa Password?</a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block pl-11 p-3.5 transition-all duration-200"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:outline-none focus:ring-blue-500/30 font-semibold rounded-xl text-sm px-5 py-4 text-center transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <p className="text-center text-slate-500 text-xs mt-6">
                        &copy; {new Date().getFullYear()} DOF Digital Office. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
