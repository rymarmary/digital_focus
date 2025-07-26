import React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/router';

type Question = {
  id: number;
  text: string;
  options: { label: string; score: number }[];
};

const questions: Question[] = [
  {
    id: 1,
    text: 'Как часто ты проверяешь уведомления на телефоне?',
    options: [
      { label: 'Каждые 5–10 минут', score: 2 },
      { label: 'Несколько раз в час', score: 1 },
      { label: 'Только при необходимости', score: 0 },
    ],
  },
  {
    id: 2,
    text: 'Используешь ли ты гаджеты за 1–2 часа до сна?',
    options: [
      { label: 'Да, почти всегда', score: 2 },
      { label: 'Иногда, но стараюсь ограничивать', score: 1 },
      { label: 'Нет, отключаю гаджеты заранее', score: 0 },
    ],
  },
  {
    id: 3,
    text: 'Бывает ли, что ты листаешь ленту или открываешь приложения без цели?',
    options: [
      { label: 'Да, очень часто', score: 2 },
      { label: 'Иногда, в моменты скуки или стресса', score: 1 },
      { label: 'Нет, я стараюсь быть осознанным(ой)', score: 0 },
    ],
  },
  {
    id: 4,
    text: 'Испытываешь ли ты усталость от экрана в течение дня?\n(например: болят глаза, ослабла концентрация, ощущение усталости)',
    options: [
      { label: 'Да, регулярно', score: 2 },
      { label: 'Иногда, если долго сижу в телефоне или за компьютером', score: 1 },
      { label: 'Почти никогда', score: 0 },
    ],
  },
  {
    id: 5,
    text: 'Используешь ли ты лимиты экранного времени на устройствах?',
    options: [
      { label: 'Нет, и не планирую', score: 2 },
      { label: 'Есть, но часто игнорирую', score: 1 },
      { label: 'Есть и стараюсь придерживаться', score: 0 },
    ],
  },
  {
    id: 6,
    text: 'Насколько легко ты отвлекаешься на уведомления во время работы или учёбы?',
    options: [
      { label: 'Очень легко — сразу реагирую', score: 2 },
      { label: 'Иногда отвлекаюсь', score: 1 },
      { label: 'Стараюсь отключать уведомления или не обращать внимания', score: 0 },
    ],
  },
  {
    id: 7,
    text: 'Когда ты в последний раз проводил(а) целый день без телефона, интернета или соцсетей?',
    options: [
      { label: 'Даже не помню такого', score: 2 },
      { label: 'Было давно, но не регулярно', score: 1 },
      { label: 'Совсем недавно или регулярно устраиваю «диджитал-выходные»', score: 0 },
    ],
  },
  {
    id: 8,
    text: 'Пробовал(а) ли ты цифровую осознанность: ограничения, цифровой детокс, режим "не беспокоить"?',
    options: [
      { label: 'Нет, никогда', score: 2 },
      { label: 'Слышал(а), но пока не практикую', score: 1 },
      { label: 'Да, и стараюсь использовать такие подходы', score: 0 },
    ],
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  const q = questions[currentQuestion];

  const handleNext = () => {
    if (selected === null) return;
    const newScore = totalScore + q.options[selected].score;

    if (currentQuestion + 1 < questions.length) {
      setTotalScore(newScore);
      setSelected(null);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      router.push(`/result?score=${newScore}`);
    }
  };

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 w-full max-w-xl text-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
                className="bg-blue-300 h-2.5 rounded-full transition-all duration-500"
                style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
            ></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{q.text.split('\n')[0]}</h2>
        <p className="text-sm text-gray-500 mb-4">{q.text.split('\n')[1]}</p>
        <div className="space-y-3 mb-6">
          {q.options.map((opt, idx) => (
            <button
                key={idx}
                className={`block w-full text-left p-3 sm:p-2 text-base sm:text-sm rounded-lg border transition-all duration-150 cursor-pointer ${
                selected === idx
                ? 'bg-blue-100 border-blue-300 text-gray-900'
                : 'bg-white hover:bg-blue-200 border-blue-200 text-gray-800'

            }`}
              onClick={() => setSelected(idx)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
            onClick={handleNext}
            disabled={selected === null}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-70 cursor-pointer"
        >
            {currentQuestion + 1 === questions.length ? 'Завершить' : 'Далее'}
        </button>
      </div>
    </main>
  );
}
