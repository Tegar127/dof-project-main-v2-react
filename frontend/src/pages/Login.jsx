import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, FileText } from 'lucide-react';

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
            setError(err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Left Panel: Brand ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-slate-900/40 blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
                        <FileText size={20} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">DOF Project</span>
                </div>

                {/* Main copy */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-6 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        Sistem Manajemen Digital
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                        Kelola Dokumen<br />
                        <span className="text-teal-300">Lebih Efisien</span>
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed max-w-sm">
                        Platform terpadu untuk mengelola, menyetujui, dan mendistribusikan dokumen organisasi secara aman dan terstruktur.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                        {[
                            { icon: '✦', label: 'Alur persetujuan otomatis bertingkat' },
                            { icon: '⊕', label: 'Distribusi dokumen ke seluruh divisi' },
                            { icon: '◈', label: 'Riwayat audit lengkap & aman' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-3 text-slate-300 text-sm">
                                <span className="text-teal-400 font-bold">{icon}</span>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-500 text-xs">
                    © {new Date().getFullYear()} DOF Digital Office
                </div>
            </div>

            {/* ── Right Panel: Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
                            <FileText size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">DOF Project</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Selamat Datang Kembali</h2>
                        <p className="text-slate-600 text-sm">Masuk untuk melanjutkan ke dashboard Anda</p>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <Mail size={17} />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none block pl-10 pr-4 py-3 transition-all duration-200"
                                    placeholder="admin@dof.test"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">Lupa Password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <Lock size={17} />
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none block pl-10 pr-4 py-3 transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-500/20 text-white font-semibold rounded-xl text-sm px-5 py-3.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Masuk
                                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-xs mt-8">
                        © {new Date().getFullYear()} DOF Digital Office. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
