# Здача WS8

## Дані

- Роль: dev
- Команда: therapy-scheduling
- GitHub-логін: HryhoriiHaponiukQuitCode
- Ваше репо: https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling
- SHA: 0cb7a14a21d951bbf77da7af62ac7805eebcae2e
- Репо вимог PM: https://github.com/Sofiia-pm/therapy-scheduling-spec
- Прод-URL: https://therapy-scheduling-two.vercel.app

## PM

—

## Розробник

### D0 — умова прийняття

- `/api/health`: https://therapy-scheduling-two.vercel.app/api/health
- Зелений прогін `smoke` на `main`: https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/actions/runs/40947891887
- `accounts.zip` на SHA: https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/accounts.zip
- Ролі тестових акаунтів: адміністратор — admin@example.test, pm-admin@example.test; планувальник — scheduler1@example.test, scheduler2@example.test, pm-scheduler@example.test; терапевт — therapist1@example.test, therapist2@example.test, pm-therapist@example.test; користувач без ролі — newuser1@example.test
- Версія `next`: next@16.4.3

### Шар якості для 3 AC

- 3 AC: AC-CARD-05 (відмова в браузері: чужі дані за прямим посиланням), AC-CARD-06 (відмова в браузері: заборонена роль), AC-CARD-16 (стан інтерфейсу: помилка з дослівним текстом за роллю). Усі три — зі зрізу 2.
- QA proof pack: https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/qa/proof-pack.md
- Ворота — PR із розбором знахідок (A): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/43
- Ворота — зелений прогін `quality` на `main` (A): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/actions/runs/40852708722
- Ворота — обов'язкові перевірки в `solo-main` (A): «Ворота: fallow audit» і «Покриття: доменна підлога» — 29.10.2026 (поруч із `spec`, `app`, `conformance`, `db-check`); `e2e` — 29.10.2026, після зеленого прогону на `main`; список — у proof pack, розділ A: https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/qa/proof-pack.md#a-ворота; додано в PR https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/43, `e2e` — після https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/actions/runs/40907026242
- Якість тестів — PR (B): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/45
- Якість тестів — убитий мутант (B): `src/lib/clients.ts:162` — `UUID_PATTERN` без `^` (посилання `x<uuid>` вважалося б карткою) → AC-CARD-16 → https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/tests/clients-page.test.ts#L131
- SQL-мутація (B): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/45 — C1 (AC-CARD-05) KILLED, C2 SURVIVED (еквівалентний, причина в proof pack), C3 (AC-CARD-06) KILLED
- UAT — специфікації (C): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/tests/e2e/client-access.spec.ts, https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/tests/e2e/negative-controls.spec.ts
- UAT — звіт на проді (C): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/qa/uat/2026-10-29/report.md
- UAT — PR зі звітом і відео (C): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/46
- UAT — негативний контроль (C): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/46 — NC-1 (AC-CARD-06, у твердженні хибний текст) → FAIL (R1); NC-2 (AC-CARD-06, хибне «Тоді» в `ac-text`) → NEEDS-HUMAN (R3; Haiku NEEDS-HUMAN, Sonnet FAIL)
- Рядки `docs/conformance.md` (C): AC-CARD-05 (реалізовано) https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/conformance.md#L82, AC-CARD-06 (реалізовано) https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/conformance.md#L83, AC-CARD-16 (реалізовано) https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/blob/0cb7a14a21d951bbf77da7af62ac7805eebcae2e/docs/conformance.md#L93 — з тестами Vitest і e2e
- Eval рецензента — PR з вадами, не злитий (D): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/47
- Eval рецензента — таблиця й ключ (D): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/47#issuecomment-6495311989
- Eval рецензента — правило й повторний прогін (D): https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/commit/7a7016e9b1af3fcffbdf42d3fdec7940cc10c9e5 (PR https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/48) і https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/pull/47#issuecomment-6498319349
- Відхилення від PM (C): не надходило

## Бонус

UAT у CI: зелений прогін `workflow_dispatch` — https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/actions/runs/40907043406

`.github/workflows/e2e.yml` запускає ті самі специфікації Playwright, що й UAT на проді, але на одноразовому локальному стеку Supabase в раннері, без хмарних секретів. «Дано» AC-CARD-05 (клієнт, свій лише для therapist2) створює фікстура `tests/e2e/fixtures/card-05-given.sql`. На проді те саме «Дано» підготовлено один раз через інтерфейс. Після зеленого прогону на `main` `e2e` став обов'язковою перевіркою `solo-main`. Наслідок: ці три AC перевіряються в браузері на кожному PR, а не лише в ручному UAT. Перший прогін на гілці впав (https://github.com/HryhoriiHaponiukQuitCode/therapy-scheduling/actions/runs/40865220803): знімок картки «до» брався через `innerText` з переносами рядків, а `toHaveText` порівнює `textContent`. Виправлено на `textContent`. Тест, який на проді проходив, у CI виявив нестабільне порівняння.
