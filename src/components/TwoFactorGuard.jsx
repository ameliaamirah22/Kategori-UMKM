import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ALLOWED_PATHS = ['/verify-2fa', '/setup-2fa', '/login', '/register'];

export default function TwoFactorGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('checking');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => setTick(t => t + 1));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) return setStatus('ok');
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setStatus((aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') ? 'needs2fa' : 'ok');
    })();
    return () => { mounted = false; };
  }, [location.pathname, tick]);

  useEffect(() => {
    if (status === 'needs2fa' && !ALLOWED_PATHS.includes(location.pathname)) {
      navigate('/verify-2fa', { replace: true }); // ✅ cegat → minta kode dari HP
    }
  }, [status, location.pathname, navigate]);

  if (status === 'checking') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i></div>;
  }
  return children;
}