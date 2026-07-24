import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();

  // mode: 'login' = form biasa | 'enroll' = scan QR (sekali) | 'verify' = input kode
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [enrollFactor, setEnrollFactor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // cegah authenticator "nyelonong" / proses dobel
  const handledRef = useRef(false);

  const clearError = () => setErrorMsg('');

  // ✅ INTI: putuskan tampil scan QR atau input kode — HANYA dipanggil setelah login benar-benar terjadi
  const proceedAfterAuth = async () => {
    if (handledRef.current) return;   // sudah diproses → jangan ulang (cegah nyelonong/dobel)
    handledRef.current = true;
    clearError();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMode('login'); return; }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = (factors?.all || []).find(f => f.factor_type === 'totp' && f.status === 'verified');

      if (verified) {
        // HP sudah terdaftar → minta kode
        setMfaFactorId(verified.id);
        setMode('verify');
        return;
      }

      // HP belum terdaftar → bersihkan sampah lama, buatkan QR baru (otomatis, tanpa suruh ke menu lain)
      const unverified = (factors?.all || []).filter(f => f.factor_type === 'totp' && f.status === 'unverified');
      for (const f of unverified) { await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {}); }

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'UMKM Banyuwangi',
      });
      if (enrollError) throw enrollError;

      setEnrollFactor(enrollData);
      setMode('enroll');
    } catch (err) {
      setErrorMsg('Gagal menyiapkan Google Authenticator: ' + (err.message || err));
      setMode('login');
    } finally {
      setLoading(false);
      setGoogleLoading(false);
    }
  };

  // ✅ Hanya proses SETELAH login nyata (SIGNED_IN), atau saat baru pulang dari Google (ada code di URL).
  //    Load biasa TIDAK memproses apa-apa → form login tetap tampil (authenticator tidak nyelonong).
  useEffect(() => {
    const cameFromOAuth =
      /[?&]code=/.test(window.location.search) ||
      /access_token=|type=/.test(window.location.hash);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { handledRef.current = false; return; }
      if (!session) return;
      if (event === 'SIGNED_IN') {
        proceedAfterAuth();                       // habis pilih Google / habis login email
      } else if (event === 'INITIAL_SESSION' && cameFromOAuth) {
        proceedAfterAuth();                       // halaman load tepat setelah pulang dari Google
      }
      // INITIAL_SESSION tanpa code (load biasa) → DIABAIKAN → form login tetap tampil
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Login Email + Password
  const handleLogin = async (e) => {
    e.preventDefault();
    handledRef.current = false;   // izinkan SIGNED_IN memproses
    setLoading(true); clearError();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrorMsg(error.message); setLoading(false); }
    // kalau sukses → event SIGNED_IN yang memunculkan authenticator
  };

  // ✅ Login Google — PAKSA Google tampilkan layar PILIH akun dulu (prompt: select_account)
  const handleGoogleLogin = async () => {
    handledRef.current = false;
    setGoogleLoading(true); clearError();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: { prompt: 'select_account' },   // ✅ KUNCI: paksa layar pilih akun Google
      },
    });
    if (error) { setErrorMsg('Gagal login Google: ' + error.message); setGoogleLoading(false); }
  };

  // ✅ Verifikasi kode (HP sudah terdaftar)
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: ch.id, code: otp });
      if (vErr) throw vErr;
      navigate('/');
    } catch (err) {
      setErrorMsg('Kode salah atau kedaluwarsa. Pakai kode terbaru di HP.');
    } finally { setLoading(false); }
  };

  // ✅ Verifikasi kode pertama kali (sekaligus mengaktifkan)
  const handleEnrollVerify = async (e) => {
    e.preventDefault();
    if (!enrollFactor) return;
    setLoading(true); clearError();
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactor.id });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enrollFactor.id, challengeId: ch.id, code: otp });
      if (vErr) throw vErr;
      navigate('/');
    } catch (err) {
      setErrorMsg('Kode salah atau kedaluwarsa. Pakai kode terbaru di HP.');
    } finally { setLoading(false); }
  };

  const backToLogin = async () => {
    await supabase.auth.signOut();   // memicu SIGNED_OUT → reset handledRef
    setMode('login'); setOtp(''); clearError();
    setMfaFactorId(''); setEnrollFactor(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <i className={`fa-solid ${mode === 'login' ? 'fa-user-lock' : 'fa-mobile-screen-button'} text-4xl text-blue-600`}></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Selamat Datang' : mode === 'enroll' ? 'Hubungkan HP Anda' : 'Verifikasi 2 Langkah'}
          </h2>
          <p className="text-blue-100 text-sm">
            {mode === 'login' && 'Login ke Katalog UMKM Banyuwangi'}
            {mode === 'enroll' && 'Scan QR dengan Google Authenticator (hanya sekali ini)'}
            {mode === 'verify' && 'Masukkan kode dari Google Authenticator di HP'}
          </p>
        </div>

        <div className="px-8 py-8">
          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{errorMsg}</div>
          )}

          {/* ===== MODE LOGIN ===== */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2"><i className="fa-solid fa-envelope mr-2 text-blue-600"></i>Email</label>
                  <div className="relative">
                    <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
                    <i className="fa-solid fa-at absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2"><i className="fa-solid fa-lock mr-2 text-blue-600"></i>Password</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
                    <i className="fa-solid fa-key absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <span className="flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memproses...</span>
                    : <span className="flex items-center justify-center"><i className="fa-solid fa-right-to-bracket mr-2"></i>Login</span>}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium"><i className="fa-solid fa-share-nodes mr-2"></i>Atau login dengan</span>
                </div>
              </div>

              <button onClick={handleGoogleLogin} disabled={googleLoading}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
                {googleLoading ? (
                  <><i className="fa-solid fa-circle-notch fa-spin text-red-500 text-xl"></i><span>Menghubungkan...</span></>
                ) : (
                  <><i className="fa-brands fa-google text-red-500 text-xl group-hover:scale-110 transition-transform"></i><span>Continue with Google</span></>
                )}
              </button>

              <p className="text-center mt-5 text-xs text-gray-400">
                <i className="fa-solid fa-shield-halved mr-1 text-green-500"></i>
                Setelah pilih akun Google, Anda akan diminta kode Google Authenticator.
              </p>
              <p className="text-center mt-3 text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition">Daftar Sekarang</Link>
              </p>
            </>
          )}

          {/* ===== MODE ENROLL (scan QR — otomatis, pertama kali) ===== */}
          {mode === 'enroll' && enrollFactor && (
            <form onSubmit={handleEnrollVerify} className="space-y-4">
              <div className="flex justify-center">
                <img src={enrollFactor.totp.qr_code} alt="QR Google Authenticator" className="w-48 h-48 border rounded-xl" />
              </div>
              <div className="bg-gray-50 border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Tidak bisa scan? Ketik kunci ini manual di aplikasi:</p>
                <p className="font-mono font-bold text-gray-800 break-all text-sm">{enrollFactor.totp.secret}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Kode 6 digit dari HP</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus
                  className="w-full text-center tracking-[0.5em] text-3xl font-bold px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memverifikasi...</span>
                  : <span className="flex items-center justify-center"><i className="fa-solid fa-check mr-2"></i>Aktifkan & Masuk</span>}
              </button>
              <div className="flex justify-center">
                <button type="button" onClick={backToLogin} className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                  <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
                </button>
              </div>
            </form>
          )}

          {/* ===== MODE VERIFY (input kode — selanjutnya) ===== */}
          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-3">
                  <i className="fa-solid fa-mobile-screen-button text-3xl text-blue-600"></i>
                </div>
                <p className="text-sm text-gray-500">Buka <b>Google Authenticator</b> di HP, ketik kode 6 digit yang sedang tampil.</p>
              </div>
              <div>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus
                  className="w-full text-center tracking-[0.5em] text-3xl font-bold px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memverifikasi...</span>
                  : <span className="flex items-center justify-center"><i className="fa-solid fa-check mr-2"></i>Verifikasi & Masuk</span>}
              </button>
              <div className="flex justify-center">
                <button type="button" onClick={backToLogin} className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                  <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500"><i className="fa-solid fa-shield-halved mr-1 text-green-500"></i>Login aman dengan enkripsi SSL</p>
        </div>
      </div>
    </div>
  );
}