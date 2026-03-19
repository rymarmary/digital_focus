import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import { trackEvent } from '@/utils/analytics';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200); // предотвращает серость из-за автозаполнения
    setHasSavedQuiz(!!localStorage.getItem('quiz_result'));
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      trackEvent('sign_in_error');
      setError(error.message);
    } else {
      trackEvent('sign_in_success');
      const savedScore = localStorage.getItem('quiz_result');
      if (savedScore) {
        router.push(`/result?score=${savedScore}`);
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sky-100">
        <p className="text-gray-500 text-sm">Загрузка...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-sky-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md space-y-4 w-full max-w-md">
        <h1 className="text-xl font-bold text-center text-gray-800">Вход</h1>

        {hasSavedQuiz && (
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-3 text-center">
            После подтверждения почты вернитесь на эту вкладку — здесь сохранится ваш результат.
          </p>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded text-gray-800 placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded text-gray-800 placeholder-gray-400"
          required
        />

        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
          Войти
        </button>

        <p className="text-sm text-gray-600 text-center">
          Нет аккаунта?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </form>
    </main>
  );
}
