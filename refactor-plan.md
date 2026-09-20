# План улучшения проекта

Цель: повысить надёжность, читаемость и поддерживаемость проекта без полного переписывания архитектуры.

Главный принцип: сначала сделать проект проверяемым, затем рефакторить бизнес-логику. Иначе крупные изменения будут выполняться без уверенности, что поведение не сломалось.

## Фаза 1. Восстановить базовую проверяемость

1. Исправить ошибку TypeScript в `tsconfig.json`, связанную с `ignoreDeprecations: "6.0"`.
2. Разобраться с timeout Nuxt-тестов в `vitest.config.ts`.
3. Проверить команды отдельно:
   - `npm run lint:ts`
   - `npm run test:unit -- --run`
   - `npm run test:nuxt -- --run`
   - `npm run build`
4. Не начинать крупный рефакторинг до того, как эти проверки будут стабильно проходить.

**Результат:** проект имеет работающий feedback loop, а ошибки можно быстро обнаруживать.

## Фаза 2. Ввести quality gates и CI

1. Расширить scripts в `package.json`:
   - `lint`
   - `typecheck`
   - `test:ci`
   - `build:check`
2. Создать GitHub Actions workflow:
   - установка через `npm ci`;
   - ESLint;
   - TypeScript;
   - unit-тесты;
   - Nuxt-тесты;
   - production build;
   - Playwright smoke-тесты.
3. Добавить проверку миграций базы.
4. Зафиксировать базовый уровень coverage.
5. Не вводить высокий глобальный coverage threshold до анализа реального покрытия.

**Результат:** каждый Pull Request автоматически проверяет качество проекта.

## Фаза 3. Стандартизировать авторизацию

Изменить и проверить:

- `app/middleware/auth.ts`
- `app/utils/auth-client.ts`
- `server/utils/api-helpers.ts`
- `server/utils/permission.ts`
- `nuxt.config.ts`

Необходимо:

1. Реализовать middleware для защищённых страниц.
2. Сохранять callback URL при перенаправлении на login.
3. Разделить:
   - authentication: пользователь вошёл или нет;
   - authorization: имеет ли пользователь право на действие.
4. Использовать единый helper для проверки доступа к студии.
5. Убрать ручные варианты проверки session из endpoint’ов.
6. Добавить тесты для:
   - гостя;
   - авторизованного пользователя;
   - отсутствующего членства в студии;
   - неправильной роли;
   - practitioner-only доступа;
   - прямого API-запроса без авторизации.

**Результат:** вся система использует одинаковые правила доступа.

## Фаза 4. Объединить booking и checkout логику

Сначала описать state machine:

- booking: `PENDING`, `CONFIRMED`, `CANCELLED`, `ATTENDED`, `NO_SHOW`;
- transaction: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`;
- pass: `ACTIVE`, `EXPIRED`, `CANCELLED`.

После этого создать domain services:

- `server/domain/booking/booking.service.ts`
- `server/domain/checkout/checkout.service.ts`

Перенести в них:

- проверку доступности слота;
- capacity check;
- защиту от повторного бронирования;
- создание transaction;
- создание booking;
- выдачу pass;
- обработку webhook;
- отмену и истечение checkout.

Рефакторить endpoint’ы:

- `server/api/bookings/[slotId]/index.post.ts`
- `server/api/slots/[slotId]/book.post.ts`
- `server/api/checkout/create-session.post.ts`
- `server/api/checkout/webhook.post.ts`
- `server/api/checkout/cancel.get.ts`

Endpoint должен выполнять только четыре действия:

1. получить пользователя;
2. провалидировать input;
3. вызвать service;
4. вернуть response.

Также необходимо:

- убрать `any` из `server/utils/checkout.ts`;
- добавить idempotency key для checkout;
- гарантировать безопасную повторную доставку Stripe webhook.

**Результат:** бизнес-логика находится в одном месте и одинаково работает для free, cash, Stripe и pass flow.

## Фаза 5. Закрепить инварианты в базе

Перед миграциями проверить существующие данные на дубликаты.

Изменить:

- `server/db/schema/booking.ts`
- `server/db/schema/payment.ts`
- `server/db/schema/offering.ts`

Рассмотреть добавление:

- уникального активного бронирования пользователя на один слот;
- уникального Stripe provider transaction ID;
- уникальной связи practitioner и offering;
- индексов по `slotId`, `userId`, `transactionId`, `status`;
- `CHECK` для неотрицательных цен, credits и capacity;
- проверки `startTime < endTime`.

После этого:

1. создать Drizzle migration;
2. применить её на копии базы;
3. проверить существующие данные;
4. подготовить rollback или forward-fix процедуру;
5. добавить concurrency tests.

Особенно важно определить, какие статусы занимают место в capacity: только `CONFIRMED` или также `PENDING`.

**Результат:** критичные бизнес-правила защищены не только TypeScript-кодом, но и базой данных.

## Фаза 6. Улучшить типизацию и границы модулей

1. Убрать зависимости схемы базы от frontend-слоя `app/entities`.
2. Перенести общие enum и типы в нейтральный каталог:
   - `shared/domain`;
   - либо `server/domain/shared`.
3. Удалить `any`, `as any` и необоснованные `@ts-expect-error`.
4. Разделить большие handlers на:
   - transport layer;
   - domain service;
   - repository/database layer.
5. Разбить большой `server/db/seed.ts` по доменам или fixture-группам.

**Результат:** изменения в UI не влияют напрямую на схему базы, а код проще тестировать и переиспользовать.

## Фаза 7. Улучшить конфигурацию и наблюдаемость

1. Создать `server/config/env.ts`.
2. Валидировать environment variables через Zod при запуске.
3. Синхронизировать `.env.example` с реальным использованием.
4. Создать единый structured logger.
5. Добавить request/correlation ID.
6. Настроить redaction:
   - токенов;
   - email и персональных данных;
   - Stripe metadata;
   - платёжной информации.
7. Отправлять неожиданные ошибки в Sentry.
8. Удалить production `console.log`.

**Результат:** ошибки диагностируются быстрее, а чувствительные данные не попадают в логи.

## Фаза 8. Документация и onboarding

Обновить:

- `README.md`
- `_notes/DEV_README.md`
- `_notes/DRIZZLE.md`

Добавить `ARCHITECTURE.md` с описанием:

- структуры каталогов;
- правил размещения кода;
- auth flow;
- booking flow;
- checkout flow;
- webhook lifecycle;
- миграций;
- тестирования;
- правил создания новых endpoint’ов.

Новый разработчик должен без помощи команды понять:

1. как запустить проект;
2. как настроить `.env`;
3. как подключить базу;
4. как выполнить миграции;
5. как запустить тесты;
6. где находится бизнес-логика;
7. как добавить новый API endpoint.

## Приоритеты

### P0

- Исправить TypeScript и Nuxt tests.
- Ввести CI.
- Реализовать auth middleware.
- Стандартизировать API authentication и authorization.
- Проверить double booking.
- Исправить payment state transitions.

### P1

- Вынести booking и checkout в services.
- Убрать `any` из платежей.
- Добавить DB constraints и индексы.
- Добавить integration tests.
- Ввести env validation и structured logging.

### P2

- Разбить seed.
- Убрать старые TODO и debug logs.
- Перенести shared types.
- Улучшить документацию.
- Удалить неиспользуемые зависимости и закомментированные модули.

## Финальные критерии готовности

Работа считается завершённой, когда:

- `npm ci` проходит на чистом checkout;
- lint и typecheck проходят;
- unit и Nuxt tests проходят стабильно;
- build проходит;
- CI выполняется на каждом Pull Request;
- guest не может открыть защищённые страницы;
- API не позволяет обойти authorization;
- невозможно создать двойное бронирование;
- повторный Stripe webhook не выдаёт pass повторно;
- checkout можно безопасно повторить;
- миграции применяются на чистой и существующей базе;
- README позволяет новому разработчику запустить проект самостоятельно;
- в production-логах нет чувствительных данных.

Этот порядок даст наибольший эффект без архитектурного усложнения: сначала надёжность и проверяемость, затем бизнес-границы, затем база данных и эксплуатационная зрелость.
