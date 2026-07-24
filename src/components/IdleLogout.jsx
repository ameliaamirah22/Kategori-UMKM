import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ⏱️ Durasi idle sebelum logout otomatis (default 10 menit)
// Untuk TES cepat, ubah jadi: 1 * 60 * 1000  (= 1 menit)
const IDLE_LIMIT_MS = 10 * 60 * 1000;

export default function IdleLogout() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const timerRef = useRef(null);

  // Pantau status login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Timer idle — hanya aktif kalau sedang login
  useEffect(() => {
    if (!loggedIn) return;

    const doLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login');   // arahkan ke halaman login setelah logout
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doLogout, IDLE_LIMIT_MS);
    };

    // Aktivitas apa pun = reset timer
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // mulai timer pertama

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loggedIn, navigate]);

  return null; // komponen ini tidak menampilkan apa-apa
}