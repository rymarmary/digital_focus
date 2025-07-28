import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-sky-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-lg shadow-md space-y-4 w-full max-w-md">
        <h1 className="text-xl font-bold text-center">Регистрация</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Зарегистрироваться
        </button>

        {/* ССЫЛКА НА ВХОД */}
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
