import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (router.query.score) {
      const parsed = parseInt(router.query.score as string, 10);
      setScore(parsed);
    }
  }, [router.query.score]);

  if (score === null) return null;

  let message = '';
  if (score <= 5) {
    message = 'Отлично! Ты осознанно используешь технологии и умеешь сохранять баланс.';
  } else if (score <= 10) {
    message = 'Ты на правильном пути, но иногда стоит обращать внимание на цифровые привычки.';
  } else {
    message = 'Похоже, цифровая нагрузка влияет на твоё состояние. Стоит пересмотреть свои привычки.';
  }

  const handleSaveAndGoToDashboard = () => {
    const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
    const updated = [...history, { score, date: new Date().toISOString() }];
    localStorage.setItem('testHistory', JSON.stringify(updated));
    router.push('/dashboard');
  };

  const handleGoToRecommendations = () => {
    router.push(`/recommendations?score=${score}`);
  };

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Результат</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-gray-700">
          <p className="text-lg font-medium">
            Твой балл: <span className="text-blue-600 font-bold">{score}</span>
          </p>
          <p className="mt-4 text-base">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={handleSaveAndGoToDashboard}
            className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition cursor-pointer"
          >
            Сохранить результат в личный кабинет
          </button>

          <button
            onClick={handleGoToRecommendations}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer"
          >
            Перейти к рекомендациям
          </button>
        </div>
      </div>
    </main>
  );
}
