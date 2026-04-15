import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft, User, Mail, Shield, Briefcase, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword) {
            setStatus({ type: 'error', message: 'Masukkan password saat ini.' });
            return;
        }
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Password tidak cocok!' });
            return;
        }

        if (password.length < 8) {
            setStatus({ type: 'error', message: 'Password minimal 8 karakter.' });
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            await api.put('/users/profile/update', { currentPassword, password });
            setStatus({ type: 'success', message: 'Password berhasil diperbarui!' });
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Gagal memperbarui profil.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
                        <p className="text-sm text-slate-500">Kelola informasi akun Anda</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Cover & Avatar */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-teal-800 relative">
                        <div className="absolute -bottom-10 left-6">
                            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-2xl">
                                    {user.name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-14 px-6 pb-6 space-y-8">

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
                                status.type === 'error'
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                                {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                {status.message}
                            </div>
                        )}

                        {/* Read-Only Info */}
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <User size={16} /> Data Pribadi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5"><User size={14} /> Nama Lengkap</div>
                                    <div className="font-bold text-slate-800">{user.name}</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5"><Mail size={14} /> Email</div>
                                    <div className="font-bold text-slate-800">{user.email}</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5"><Shield size={14} /> Role Sistem</div>
                                    <div className="font-bold text-indigo-700 uppercase">{user.role}</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5"><Briefcase size={14} /> Posisi & Divisi</div>
                                    <div className="font-bold text-slate-800">{user.position || '-'} • {user.group_name || 'Tanpa Divisi'}</div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Change Password */}
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <Lock size={16} /> Keamanan (Ubah Password)
                            </h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password Saat Ini</label>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none transition-all text-slate-900"
                                        placeholder="Masukkan password lama..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password Baru</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none transition-all text-slate-900"
                                        placeholder="Min. 8 karakter..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 outline-none transition-all text-slate-900"
                                        placeholder="Ulangi password baru..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
