export default function Confirmed() {
  return (
    <main className="min-h-screen flex justify-center items-center bg-sky-100">
      <div className="bg-white p-6 rounded shadow text-center space-y-4">
        <h1 className="text-xl font-bold text-green-600">Почта подтверждена ✅</h1>
        <p className="text-gray-700">Теперь вы можете войти в свой аккаунт.</p>
        <a
          href="/auth/signin"
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Войти
        </a>
      </div>
    </main>
  );
}
