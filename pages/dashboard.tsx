import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import { trackEvent } from '@/utils/analytics';
import { Session } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  // === Получение сессии ===
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (!currentSession) {
        router.push('/auth/signin');
      } else if (currentSession.user?.user_metadata?.name) {
        setName(currentSession.user.user_metadata.name);
      }
    };
    getSession();
  }, [router]);

  useEffect(() => {
    if (session) {
      trackEvent('dashboard_view');
    }
  }, [session]);

  // === Загрузка истории результатов ===
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
      } else if (data) {
        setHistory(
          data.map((item) => ({
            score: item.score,
            date: item.created_at,
          }))
        );
      }
    };
    fetchHistory();
  }, [session]);

  const latest = history[0];

  // === Сообщение по уровню нагрузки ===
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

  // === Сохранение имени ===
  const handleSaveName = async () => {
    if (!session) return;

    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (error) {
      console.error('Ошибка обновления имени:', error.message);
      alert('Ошибка при сохранении имени.');
    } else {
      alert('Имя успешно обновлено!');
      setEditingName(false);
    }
  };

  // === Экспорт отчёта в PDF ===
  const handleExportPDF = async () => {
    console.log("🚀 Экспорт PDF запущен");
    const element = document.getElementById('report-section');

    if (!element) {
      console.warn("⚠️ Элемент #report-section не найден");
      return;
    }

    try {
      // Подмена oklch цветов на HEX
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor.includes('oklch')) {
          (el as HTMLElement).style.backgroundColor = '#E0F2FE';
        }
        if (style.color.includes('oklch')) {
          (el as HTMLElement).style.color = '#1E3A8A';
        }
        if (style.borderColor.includes('oklch')) {
          (el as HTMLElement).style.borderColor = '#93C5FD';
        }
      });

      // Скрываем кнопки при экспорте
      const hiddenButtons = document.querySelectorAll('.no-export');
      hiddenButtons.forEach((btn) => ((btn as HTMLElement).style.display = 'none'));

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Возвращаем кнопки
      hiddenButtons.forEach((btn) => ((btn as HTMLElement).style.display = ''));

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = pageWidth / canvas.width;
      const imgHeight = canvas.height * ratio;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);

      // Добавляем страницы, если нужно
      if (imgHeight > pageHeight) {
        let y = imgHeight;
        while (y > pageHeight) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -pageHeight, pageWidth, imgHeight);
          y -= pageHeight;
        }
      }

      pdf.save('digital_focus_report.pdf');
      trackEvent('pdf_export');
      console.log("✅ PDF успешно сохранён");
    } catch (error) {
      console.error("❌ Ошибка при экспорте PDF:", error);
      alert("Ошибка при экспорте PDF. Попробуй обновить страницу.");
    }
  };

  // === Подготовка данных для графика ===
  const chartData = history
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      score: item.score,
    }));

  return (
    <main className="bg-sky-100 min-h-screen flex items-center justify-center p-6">
      <div
        id="report-section"
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-3xl space-y-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 text-center">Личный кабинет</h1>

        {/* Информация о пользователе */}
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

        {/* Результаты и история */}
        {latest ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-gray-700">
              <p className="text-xl font-semibold">
                Последний результат:{' '}
                <span className="text-blue-600">{latest.score}</span>
              </p>
              <p className="mt-2 text-base">{message}</p>

              {history.length > 1 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">История результатов</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#2563eb" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Кнопки управления */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 no-export">
              <button
                onClick={handleExportPDF}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium transition"
              >
                📄 Экспортировать в PDF
              </button>
              <button
                onClick={() => { trackEvent('recommendations_open_from_dashboard', { score: latest.score }); router.push(`/recommendations?score=${latest.score}`); }}
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
