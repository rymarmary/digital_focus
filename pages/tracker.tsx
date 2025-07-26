import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import Link from 'next/link';

const initialHabits = [
  'Не брать телефон в руки после 22:00',
  'Отключать уведомления во время фокусной работы',
  'Ограничивать соцсети до 30 минут в день',
  'Начинать утро без телефона',
];

export default function Tracker() {
  const [habits, setHabits] = useState<string[]>(initialHabits);
  const [newHabit, setNewHabit] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [progress, setProgress] = useState<Record<string, Record<string, boolean>>>({});

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) =>
    format(subDays(today, 13 - i), 'dd.MM')
  );

  const toggleProgress = (habit: string, date: string) => {
    setProgress((prev) => ({
      ...prev,
      [habit]: {
        ...prev[habit],
        [date]: !prev[habit]?.[date],
      },
    }));
  };

  const handleAddHabit = () => {
    if (newHabit.trim()) {
      setHabits((prev) => [...prev, newHabit.trim()]);
      setNewHabit('');
      setShowInput(false);
    }
  };

  const handleDeleteHabit = (habitToDelete: string) => {
    setHabits((prev) => prev.filter((habit) => habit !== habitToDelete));
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[habitToDelete];
      return newProgress;
    });
  };

  return (
    <main className="min-h-screen bg-sky-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-6xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Трекер привычек</h2>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">Вернуться в личный кабинет</Link>
        </div>

        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 px-4 py-2 text-left border-b">Привычка</th>
              {dates.map((date, index) => (
                <th
                  key={date}
                  className={`px-2 py-2 text-sm text-gray-600 border-b whitespace-nowrap ${index >= 7 ? 'hidden sm:table-cell' : ''}`}
                >
                  {date}
                </th>
              ))}
              <th className="px-2 py-2 border-b bg-white"></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit}>
                <td className="sticky left-0 bg-white z-10 px-4 py-2 border-b font-medium text-gray-800">{habit}</td>
                {dates.map((date, index) => (
                  <td
                    key={date}
                    className={`text-center border-b cursor-pointer hover:bg-sky-100 ${index >= 7 ? 'hidden sm:table-cell' : ''}`}
                    onClick={() => toggleProgress(habit, date)}
                  >
                    {progress[habit]?.[date] ? '✅' : '⬜'}
                  </td>
                ))}
                <td className="text-center border-b">
                  <button
                    onClick={() => handleDeleteHabit(habit)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    удалить
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={dates.length + 1} className="text-left px-4 py-2">
                {showInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Новая привычка"
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      className="w-full max-w-xs px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={handleAddHabit}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Добавить
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowInput(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ➕ Добавить новую привычку
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
