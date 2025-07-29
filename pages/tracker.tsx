import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

const defaultHabits = [
  'Не брать телефон в руки после 22:00',
  'Отключать уведомления во время фокусной работы',
  'Ограничивать соцсети до 30 минут в день',
  'Начинать утро без телефона',
];

export default function Tracker() {
  const [habits, setHabits] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, Record<string, boolean>>>({});
  const [newHabit, setNewHabit] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) =>
    format(subDays(today, 13 - i), 'dd.MM')
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadFromDB(session.user.id);
      } else {
        loadFromLocal();
      }
    });
  }, []);

  const loadFromLocal = () => {
    try {
      const storedHabits = JSON.parse(localStorage.getItem('habits') || '[]');
      setHabits(storedHabits.length ? storedHabits : defaultHabits);

      const storedProgress = JSON.parse(localStorage.getItem('habitProgress') || '{}');
      setProgress(storedProgress);
    } catch {
      setHabits(defaultHabits);
      setProgress({});
    }
  };

  const loadFromDB = async (uid: string) => {
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('name')
      .eq('user_id', uid);

    if (habitsError) {
      console.error('Ошибка загрузки привычек:', habitsError);
      return;
    }

    const habitNames = habitsData?.map((h) => h.name) || [];

    // Удалим дубликаты
    const uniqueHabits = [...new Set(habitNames)];

    if (uniqueHabits.length === 0) {
      await supabase.from('habits').insert(defaultHabits.map((h) => ({ name: h, user_id: uid })));
      setHabits(defaultHabits);
    } else {
      setHabits(uniqueHabits);
    }

    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('habit, date, value')
      .eq('user_id', uid);

    if (progressError) {
      console.error('Ошибка загрузки прогресса:', progressError);
      return;
    }

    const mapped: Record<string, Record<string, boolean>> = {};
    progressData?.forEach(({ habit, date, value }) => {
      if (!mapped[habit]) mapped[habit] = {};
      mapped[habit][date] = value;
    });

    setProgress(mapped);
  };

  useEffect(() => {
    if (!userId) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, userId]);

  useEffect(() => {
    if (!userId) {
      localStorage.setItem('habitProgress', JSON.stringify(progress));
    }
  }, [progress, userId]);

  const toggleProgress = async (habit: string, date: string) => {
    const newValue = !progress[habit]?.[date];

    setProgress((prev) => ({
      ...prev,
      [habit]: {
        ...prev[habit],
        [date]: newValue,
      },
    }));

    if (userId) {
      await supabase
        .from('progress')
        .upsert({ user_id: userId, habit, date, value: newValue });
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;
    const trimmed = newHabit.trim();

    // Предотвращаем дубли
    if (habits.includes(trimmed)) return;

    setHabits((prev) => [...prev, trimmed]);
    setNewHabit('');
    setShowInput(false);

    if (userId) {
      await supabase.from('habits').insert({ user_id: userId, name: trimmed });
    }
  };

  const handleDeleteHabit = async (habitToDelete: string) => {
    setHabits((prev) => prev.filter((habit) => habit !== habitToDelete));
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[habitToDelete];
      return newProgress;
    });

    if (userId) {
      await supabase.from('habits').delete().eq('user_id', userId).eq('name', habitToDelete);
      await supabase.from('progress').delete().eq('user_id', userId).eq('habit', habitToDelete);
    }
  };

  return (
    <main className="min-h-screen bg-sky-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-6xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Трекер привычек</h2>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Вернуться в личный кабинет
          </Link>
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
