import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Setup2FA() {
  const [factor, setFactor] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { enroll(); }, []);

  const enroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'UMKM Banyuwangi',
    });
    if (error) return setMessage('Gagal memulai setup: ' + error.message);
    setFactor(data);
  };

  const handleActivate = async () => {
    if (!factor) return;
    if (code.length !== 6) return setMessage('Masukkan kode 6 digit dari aplikasi.');
    setLoading(true); setMessage('');
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code });
      if (vErr) throw vErr;
      setSuccess(true);
    } catch (err) {
      setMessage('Kode salah atau gagal: ' + err.message);
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="fa-solid fa-shield-halved text-4xl text-green-600"></i></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">2FA Aktif! 🎉</h2>
          <p className="text-gray-500 mb-6">Google Authenticator telah terhubung. Mulai sekarang, setiap login (termasuk Google) akan meminta kode dari HP Anda.</p>
          <button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">Ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><i className="fa-solid fa-mobile-screen-button text-3xl text-blue-600"></i></div>
          <h2 className="text-2xl font-bold text-gray-800">Hubungkan Google Authenticator</h2>
          <p className="text-gray-500 text-sm mt-1">Buka aplikasi <b>Google Authenticator</b> di HP, lalu scan QR di bawah.</p>
        </div>

        <div className="flex justify-center mb-4">
          {factor?.totp?.qr_code ? (
            <img src={factor.totp.qr_code} alt="QR Code 2FA" className="w-48 h-48 border rounded-xl" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-gray-400"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>
          )}
        </div>

        {factor?.totp?.secret && (
          <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Tidak bisa scan? Masukkan kunci ini manual di aplikasi:</p>
            <p className="font-mono font-bold text-gray-800 break-all">{factor.totp.secret}</p>
          </div>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-2">Kode 6 digit dari aplikasi HP</label>
        <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••"
          className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 mb-2" />

        {message && <p className="text-red-500 text-sm text-center mb-2">{message}</p>}

        <button onClick={handleActivate} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memverifikasi...</> : <><i className="fa-solid fa-check mr-2"></i>Aktifkan 2FA</>}
        </button>

        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-blue-600 mt-4">Nanti saja</Link>
      </div>
    </div>
  );
}