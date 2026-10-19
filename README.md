# landing

# Обжарка «Кварта» — лендинг микро-обжарочной мастерской

Лендинг для локальной обжарки кофе в Минске с акцентом на свежесть (обжарка по четвергам, доставка по пятницам) и сквозной системой лидогенерации без онлайн-оплаты.
---

## 1. Стек технологий и архитектура проекта

### Стек:
- Фронтенд: React 18, Vite, TypeScript, семантический HTML5, CSS3 (Mobile-First подход).
- Бэкенд: Next.js (App Router), TypeScript.
- База данных: SQLite (`sqlite` + `sqlite3`).
- Уведомления: Telegram Bot API (прямые HTTP-вызовы через `fetch`).

### Архитектурные слои (Clean Architecture)
Серверная часть спроектирована вручную с соблюдением разделения ответственности и инверсии зависимостей (DIP):

```text
backend/src/
├── app/
│   └── api/
│       └── lead/
│           └── route.ts            # Route Handler: контекст запроса (IP, User-Agent), статус-коды
├── core/
│   ├── domain/                     # Корневые сущности, контракты интерфейсов и ошибки
│   │   ├── lead.entity.ts          # Сущность Lead с типизацией метаданных
│   │   ├── lead.repository.interface.ts # Абстрактный контракт репозитория (ILeadRepository)
│   │   └── errors.ts               # Доменные ошибки (ValidationError, DuplicateSubmissionError)
│   ├── services/                   # Бизнес-логика приложения (Use Cases)
│   │   ├── lead.service.ts         # Нормализация номеров, дедупликация (10 мин), валидация
│   │   └── telegram.service.ts     # Отправка структурированных Markdown-уведомлений
│   └── infrastructure/             # Внешние адаптеры и хранилище данных
│       ├── db.ts                   # Асинхронное подключение к SQLite и миграция схемы
│       └── sqlite-lead.repository.ts # Реализация ILeadRepository через параметризованные запросы
└── dependencies/
    └── container.ts                # Контейнер внедрения зависимостей (IoC)
