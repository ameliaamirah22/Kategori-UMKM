import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (code.length !== 6) return setMessage('Masukkan kode 6 digit.');
    setLoading(true); setMessage('');
    try {
      const { data: factorsData, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const totpFactor = factorsData.all.find((f) => f.factor_type === 'totp' && f.status === 'verified');
      if (!totpFactor) { setMessage('2FA belum diaktifkan.'); setLoading(false); return; }

      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: totpFactor.id, challengeId: ch.id, code });
      if (vErr) throw vErr;

      navigate('/'); // ✅ kode benar → baru masuk
    } catch (err) {
      setMessage('Kode salah atau kedaluwarsa: ' + err.message);
    } finally { setLoading(false); }
  };

  const handleCancel = async () => { await supabase.auth.signOut(); navigate('/login'); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="fa-solid fa-mobile-screen-button text-3xl text-blue-600"></i></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Masukkan Kode dari HP</h2>
        <p className="text-gray-500 text-sm mb-6">Buka aplikasi <b>Google Authenticator</b> di HP Anda, lalu ketik kode 6 digit yang sedang tampil di sini.</p>

        <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleVerify()} placeholder="••••••" autoFocus
          className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 mb-3" />

        {message && <p className="text-red-500 text-sm mb-3">{message}</p>}

        <button onClick={handleVerify} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mb-3">
          {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memverifikasi...</> : <><i className="fa-solid fa-right-to-bracket mr-2"></i>Verifikasi & Masuk</>}
        </button>

        <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-red-600 transition">Batal & Keluar</button>
      </div>
    </div>
  );
}