# Digital Focus

**Веб-приложение для оценки уровня цифровой нагрузки и формирования осознанных привычек работы с устройствами.**

Деплой: [digital-focus.vercel.app](https://digital-focus.vercel.app) · Дипломный проект · Мария Рымарь · 2025–2026

---

## Для кого этот продукт

Digital Focus предназначен для людей, которые хотят понять, как много времени и внимания они отдают экранам — и постепенно изменить это. Приложение не требует сложной настройки: пользователь проходит короткий квиз, получает результат с рекомендациями и начинает отслеживать свои привычки в трекере.

Ключевая особенность с технической стороны — встроенная событийная аналитика на базе ClickHouse и Yandex Metrika, позволяющая собирать поведенческие данные пользователей и строить продуктовые метрики без использования внешних SaaS-платформ.

---

## Тема диплома

> «Применение событийной аналитики в веб-приложении контроля привычек экранного времени»

Проект демонстрирует полный цикл работы с событийными данными: от действий пользователя на фронтенде — до записи в аналитическую базу данных и возможности строить воронки, метрики вовлечённости и user journey.

---

## Функционал

| Раздел | Описание |
|--------|----------|
| **Квиз** | 8 вопросов, бальная система оценки цифровой нагрузки |
| **Результат** | Итоговый балл, интерпретация, сохранение в личный кабинет |
| **Рекомендации** | Персонализированные советы по трём уровням нагрузки |
| **Трекер привычек** | Таблица на 14 дней, добавление и удаление привычек, синхронизация с БД |
| **Личный кабинет** | История тестов, график изменений, последний результат, редактирование имени |
| **Экспорт в PDF** | Сохранение отчёта из личного кабинета |
| **Авторизация** | Регистрация и вход через Supabase, подтверждение email |
| **Обратная связь** | Форма обратной связи, доступна на любой странице |

---

## Технологический стек

| Категория | Технология |
|-----------|------------|
| Фреймворк | Next.js 15 (pages router) |
| Язык | TypeScript |
| Стили | Tailwind CSS |
| База данных / Auth | Supabase (PostgreSQL) |
| Аналитическая БД | ClickHouse |
| Продуктовая аналитика | Yandex Metrika |
| Графики | Recharts |
| PDF | jsPDF + html2canvas |
| Контейнеризация | Docker |

---

## Архитектура аналитики

### Pipeline

```
Действие пользователя (клик, просмотр, submit)
       ↓
trackEvent(event, params) — utils/analytics.ts
       ↓
   ┌───┴────────────────────────┐
   ↓                            ↓
Yandex Metrika            navigator.sendBeacon()
ym.reachGoal(event)        POST /api/events
                                ↓
                     Next.js API Route (serverless)
                     pages/api/events.ts
                                ↓
                     ClickHouse HTTP API
                     INSERT INTO analytics.events_raw
                                ↓
                     SQL-запросы / аналитика
```

### Как это работает

**1. Фронтенд** (`utils/analytics.ts`) — функция `trackEvent(event, params)`:
- отправляет событие в Yandex Metrika через `ym.reachGoal`
- отправляет payload через `navigator.sendBeacon` в API route (надёжно работает даже при закрытии вкладки)
- автоматически добавляет: `user_id`, `uid` (cookie), `page` (текущий путь)
- timestamp устанавливается на сервере, не на клиенте

**2. API route** (`pages/api/events.ts`) — Next.js serverless function:
- принимает POST-запрос, валидирует наличие `event`
- формирует строку с серверным `ts` и вставляет в ClickHouse через HTTP API (`FORMAT JSONEachRow`)
- при недоступном ClickHouse возвращает `200` с флагом ошибки — клиентский flow не прерывается

**3. ClickHouse** (`analytics.events_raw`):
- хранит все события: `ts`, `event`, `page_url`, `uid`, `user_id`, `params_json`
- выбран как аналитическая БД за колоночное хранение, скорость агрегаций на больших объёмах и нативную поддержку JSON-параметров без схемы

**4. Yandex Metrika**:
- дублирует все события как цели (`reachGoal`) — позволяет использовать стандартный интерфейс Метрики для быстрого просмотра
- автоматически фиксирует переходы между страницами (`hit`) через `routeChangeComplete`

### Идентификация пользователей

| Тип | Значение `user_id` | Хранение |
|-----|--------------------|----------|
| Авторизованный | UUID из Supabase Auth | БД Supabase |
| Анонимный гость | UUID, сгенерированный при первом визите | `localStorage` (`df_anon_id`) |

Анонимный ID создаётся через `crypto.randomUUID()` и сохраняется навсегда — позволяет отслеживать повторные визиты без авторизации.

---

## Структура проекта

```
digital_focus/
├── pages/
│   ├── index.tsx              # Главная страница
│   ├── quiz.tsx               # Квиз
│   ├── result.tsx             # Результат квиза
│   ├── recommendations.tsx    # Рекомендации
│   ├── tracker.tsx            # Трекер привычек
│   ├── dashboard.tsx          # Личный кабинет
│   ├── _app.tsx               # Глобальный layout, page_view tracking
│   ├── _document.tsx          # Yandex Metrika скрипт
│   ├── auth/
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   └── confirmed.tsx
│   └── api/
│       └── events.ts          # API route → ClickHouse
├── components/
│   ├── AuthGuard.tsx
│   ├── FeedbackWidget.tsx     # Форма обратной связи
│   └── Footer.tsx
├── utils/
│   ├── analytics.ts           # trackEvent, trackPageView, getUserId
│   └── supabaseClient.ts      # Supabase клиент
└── clickhouse/
    └── docker-compose.yml     # ClickHouse для локальной разработки
```

---

## Запуск локально

### 1. Установить зависимости

```bash
npm install
```

### 2. Создать `.env.local`

```bash
cp .env.example .env.local  # если есть, иначе создать вручную
```

Заполнить переменные (см. раздел ниже).

### 3. Запустить dev-сервер

```bash
npm run dev
```

Приложение доступно на [http://localhost:3000](http://localhost:3000)

---

## ClickHouse через Docker

ClickHouse используется для хранения событий аналитики. Конфигурация находится в `clickhouse/docker-compose.yml`.

### Запуск

```bash
cd clickhouse
docker compose up -d
```

### Проверка

```bash
# Ping
curl http://localhost:8123/ping
# → Ok.

# Проверить базу
curl -u analytics_user:YOUR_PASSWORD \
  "http://localhost:8123/?query=SELECT+current_database()"
# → analytics
```

### Создание таблицы

```sql
CREATE TABLE IF NOT EXISTS analytics.events_raw (
  ts          DateTime,
  event       String,
  page_url    Nullable(String),
  uid         Nullable(String),
  user_id     Nullable(String),
  params_json String DEFAULT '{}'
) ENGINE = MergeTree()
ORDER BY ts;
```

---

## Переменные окружения

Создать файл `.env.local` в корне проекта:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Yandex Metrika
NEXT_PUBLIC_METRIKA_ID=your-counter-id

# ClickHouse
CLICKHOUSE_HOST=http://localhost:8123
CLICKHOUSE_USER=analytics_user
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DB=analytics
CLICKHOUSE_TABLE=events_raw
```

> `.env.local` не коммитится в репозиторий.

---

## Ключевые события аналитики

### Квиз

| Событие | Триггер | Параметры |
|---------|---------|-----------|
| `page_view` | Каждый переход между страницами | `url` |
| `quiz_start` | Открытие страницы квиза | — |
| `quiz_answer` | Выбор варианта ответа | `question`, `score` |
| `quiz_complete` | Завершение квиза | `score` |

### Результат и рекомендации

| Событие | Триггер | Параметры |
|---------|---------|-----------|
| `result_view` | Просмотр страницы результата | `score` |
| `recommendations_view` | Просмотр страницы рекомендаций | `score` |
| `recommendations_open_from_result` | Переход к рекомендациям со страницы результата | `score` |
| `recommendations_open_from_dashboard` | Переход к рекомендациям из личного кабинета | `score` |

### Трекер привычек

| Событие | Триггер | Параметры |
|---------|---------|-----------|
| `tracker_view` | Открытие трекера | — |
| `habit_add` | Добавление новой привычки | — |
| `habit_toggle` | Отметка выполнения за день | `value` |
| `habit_delete` | Удаление привычки | — |

### Личный кабинет

| Событие | Триггер | Параметры |
|---------|---------|-----------|
| `dashboard_view` | Открытие личного кабинета | — |
| `pdf_export` | Экспорт отчёта в PDF | — |

### Авторизация и обратная связь

| Событие | Триггер | Параметры |
|---------|---------|-----------|
| `sign_in_success` | Успешный вход | — |
| `sign_in_error` | Ошибка входа | — |
| `sign_up_success` | Успешная регистрация | — |
| `sign_up_error` | Ошибка регистрации | — |
| `feedback_submit` | Отправка формы обратной связи | — |

---

## Примеры аналитических запросов

### Воронка квиза

```sql
SELECT
  countIf(event = 'quiz_start')        AS started,
  countIf(event = 'quiz_complete')     AS completed,
  countIf(event = 'recommendations_view') AS saw_recommendations,
  round(countIf(event = 'quiz_complete') / countIf(event = 'quiz_start') * 100, 1) AS completion_rate_pct
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 30 DAY;
```

### Топ событий за последние 7 дней

```sql
SELECT
  event,
  count() AS total,
  uniq(user_id) AS unique_users
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 7 DAY
GROUP BY event
ORDER BY total DESC;
```

### Конверсия из гостя в авторизованного пользователя

```sql
SELECT
  countIf(event = 'sign_up_success')                             AS registrations,
  countIf(event = 'quiz_complete')                               AS quiz_completions,
  round(countIf(event = 'sign_up_success') /
        countIf(event = 'quiz_complete') * 100, 1)               AS quiz_to_signup_pct
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 30 DAY;
```

---

## Что можно анализировать

**Воронка и drop-off**
- На каком шаге квиза пользователи чаще всего уходят (`quiz_answer` по номеру вопроса)
- Сколько пользователей доходят от `quiz_start` до `recommendations_view`
- Где обрывается user journey: результат → рекомендации → кабинет → трекер

**Вовлечённость (engagement)**
- Частота возвращений одного `user_id` — признак того, что трекер используется регулярно
- Соотношение `habit_toggle` к `tracker_view` — насколько активно пользователи заполняют трекер
- Количество `habit_add` и `habit_delete` как показатель настройки под себя

**Feature usage**
- Как часто используется PDF-экспорт (`pdf_export`) — насколько нужна эта фича
- Сколько пользователей заходят в рекомендации повторно
- Соотношение авторизованных и анонимных пользователей

**Auth-воронка**
- Конверсия `sign_up_success` / `sign_in_error` — качество onboarding
- Доля пользователей, которые прошли квиз до регистрации

---

## Ограничения и допущения

- **Объём данных** — проект работает с тестовой выборкой пользователей; промышленные нагрузки не тестировались
- **Retention** — данные собираются в рамках дипломного периода, долгосрочный retention не измеряется
- **Анонимные пользователи** — UUID в `localStorage` теряется при очистке браузера; кросс-девайсное отслеживание не реализовано
- **ClickHouse** — для локальной разработки используется Docker-инстанс без репликации и резервного копирования
- **Yandex Metrika** — события дублируются, но визуализация ограничена стандартным интерфейсом Метрики

---

## Возможные улучшения

- **Сегментация пользователей** — разделение по уровню нагрузки (score), типу устройства, источнику трафика
- **A/B тесты** — тестирование формулировок рекомендаций или порядка вопросов квиза
- **ML-рекомендации** — персонализация на основе истории привычек конкретного пользователя
- **Real-time дашборд** — визуализация событий в Grafana или Metabase поверх ClickHouse
- **Push-уведомления** — напоминания для пользователей, которые давно не заходили в трекер
- **Экспорт данных** — CSV/Excel-выгрузка истории для самостоятельного анализа

---

## Статус проекта

| Функция | Статус |
|---------|--------|
| Квиз + результат | Готово |
| Рекомендации | Готово |
| Трекер привычек | Готово |
| Личный кабинет + история | Готово |
| Экспорт в PDF | Готово |
| Авторизация (Supabase) | Готово |
| Событийная аналитика (ClickHouse) | Готово |
| Yandex Metrika | Готово |
| Анонимные пользователи (localStorage UUID) | Готово |

---

## Дипломная ценность

Проект решает задачу, актуальную для продуктовой разработки: **как выстроить собственный pipeline событийной аналитики, не зависящий от внешних платформ**.

Реализовано:
- Полный pipeline: фронтенд → serverless API → ClickHouse
- Dual-track трекинг: Yandex Metrika (быстрый просмотр) + собственная БД (raw-данные и произвольные запросы)
- Идентификация пользователей: авторизованные (Supabase UUID) и анонимные (localStorage UUID)
- Покрытие аналитикой всех ключевых пользовательских действий (19 событий)
- Инфраструктура воспроизводима локально через Docker
- SQL-запросы для воронок, конверсий и feature usage готовы к использованию

---

## Лицензия

Проект создан в рамках дипломной работы и предназначен исключительно для образовательных и некоммерческих целей.
Коммерческое использование, распространение и перепродажа без разрешения автора запрещены.
