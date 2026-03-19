import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import { trackEvent } from '@/utils/analytics';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasSavedQuiz(!!localStorage.getItem('quiz_result'));
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
      emailRedirectTo: 'https://digital-focus.vercel.app/auth/confirmed',
    },
  });


    if (error) {
      trackEvent('sign_up_error');
      setError(error.message);
    } else {
      trackEvent('sign_up_success');
      alert('Письмо отправлено! После подтверждения вернитесь на эту вкладку — здесь сохранится ваш результат.');
      router.push('/auth/signin');
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-sky-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-lg shadow-md space-y-4 w-full max-w-md">
        <h1 className="text-xl font-bold text-center text-gray-800">Регистрация</h1>

        <p className="text-sm text-gray-600 text-center">
          Введите email и пароль, затем подтвердите email по ссылке на почте. После этого вы сможете войти.
        </p>

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
          Зарегистрироваться
        </button>

        <p className="text-sm text-gray-600 text-center">
          Уже есть аккаунт?{' '}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Войти
          </a>
        </p>
      </form>
    </main>
  );
}
