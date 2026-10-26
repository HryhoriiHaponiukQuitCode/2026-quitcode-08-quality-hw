# Матеріали WS8: що куди покласти у вашому репо

Автоматично у ваше репо нічого не приходить. Розробник копіює файли звідси у своє репо `<я>/<team-slug>` у PR
відповідного кроку [walkthrough розробника](../docs/walkthrough-dev.md). В описі PR: «взято з
`koldovsky/2026-quitcode-08-quality-hw/materials/…`». Використання матеріалів балів не знімає — для цього вони й
існують. Тести, мутанти, специфікації Playwright і таблиці — про **ваші** AC: їх ви пишете самі.

**Звідки файли.** Це інфраструктура з демо-репо
[`koldovsky/2026-quitcode-06-leave-portal-demo`](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo),
взята з тегів, а не з робочих гілок:

| Тег | Що в ньому | PR у демо |
|---|---|---|
| [`ws8-00-baseline`](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/tree/ws8-00-baseline) | стартовий стан WS8 (`next` 16.4.3) | — |
| [`ws8-01-gates`](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/tree/ws8-01-gates) | ворота: fallow, тестові правила лінтера, покриття, `quality.yml` | [#35](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/pull/35) |
| [`ws8-02-tests`](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/tree/ws8-02-tests) | якість тестів: тести з AC, Stryker, SQL-мутації | [#35](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/pull/35) |
| [`ws8-03-uat`](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/tree/ws8-03-uat) | E2E = UAT за AC, звіт UAT, `e2e.yml`, D0 (`/api/health`, `smoke`) | [#34](https://github.com/koldovsky/2026-quitcode-06-leave-portal-demo/pull/34) |

Демо-специфічне (ролі, таблиці й модулі демо) у файлах замінено на те, що підходить проєкту з
[шаблону курсу](https://github.com/koldovsky/2026-quitcode-06-project-template). Що саме змінено — [нижче](#що-змінено-порівняно-з-демо).
Місця, які треба підлаштувати під свій проєкт, позначено в коментарях словом **«ВАШЕ»** або **«замініть»**.

**Перевірено на чистому клоні шаблону** (`main` 7e65021, Windows, Node 24, 26.10.2026): усі матеріали разом →
`npm run lint` (0 попереджень), `npm run typecheck`, `npm test` (51 тест), `CI=true npm run build` (у списку
маршрутів є `ƒ /api/health`), `npm run test:coverage`, `npm run ac:coverage`, `npm run gates` (код 0),
`npm run mutation:ts` (`src/lib/health.ts` — 93,18 %, ≈6 с), `npm run mutation:sql` (P1 і P2 — `KILLED`, ≈5 с),
`npx playwright test --list`. Прогони на проді й у CI — у демо (цифри — у гайдах).

## Як копіювати

Шляхи тут повторюють шляхи у вашому репо: `materials/<блок>/<шлях>` → `<шлях>`. Тож один цикл на блок:

```powershell
$B = "https://raw.githubusercontent.com/koldovsky/2026-quitcode-08-quality-hw/main/materials"
foreach ($f in "scripts/smoke.mjs", ".github/workflows/smoke.yml") {
  curl.exe -fsSL --create-dirs -o $f "$B/d0/$f"
}
```

- `-f` — помилка замість тихого файлу з текстом «404: Not Found»; `--create-dirs` — створює теки.
- Повні списки файлів для кожного кроку — у [walkthrough розробника](../docs/walkthrough-dev.md).
- Склонували цей репо? Тоді `Copy-Item -Recurse -Force <клон>/materials/<блок>/* .` (і `.github`, `.fallowrc.jsonc` —
  вони приховані: перевірте `git status`).

## D0: health і smoke

| Файл тут | Куди у вашому репо | Навіщо |
|---|---|---|
| [`d0/src/app/api/health/route.ts`](d0/src/app/api/health/route.ts) | `src/app/api/health/route.ts` | публічний `GET /api/health` → `{ ok, sha, env, db, reason }`, `200` або `503`, `cache-control: no-store`. Запит до бази — публічним ключем до таблиці `profiles` шаблону (іншої назви таблиці — змініть рядок `from("profiles")`) |
| [`d0/src/lib/health.ts`](d0/src/lib/health.ts) | `src/lib/health.ts` | чиста функція `classifyDbProbe`: `540` → `"paused"`, хибний ключ → `"invalid-api-key"`, `42501` — база жива |
| [`d0/tests/health.test.ts`](d0/tests/health.test.ts) | `tests/health.test.ts` | 4 тести на всі гілки `classifyDbProbe` без мережі |
| [`d0/scripts/smoke.mjs`](d0/scripts/smoke.mjs) | `scripts/smoke.mjs` | лише GET: `/` (не стіна входу Vercel), `/login` (200 з полем пароля), `/api/health` (`db` = `ok`, SHA = очікуваний, до 6 спроб × 20 с). Підказка на кожен збій. Код 0 / 1 / 2 (немає адреси) |
| [`d0/.github/workflows/smoke.yml`](d0/.github/workflows/smoke.yml) | `.github/workflows/smoke.yml` | `smoke` після деплою `main` (статус Vercel; ще `repository_dispatch`), щодня й уручну; змінна репо `PROD_URL` (без неї — червоний прогін з підказкою) |
| [`accounts/zip-accounts.mjs`](accounts/zip-accounts.mjs) | `scripts/zip-accounts.mjs` | `accounts.txt` → `accounts.zip` (AES-256) без 7-Zip, з перевіркою хибним паролем. Потрібен `@zip.js/zip.js@2.24.0` |
| [`issue-templates/deviation.yml`](issue-templates/deviation.yml) | `.github/ISSUE_TEMPLATE/deviation.yml` | форма issue «Відхилення від вимог» для PM (мітка `відхилення`) |

Після копіювання — **`"/api/health"` у `PUBLIC_PATHS`** у `src/lib/supabase/proxy.ts`:
`const PUBLIC_PATHS = ["/login", "/auth", "/api/health"];`. Інакше proxy відповідає `307` на `/login`.

**Як перевірити:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (у списку маршрутів — `ƒ /api/health`).
Після злиття й деплою — `npm run smoke -- https://<проєкт>.vercel.app <SHA main>` → код 0 і рядок «OK — прод живий…».
До злиття прод відповідає так само, як демо до злиття: код 1 і `"/api/health": 307 → /login — додайте "/api/health"
у PUBLIC_PATHS`. Подробиці — у [гайді D0](../docs/deploy-d0.md).

## A: ворота

| Файл тут | Куди у вашому репо | Навіщо |
|---|---|---|
| [`gates/.github/workflows/quality.yml`](gates/.github/workflows/quality.yml) | `.github/workflows/quality.yml` | workflow `quality`, три jobs: «Ворота: fallow audit» (лише нові знахідки відносно бази PR), «Покриття: доменна підлога» (+ таблиця в Summary), «Порада: вразливі залежності» (`npm audit --omit=dev`, ніколи не червоніє). `ci.yml` не чіпаємо |
| [`gates/.fallowrc.jsonc`](gates/.fallowrc.jsonc) | `.fallowrc.jsonc` | конфіг fallow 3.35.0 з причинами в коментарях: правила Next.js і «послаблених тестів» як `error`, хибна тривога на `@tailwindcss/turbopack` і `@vitest/coverage-v8` — у `ignoreDependencies`, складність скриптів курсу — у `health.ignore` |
| [`gates/eslint.config.mjs`](gates/eslint.config.mjs) | `eslint.config.mjs` | конфіг шаблону + блоки WS8: тестові правила `@vitest/eslint-plugin` як `error` (вимкнені й сфокусовані тести, умовні `expect`, `toThrow()` без тексту, AC ID не на початку назви, `vi.mock` власних модулів); правила Playwright для `tests/e2e/**`; ігнор тек звітів. Правила з типами — закоментований необов'язковий блок |
| [`gates/vitest.coverage.config.mts`](gates/vitest.coverage.config.mts) | `vitest.coverage.config.mts` | покриття v8 окремим конфігом (`npm test` не змінюється); підлога 90/85/90/90 на файл — лише для доменних файлів зі списку `FLOORED` (**ВАШЕ**; порожній список — без підлоги) |
| [`gates/scripts/coverage-summary.mjs`](gates/scripts/coverage-summary.mjs) | `scripts/coverage-summary.mjs` | таблиця покриття в Summary прогону (без сторонніх actions): спершу домен `src/lib/**` (крім `src/lib/supabase/**`), найнижчі зверху |

```powershell
npm i -D --save-exact fallow@3.35.0 @vitest/eslint-plugin@1.6.27 @vitest/coverage-v8@5.0.3 eslint-plugin-playwright@2.12.1
```

**Як перевірити:** `npm run lint` → 0 попереджень (на чистому шаблоні так і є; знахідки у ваших тестах — виправити
або пояснити, див. walkthrough). `npm run gates` → lint, typecheck і `fallow audit` з рядком `Audit scope: N changed
files vs origin/main`, код 0. `npm run test:coverage`, потім `npm run coverage:summary` → таблиця в терміналі, звіт —
`coverage/index.html`.

Що важливо:

- **`gates` завжди з `--base origin/main`.** Без бази fallow порівнює з upstream гілки. Після `git push -u` це сама
  гілка, і аудит перевіряє 0 файлів (`Audit scope: 0 changed files`) — тобто завжди «зелений». Так сталося в демо;
  `quality.yml` базу передає сам.
- **`@vitest/coverage-v8` — рівно та сама версія, що `vitest`** (у шаблоні 5.0.3).
- **`@vitest/eslint-plugin` — 1.6.27:** 1.6.28 вимагає TypeScript 6 і не ставиться (ERESOLVE).
- **Рівень `warn` в `eslint.config.mjs` не є м'яким стартом.** `npm run lint` має `--max-warnings 0`, тож обов'язковий
  `app` стане червоним. Тому правила одразу `error`, а знахідки — виправлені чи пояснені в тому самому PR.
- **`eslint.config.mjs`:** ваш файл не відрізняється від шаблону (`git diff` з шаблоном порожній) — замініть
  цілком. Змінювали — перенесіть три блоки «WS8» і рядки `globalIgnores`.
- **`vitest.coverage.config.mts` імпортує `./vitest.config.mjs`**, хоча файл — `vitest.config.mts`. Так треба: з
  `.mts` в імпорті `npm run typecheck` і `npm run build` падають з `TS5097`.
- **fallow:** перед першим запуском — `npm ci` (без `node_modules` знахідки про залежності можуть бути хибними).
  Результати дивні — `npx fallow --no-cache`.

## B: якість тестів

| Файл тут | Куди у вашому репо | Навіщо |
|---|---|---|
| [`testing/stryker.config.json`](testing/stryker.config.json) | `stryker.config.json` | Stryker 10.1.1 для TS: мутує `src/lib/**` (крім `src/lib/supabase/**`), звіт — `reports/mutation/mutation.html`, `cleanTempDir: "always"` |
| [`testing/vitest.stryker.config.mts`](testing/vitest.stryker.config.mts) | `vitest.stryker.config.mts` | Vitest для Stryker без `tests/db/**` і `tests/scripts/**` (правила в SQL доводить SQL-мутація) |
| [`testing/scripts/mutation-check.mjs`](testing/scripts/mutation-check.mjs) | `scripts/mutation-check.mjs` | SQL-мутації: одна буквальна заміна в міграції → лише названі тести → файл завжди повертається. `KILLED` / `SURVIVED` / `ERROR` (тест-файл не завантажився — не рахується вбитим). Спершу прогін без мутацій. `--only`, `--kind`, `--markdown`, `--json` |
| [`testing/scripts/mutants.mjs`](testing/scripts/mutants.mjs) | `scripts/mutants.mjs` | список мутантів. P1 і P2 — **перевірка гарнесу** на `profiles` шаблону; ваші мутанти за вашими AC — допишіть; приклади з демо — у коментарі |
| [`testing/tests/db/supabase-pglite.ts`](testing/tests/db/supabase-pglite.ts) | `tests/db/supabase-pglite.ts` | PGlite-гарнес: справжній Postgres у процесі тестів з усіма `supabase/migrations/*.sql`, `seed.sql` і користувачами з `supabase/demo-users.json`; `createTestDb()` → `asUser` / `asAnon` / `asService` |
| [`testing/tests/db/profiles-db.test.ts`](testing/tests/db/profiles-db.test.ts) | `tests/db/profiles-db.test.ts` | 4 тести, що гарнес працює на вашій схемі (`profiles` шаблону); ціль P1 і P2. Не доказ AC: назви без AC ID |

```powershell
npm i -D --save-exact @stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1
npm i -D --save-exact @electric-sql/pglite@0.5.8    # якщо гарнесу ще немає
```

**Як перевірити:** `npm run mutation:ts -- --mutate src/lib/<модуль>.ts` → таблиця Stryker і
`reports/mutation/mutation.html`. `npm run mutation:sql` → на чистому шаблоні `P1 KILLED`, `P2 KILLED`, «Мутаційний
бал: 2 з 2 вбито». Якщо P1 чи P2 у вас `SURVIVED`, пізніша міграція змінила правило `profiles`, і тест його не бачить —
розберіться або приберіть P1/P2 разом із `profiles-db.test.ts`.

Що важливо:

- **Stryker — 10.1.1.** Підтримка Vitest 5 з'явилась у 10.1.0, але на npm 10.1.0 немає. 10.0.0 з Vitest 5 мовчки
  показує 0 %: жоден тест не запускається.
- **`npm ci` після Stryker друкує «2 moderate severity vulnerabilities».** Це `qs` у dev-залежностях Stryker;
  `npm audit --omit=dev` чистий, і job «Порада: вразливі залежності» зелений. `npm audit fix` не потрібен.
- **Не додавайте `--logLevel debug`** до Stryker: з vitest-runner 10.1.1 і Vitest 5 він падає (stryker-js #6272).
- **Гарнес у вашому репо вже є** (з WS6–WS7) — лишайте свій. Матеріали з нього потрібні лише `mutation-check.mjs`
  і `mutants.mjs`; `profiles-db.test.ts` перепишіть на свою функцію створення бази або не беріть.
- PGlite 0.5.8 — це PostgreSQL 18, а `db-check` — 17. `db-check` лишається обов'язковим поруч із тестами бази.

## C: UAT

| Файл тут | Куди у вашому репо | Навіщо |
|---|---|---|
| [`uat/playwright.config.ts`](uat/playwright.config.ts) | `playwright.config.ts` | одна конфігурація для e2e і UAT: `UAT_BASE_URL` задано — ваш прод, ні — локальна збірка (`npm run build && npm run start`). Відео, trace й кадр на кожен тест; `retries: 0`, `workers: 1`; проєкти `setup` і `cleanup` без запису; `.env.local` конфіг завантажує сам; звіти — у `test-results/` |
| [`uat/tests/e2e/auth.setup.ts`](uat/tests/e2e/auth.setup.ts) | `tests/e2e/auth.setup.ts` | вхід під кожною роллю один раз → `playwright/.auth/<роль>.json`. `ROLES` — **ВАШІ**; пароль — `DEMO_USER_PASSWORD` або `UAT_PASSWORD_<РОЛЬ>` |
| [`uat/tests/e2e/support/uat.ts`](uat/tests/e2e/support/uat.ts) | `tests/e2e/support/uat.ts` | `given` / `when` / `thenStep(page, { clause, visible, hidden, mask }, fn)`: кадр «Тоді» без оверлеїв і курсора, aria-знімок, кадр і тоді, коли твердження впало; `attachRuntimeErrors`; `signIn` (пароль не потрапляє в trace) |
| [`uat/tests/e2e/support/admin.ts`](uat/tests/e2e/support/admin.ts) | `tests/e2e/support/admin.ts` | синтетичні `uat-<запуск>@example.test` і прибирання за ними секретним ключем з `.env.local`. `OWNED_ROWS` — **ВАШЕ** |
| [`uat/tests/e2e/cleanup.teardown.ts`](uat/tests/e2e/cleanup.teardown.ts) | `tests/e2e/cleanup.teardown.ts` | після прогону видаляє всі `uat-*@example.test` і падає, якщо щось лишилось; без секретного ключа тесту немає |
| [`uat/scripts/uat/`](uat/scripts/uat/) — `run.mjs`, `pack.mjs`, `review.mjs`, `combine.mjs`, `report.mjs`, `lib.mjs`, `review-prompt.uk.md`, `verdict.schema.json` | `scripts/uat/` | конвеєр `npm run uat`: Playwright → пакет для рецензента → рецензент «наосліп» (`claude -p`, лише Read; Haiku 5.5, суперечка → Sonnet 5.5) → вердикт у коді (R1–R6) → `docs/qa/uat/<YYYY-MM-DD>/report.md`, `manifest.json`, `frames/`. **Промпт і схему не змінюйте** |
| [`uat/scripts/lib/test-titles.mjs`](uat/scripts/lib/test-titles.mjs) | `scripts/lib/test-titles.mjs` | `ac:coverage` рахує AC ID і в `tests/e2e/**/*.spec.ts` (Playwright), а `tests/e2e/*.test.ts` і помічники — ні |
| [`uat/scripts/check-ac-coverage.mjs`](uat/scripts/check-ac-coverage.mjs) | `scripts/check-ac-coverage.mjs` | той самий скрипт шаблону з чесним текстом про `tests/e2e` |
| [`uat/tests/scripts/check-ac-coverage.test.ts`](uat/tests/scripts/check-ac-coverage.test.ts) і [`uat/tests/fixtures/ac-coverage/`](uat/tests/fixtures/ac-coverage/) (`e2e-counted/…`, `e2e-not-run/…`) | ті самі шляхи | тест шаблону + 2 тести нового фільтра на фікстурах |
| [`uat/vitest.config.mts`](uat/vitest.config.mts) | `vitest.config.mts` | конфіг шаблону + `"tests/e2e/**"` в `exclude`: Vitest не чіпає територію Playwright |
| [`uat/.github/workflows/e2e.yml`](uat/.github/workflows/e2e.yml) | `.github/workflows/e2e.yml` | **бонус:** ті самі специфікації в CI на одноразовому Supabase в раннері (`supabase start`), без хмарних секретів; `pull_request`, `push` у `main`, `workflow_dispatch` |
| [`uat/examples/`](uat/examples/) | — (не копіюйте) | **зразки формату** з демо: `users-forbidden.spec.ts` (відмова, лише читання), `users-copy-link.spec.ts` (`@writes` з прибиранням, буфер обміну, `mask`), `negative-controls.spec.ts` (NC-1 → FAIL, NC-2 → NEEDS-HUMAN) |

```powershell
npm i -D --save-exact @playwright/test@1.64.1
npx playwright install chromium
```

**Як перевірити:** `npm run lint`, `npm run typecheck`, `npm test` (Vitest не бере `*.spec.ts`), `npm run ac:coverage`.
`npx playwright test --list` → проєкт `setup` з вашими ролями і ваші специфікації. Потім `npm run uat -- --url
https://<проєкт>.vercel.app` — див. [UAT-гайд](../docs/uat-guide.md).

Що важливо:

- **`@playwright/test` — у devDependencies обов'язково:** `tsconfig.json` шаблону охоплює `**/*.ts`, тож без пакета
  `npm run typecheck` і `npm run lint` в обов'язковому `app` червоні.
- **Браузер:** `npx playwright install chromium` — кілька сотень МБ у `%LOCALAPPDATA%\ms-playwright`. Так ставили в
  демо локально. `--only-shell` (без повного Chromium) перевірено лише в CI на Linux (`e2e.yml`).
- **Рецензенту потрібен Claude Code** (`claude` у PATH) зі входом за підпискою або `ANTHROPIC_API_KEY`. Без нього —
  `node scripts/uat/run.mjs --url … --skip-review`: звіт буде, але всі вердикти — NEEDS-HUMAN (правило R2).
- **`vitest.config.mts`, `scripts/lib/test-titles.mjs`, `scripts/check-ac-coverage.mjs`, `tests/scripts/check-ac-coverage.test.ts`**
  — файли шаблону з правками WS8. Не змінювали свої — замініть цілком; змінювали — перенесіть правки (порівняйте з
  тегом `ws8-03-uat` демо).
- `npm ci` попереджає про `allow-scripts` і `unrs-resolver` на будь-якому проєкті з шаблону — до Playwright це не має
  стосунку.

## Шаблони

| Файл тут | Куди у вашому репо | Навіщо |
|---|---|---|
| [`templates/proof-pack.template.md`](templates/proof-pack.template.md) | `docs/qa/proof-pack.md` | QA proof pack: 3 AC наскрізь — рівень, покриття, мутація, UAT, вердикт, підпис PM; таблиця eval рецензента |

## Залежності (точні версії)

| Пакет | Версія | Крок | Чому саме ця |
|---|---|---|---|
| `next`, `eslint-config-next` | 16.4.3 | D0 | ≥ 16.4.1 закриває GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r; обидва пакети разом |
| `@zip.js/zip.js` | 2.24.0 | D0 (без 7-Zip) | AES-256 у `scripts/zip-accounts.mjs` |
| `fallow` | 3.35.0 | A | молодий інструмент (≈реліз на день): версію закріплюємо, як у демо |
| `@vitest/eslint-plugin` | 1.6.27 | A | 1.6.28 вимагає TypeScript 6 |
| `@vitest/coverage-v8` | 5.0.3 | A | = версія `vitest` |
| `eslint-plugin-playwright` | 2.12.1 | A (його імпортує `eslint.config.mjs`) | як у демо |
| `@stryker-mutator/core`, `@stryker-mutator/vitest-runner` | 10.1.1 | B | перша версія на npm з підтримкою Vitest 5 |
| `@electric-sql/pglite` | 0.5.8 | B (якщо немає гарнесу) | як у демо й у репо з гарнесом |
| `@playwright/test` | 1.64.1 | C | як у демо |

## npm-скрипти

Ці імена використовують гайди, walkthrough і самі скрипти. Команди — для PowerShell (перевірено в Windows PowerShell
5.1, `&&` усередині лапок працює):

```powershell
npm pkg set scripts.smoke="node scripts/smoke.mjs"
npm pkg set scripts.accounts:zip="node scripts/zip-accounts.mjs"
npm pkg set scripts.gates="npm run lint && npm run typecheck && fallow audit --base origin/main"
npm pkg set scripts.test:coverage="vitest run --config vitest.coverage.config.mts --coverage"
npm pkg set scripts.coverage:summary="node scripts/coverage-summary.mjs"
npm pkg set scripts.mutation:ts="stryker run"
npm pkg set scripts.mutation:sql="node scripts/mutation-check.mjs --kind sql"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.uat="node scripts/uat/run.mjs"
npm pkg set scripts.uat:nc="node scripts/uat/run.mjs --negative-controls"
npm pkg set scripts.uat:review="node scripts/uat/review.mjs && node scripts/uat/report.mjs"
```

| Скрипт | Що робить |
|---|---|
| `npm run smoke -- <URL> [SHA]` | D0-перевірка розгорнутого застосунку |
| `npm run gates` | lint + typecheck + `fallow audit --base origin/main` (лише нові знахідки) |
| `npm run test:coverage` · `npm run coverage:summary` | покриття з підлогою · таблиця покриття |
| `npm run mutation:ts [-- --mutate <файл>]` | Stryker |
| `npm run mutation:sql [-- --only P1,P2] [-- --markdown]` | SQL-мутації (`scripts/mutants.mjs`, `kind: "sql"`); TS-точкові — `node scripts/mutation-check.mjs --kind ts` |
| `npm run test:e2e` | Playwright на локальній збірці (так само в `e2e.yml`) |
| `npm run uat -- --url <прод>` | UAT: Playwright → рецензент → звіт у `docs/qa/uat/<дата>/`. Решта аргументів іде в Playwright, напр. `--grep-invert @writes` |
| `npm run uat:nc -- --url <прод>` | негативні контролі (тег `@negative-control`), звіт — `test-results/uat-report-nc/` |
| `npm run uat:review` | повторний розбір наявних пакетів і новий звіт без нового прогону Playwright |

## `.gitignore`

Допишіть (у шаблоні `/coverage` уже є):

```text
# WS8: тестові акаунти — у git лише зашифрований accounts.zip
accounts.txt
# WS8: інструменти якості — кеш і копії мутантів fallow, пісочниця й звіти Stryker
/.fallow/
/.stryker-tmp/
/reports/
# WS8: Playwright (e2e/UAT) — звіти, відео, траси й кадри лише локально та в артефактах CI;
# playwright/.auth — живі cookie сесій тестових ролей, ніколи не комітимо
/test-results/
/playwright-report/
/blob-report/
/playwright/.auth/
```

Ті самі теки вже є в `globalIgnores` файлу [`gates/eslint.config.mjs`](gates/eslint.config.mjs): ESLint не читає
`.gitignore`.

## Що змінено порівняно з демо

- **`smoke.yml`:** у демо без `PROD_URL` бралася адреса демо. Тут — червоний прогін з підказкою, щоб smoke ніколи
  не перевіряв чужий прод.
- **`gates` (npm-скрипт):** у демо — `fallow audit` без бази (див. вище, чому це «завжди зелено» після push). Тут —
  `--base origin/main`.
- **`.fallowrc.jsonc`:** `entry` — лише `vitest.stryker.config.mts` (у демо ще скрипт атаки з RUNBOOK демо);
  додано `health.ignore` для скриптів курсу: без нього PR, що додає `scripts/uat/**`, червоніє на складності
  (перевірено на клоні шаблону: 19 знахідок складності, код 1 → з `health.ignore` код 0).
- **`eslint.config.mjs`:** блоки з двох гілок демо зведено в один файл; заборона `vi.mock` — для всіх `src/lib/**`
  (крім `src/lib/supabase/**`) і `src/app/**`, а не для трьох тек демо; правила з типами — закоментовані.
- **`vitest.coverage.config.mts`, `coverage-summary.mjs`, `stryker.config.json`:** список модулів демо замінено на
  `src/lib/**` без адаптерів Supabase; підлога — порожній список `FLOORED`, який заповнюєте ви.
- **PGlite-гарнес:** `createLeaveDb` → `createTestDb`, без підрозділів і посад демо.
- **`mutants.mjs`:** 13 мутантів демо → P1, P2 на `profiles` шаблону + приклади з демо в коментарі.
- **`auth.setup.ts`, `admin.ts`:** ролі шаблону замість ролей демо; без помічників під схему демо; `OWNED_ROWS`
  порожній; необов'язковий пароль на роль.
- **`test-titles.mjs`:** без псевдоніма `isRunByNpmTest` (у шаблоні його ніхто не імпортує; fallow позначив би його
  невикористаним експортом).
- **`report.mjs`:** «заявок, що лишились» → «їхніх рядків, що лишились».
- Решта файлів — без змін, крім рядка «джерело» в коментарях.
