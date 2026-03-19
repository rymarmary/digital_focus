import { useState } from 'react';
import { trackEvent } from '@/utils/analytics';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://formsubmit.co/ajax/9c1f086357e6fa897cd03359dd9712a6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        trackEvent('feedback_submit');
        setStatus('success');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <>
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
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Обратная связь</h3>

            {status === 'success' ? (
              <p className="text-green-600 text-sm text-center py-6">
                Спасибо! Сообщение отправлено.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  name="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напишите ваш отзыв..."
                  className="w-full h-32 border rounded p-2 mb-4 text-sm text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {status === 'error' && (
                  <p className="text-red-500 text-sm mb-2 text-center">
                    Не удалось отправить. Попробуйте позже.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Отправляем...' : 'Отправить'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
