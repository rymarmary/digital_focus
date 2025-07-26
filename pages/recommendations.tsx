import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RecommendationsPage() {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (router.query.score) {
      const parsed = parseInt(router.query.score as string, 10);
      setScore(parsed);
    }
  }, [router.query.score]);

  if (score === null) return null;

  let title = '';
  let items: string[] = [];

  if (score <= 5) {
    title = 'Ты отлично справляешься!';
    items = [
      'Продолжай осознанно использовать технологии.',
      'Делай цифровые перерывы во время работы.',
      'Следи за качественным сном — ты уже на правильном пути.',
    ];
  } else if (score <= 10) {
    title = 'Есть куда стремиться';
    items = [
      'Старайся чаще устраивать дни без гаджетов.',
      'Используй лимиты экранного времени и режим «не беспокоить».',
      'Заводи цифровые привычки: читать печатные книги, гулять без телефона.',
    ];
  } else {
    title = 'Твоя цифровая нагрузка высока';
    items = [
      'Попробуй выделить 1 день в неделю без соцсетей или телефона.',
      'Настрой режимы «не беспокоить» и отключи лишние уведомления.',
      'Перед сном отложи гаджеты минимум за час.',
      'Веди трекер привычек — наблюдай, как ты меняешься.',
    ];
  }

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Рекомендации</h1>
        <h2 className="text-xl font-semibold text-blue-600">{title}</h2>

        <ul className="text-left list-disc list-inside text-gray-700 space-y-2">
          {items.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <button
          onClick={() => router.push('/')}
          className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition cursor-pointer"
        >
        На главную
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer"
        >
        Перейти в личный кабинет
        </button>
        </div>
      </div>
    </main>
  );
}
