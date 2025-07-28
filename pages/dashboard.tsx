import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

type TestResult = {
  score: number;
  date: string;
};

export default function Dashboard() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);


  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user?.user_metadata?.name) {
        setName(session.user.user_metadata.name);
    }


      if (!session) {
        router.push('/auth/signin')
      }
    };

    getSession();
  }, [router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('results')
        .select('score, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки истории:', error);
      } else {
        const formatted = data.map((item) => ({
          score: item.score,
          date: item.created_at,
        }));
        setHistory(formatted);
      }
    };

    fetchHistory();
  }, [session]);

  const latest = history[0];

  let message = '';
  if (latest) {
    if (latest.score <= 5) {
      message = '📉 Низкий уровень цифровой нагрузки — ты молодец!';
    } else if (latest.score <= 10) {
      message = '⚖️ Умеренная цифровая нагрузка — можно улучшить.';
    } else {
      message = '⚠️ Высокая цифровая нагрузка — стоит уделить внимание привычкам.';
    }
  }

  const handleSaveName = async () => {
  if (!session) return;

  const { error } = await supabase.auth.updateUser({
    data: { name },
  });

  if (error) {
    console.error('Ошибка обновления имени:', error.message);
    alert('Ошибка при сохранении имени.');
  } else {
    alert('Имя успешно обновлено!');
    setEditingName(false);
  }
  };

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Личный кабинет</h1>

        {/* Инфо о пользователе */}
        {session && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 space-y-2">
  <div className="flex items-center gap-2">
    <strong>Имя:</strong>
    {editingName ? (
      <>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
        <button
          onClick={handleSaveName}
          className="text-blue-600 hover:underline text-sm"
        >
          Сохранить
        </button>
        <button
          onClick={() => {
            setName(session?.user.user_metadata?.name || '');
            setEditingName(false);
          }}
          className="text-gray-500 hover:underline text-sm"
        >
          Отмена
        </button>
      </>
    ) : (
      <>
        <span>{name || 'Пользователь'}</span>
        <button
          onClick={() => setEditingName(true)}
          className="text-blue-600 hover:underline text-sm"
        >
          ✏️ Изменить
        </button>
      </>
    )}
    </div>
      <p>
        <strong>Email:</strong> {session?.user.email}
      </p>
    </div>

        )}

        {latest ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-gray-700">
              <p className="text-xl font-semibold">
                Последний результат: <span className="text-blue-600">{latest.score}</span>
              </p>
              <p className="mt-2 text-base">{message}</p>
            </div>

            {history.length > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 text-gray-800 rounded-xl p-6">
                <p className="text-gray-800 font-medium mb-2">История прохождения:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {history.slice(1).map((item, i) => (
                    <li key={i}>
                      {new Date(item.date).toLocaleDateString()} — балл: {item.score}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <button
                onClick={() => router.push(`/recommendations?score=${latest.score}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
              >
                📋 Посмотреть рекомендации
              </button>
              <button
                onClick={() => router.push('/tracker')}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium transition"
              >
                ✅ Перейти к трекеру привычек
              </button>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-gray-700 text-center">
            <p className="text-base">
              Нет сохранённых результатов. Пройди тест, чтобы увидеть рекомендации и начать отслеживать прогресс.
            </p>
            <button
              onClick={() => router.push('/quiz')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-md transition text-sm"
            >
              🔁 Пройти тест
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
