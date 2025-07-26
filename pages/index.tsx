import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans flex flex-col items-center justify-center min-h-screen bg-sky-100 p-6`}
    >
      <div className="bg-white rounded-2xl shadow-lg p-10 sm:p-12 max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Добро пожаловать в Digital Focus
        </h1>

        <p className="text-gray-700 text-lg sm:text-xl">
          Пройди короткий тест и узнай, как цифровая нагрузка влияет на твоё
          состояние. Получи рекомендации, адаптированные под твой стиль жизни.
        </p>

        <p className="text-gray-600 text-base sm:text-lg">
          После прохождения ты сможешь:
        </p>
        <ul className="text-left text-gray-700 space-y-2 list-disc list-inside text-base sm:text-lg">
          <li>получить персональные советы по цифровому балансу,</li>
          <li>оставить обратную связь на почту,</li>
          <li>вести трекер привычек,</li>
          <li>сохранить результат и вернуться позже в личный кабинет.</li>
        </ul>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            onClick={() => router.push('/quiz')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-xl text-lg transition cursor-pointer"
            >
            Начать тест
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-3 px-8 rounded-xl text-lg transition cursor-pointer"
            >
            Личный кабинет
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
