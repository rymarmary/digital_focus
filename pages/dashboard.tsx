import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type TestResult = {
  score: number;
  date: string;
};

export default function Dashboard() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const router = useRouter();

  const user = {
    name: 'Анонимный пользователь',
    email: 'anon@example.com',
  };

  useEffect(() => {
    const saved = localStorage.getItem('testHistory');
    if (saved) {
      try {
        const parsed: TestResult[] = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error('Ошибка чтения истории:', e);
        setHistory([]);
      }
    }
  }, []);

  const latest = history.length > 0 ? history[history.length - 1] : null;

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

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Личный кабинет</h1>

        {/* Инфо о пользователе */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        {latest ? (
          <>
            {/* Последний результат */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-gray-700">
              <p className="text-xl font-semibold">
                Последний результат: <span className="text-blue-600">{latest.score}</span>
              </p>
              <p className="mt-2 text-base">{message}</p>
            </div>

            {/* История прохождений */}
            {history.length > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 text-gray-800 rounded-xl p-6">
                <p className="text-gray-800 font-medium mb-2">История прохождения:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {history
                    .slice(0, -1)
                    .reverse()
                    .map((item, i) => (
                      <li key={i}>
                        {new Date(item.date).toLocaleDateString()} — балл: {item.score}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Кнопки */}
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
