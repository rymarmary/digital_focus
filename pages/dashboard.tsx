import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('digitalScore');
    if (saved) {
      setScore(parseInt(saved));
    }
  }, []);

  let message = '';
  if (score !== null) {
    if (score <= 5) {
      message = 'Низкий уровень цифровой нагрузки — ты молодец!';
    } else if (score <= 10) {
      message = 'Умеренная цифровая нагрузка — можно улучшить.';
    } else {
      message = 'Высокая цифровая нагрузка — стоит уделить внимание привычкам.';
    }
  }

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Личный кабинет</h1>

        {score !== null ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-gray-700">
              <p className="text-lg font-medium">
                Последний результат: <span className="text-blue-600 font-bold">{score}</span>
              </p>
              <p className="mt-4 text-base">{message}</p>
            </div>

            <button
              onClick={() => router.push(`/recommendations?score=${score}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer"
            >
              Посмотреть рекомендации
            </button>

            <button
              onClick={() => router.push('/tracker')}
              className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition cursor-pointer"
            >
              Перейти к трекеру привычек
            </button>
          </>
        ) : (
          <p className="text-gray-500">Нет сохранённых результатов</p>
        )}
      </div>
    </main>
  );
}
