import { useState } from 'react';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 hover:bg-blue-700 transition sm:text-sm text-base"
      >
      💬 Обратная связь
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Обратная связь</h3>
            <form
              action="https://formsubmit.co/el/vovabe"
              method="POST"
            >
              <input type="hidden" name="_captcha" value="false" />
              <textarea
                name="message"
                required
                placeholder="Напишите ваш отзыв..."
                className="w-full h-32 border rounded p-2 mb-4 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full text-sm"
              >
                Отправить
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
