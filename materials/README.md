# Матеріали WS8: що куди покласти у вашому репо

Автоматично у ваше репо цього тижня нічого не приходить. Нові файли розробник копіює звідси у своє репо
`<я>/<team-slug>` — у PR відповідного кроку [walkthrough розробника](../docs/walkthrough-dev.md). В описі PR: «взято з
`koldovsky/2026-quitcode-08-quality-hw/materials/…`». Використання матеріалів балів не знімає — для цього вони й
існують. Тести, мутанти, специфікації й таблиці — про **ваші** AC: їх ви пишете самі.

Більшість файлів — перевірена інфраструктура з демо-репо `koldovsky/2026-quitcode-06-leave-portal-demo`. Рядки зі
станом **`TODO(sync-from-demo)`** означають, що файл ще синхронізується з демо: поки його немає, `curl` поверне 404.
Шляхи «Куди у вашому репо» вже остаточні.

<!-- TODO(sync-from-demo): для того, хто синхронізує матеріали з демо.
     1) Покладіть кожен файл рівно за шляхом з колонки «Файл тут» (шляхи відносно materials/).
     2) Змініть стан рядка на «✅» і зробіть ім'я файлу посиланням.
     3) npm-скрипти нижче — канонічні для docs/: якщо в демо інші імена, оновіть docs/*.md або цей розділ разом.
     4) Перевірте на чистому клоні шаблону: quality.yml і smoke.yml проходять, typecheck і lint зелені. -->

## D0: health і smoke

| Файл тут | Куди у вашому репо | Навіщо | Стан |
|---|---|---|---|
| `deploy/health-route.ts` | `src/app/api/health/route.ts` | публічний маршрут: SHA збірки, середовище, чи відповідає база (`503` з причиною, зокрема `paused`) | `TODO(sync-from-demo)` |
| `deploy/smoke-prod.mjs` | `scripts/smoke-prod.mjs` | перевірка розгорнутого застосунку лише GET-запитами: `/`, `/login`, `/api/health`, очікуваний SHA | `TODO(sync-from-demo)` |
| `deploy/smoke.yml` | `.github/workflows/smoke.yml` | `smoke` після розгортання `main`, щодня й уручну; змінна репо `PROD_URL` | `TODO(sync-from-demo)` |
| [`accounts/zip-accounts.mjs`](accounts/zip-accounts.mjs) | `scripts/zip-accounts.mjs` | `accounts.txt` → `accounts.zip` (AES-256) без 7-Zip, з перевіркою хибним паролем | ✅ |
| [`issue-templates/deviation.yml`](issue-templates/deviation.yml) | `.github/ISSUE_TEMPLATE/deviation.yml` | форма issue «Відхилення від вимог» для PM (мітка `відхилення`) | ✅ |

Після копіювання маршруту додайте `"/api/health"` у `PUBLIC_PATHS` у `src/lib/supabase/proxy.ts`. Подробиці — у
[гайді D0](../docs/deploy-d0.md).

## A: ворота

| Файл тут | Куди у вашому репо | Навіщо | Стан |
|---|---|---|---|
| `gates/quality.yml` | `.github/workflows/quality.yml` | окремий workflow `quality`: `fallow audit` (лише нові знахідки), тестові правила лінтера, покриття в Summary, `npm audit` дорадчо. `ci.yml` не чіпаємо | `TODO(sync-from-demo)` |
| `gates/fallowrc.jsonc` | `.fallowrc.jsonc` (з крапкою) | конфіг fallow з причинами в коментарях; хибна тривога на `@tailwindcss/turbopack` уже в `ignoreDependencies` | `TODO(sync-from-demo)` |
| `gates/eslint-vitest-block.mjs` | блок у `eslint.config.mjs` (або окремий крок у `quality.yml`) | тестові правила `@vitest/eslint-plugin`: вимкнені, сфокусовані, порожні тести, умовні `expect` | `TODO(sync-from-demo)` |

## B: якість тестів

| Файл тут | Куди у вашому репо | Навіщо | Стан |
|---|---|---|---|
| `testing/vitest.coverage.config.mts` | `vitest.coverage.config.mts` | покриття v8 з порогами на файл лише для доменних модулів; `npm test` не змінюється | `TODO(sync-from-demo)` |
| `testing/coverage-summary.mjs` | `scripts/coverage-summary.mjs` | таблиця покриття в Summary прогону `quality` без сторонніх actions | `TODO(sync-from-demo)` |
| `testing/stryker.config.json` | `stryker.config.json` | Stryker для TS: що мутувати, звіти, тимчасова тека | `TODO(sync-from-demo)` |
| `testing/vitest.stryker.config.mts` | `vitest.stryker.config.mts` | Vitest для Stryker без тестів бази (їх доводить SQL-мутація) | `TODO(sync-from-demo)` |
| `testing/mutation-check.mjs` | `scripts/mutation-check.mjs` | SQL-мутації: тимчасово ламає політику чи функцію в міграції, запускає тести бази, завжди повертає файл | `TODO(sync-from-demo)` |
| `testing/mutants.example.mjs` | `scripts/mutants.mjs` | формат списку мутантів (`id`, `ac`, `file`, `tests`, `find`, `replace`); приклади з демо замініть своїми | `TODO(sync-from-demo)` |
| `testing/supabase-pglite.ts` | `tests/db/supabase-pglite.ts` | PGlite-гарнес: справжній Postgres у процесі тестів, `asUser` / `asAnon` / `asService`; потрібен для SQL-мутацій | `TODO(sync-from-demo)` |

## C: UAT

| Файл тут | Куди у вашому репо | Навіщо | Стан |
|---|---|---|---|
| `uat/playwright.config.ts` | `playwright.config.ts` | одна конфігурація для e2e і UAT: `UAT_BASE_URL`, запис відео й trace, кадри, `workers: 1`, `retries: 0` | `TODO(sync-from-demo)` |
| `uat/auth.setup.ts` | `tests/e2e/auth.setup.ts` | вхід під кожною роллю **без запису й без trace**; сесії — у `playwright/.auth/` (у `.gitignore`) | `TODO(sync-from-demo)` |
| `uat/uat.ts` | `tests/e2e/support/uat.ts` | помічники `given` / `when` / `thenStep`: кадр «Тоді» без оверлеїв, aria-знімок, видимі й невидимі частини | `TODO(sync-from-demo)` |
| `uat/example.spec.ts` | — (зразок формату для `tests/e2e/<область>.spec.ts`) | одна специфікація AC демо: як виглядають кроки, `thenStep` і анотація `ac` | `TODO(sync-from-demo)` |
| `uat/scripts/` (`build-review-pack.mjs`, `review.mjs`, `combine.mjs`, `review-prompt.uk.md`, `verdict.schema.json`) | `scripts/uat/` | рецензент «наосліп» (`claude -p`, лише Read) і об'єднання вердиктів у `uat-report.md` і `manifest.json`. Промпт і схему не змінюйте | `TODO(sync-from-demo)` |
| `uat/test-titles.mjs` | `scripts/lib/test-titles.mjs` | фільтр, з яким `ac:coverage` бачить AC ID і в `tests/e2e/*.spec.ts` | `TODO(sync-from-demo)` |

## Шаблони

| Файл тут | Куди у вашому репо | Навіщо | Стан |
|---|---|---|---|
| [`templates/proof-pack.template.md`](templates/proof-pack.template.md) | `docs/qa/proof-pack.md` | QA proof pack: 3 AC наскрізь — рівень, покриття, мутація, UAT, вердикт, підпис PM; таблиця eval рецензента | ✅ |

## Залежності (точні версії)

```powershell
npm i -D --save-exact fallow@3.35.0 @vitest/eslint-plugin@1.6.27 @vitest/coverage-v8@5.0.3
npm i -D --save-exact @stryker-mutator/core@10.1.1 @stryker-mutator/vitest-runner@10.1.1
npm i -D --save-exact @playwright/test@1.64.1
npx playwright install chromium --only-shell
```

- `@vitest/coverage-v8` — рівно та сама версія, що `vitest` у вашому `package.json` (у шаблоні 5.0.3).
- `@vitest/eslint-plugin` — **1.6.27**: 1.6.28 вимагає TypeScript 6 і не ставиться (ERESOLVE).
- Stryker — **10.1.1**: підтримка Vitest 5 з'явилась у 10.1.0, але на npm 10.1.0 немає. Версія 10.0.0 з Vitest 5
  мовчки показує 0 % (жоден тест не запускається).
- `@playwright/test` — у devDependencies обов'язково: `tsconfig.json` охоплює `**/*.ts`, тож без пакета
  `npm run typecheck` і `npm run lint` в обов'язковому `app` стануть червоними.
- Chromium для Playwright — кілька сотень МБ у `%LOCALAPPDATA%\ms-playwright`. Якщо запис відео скаржиться на
  ffmpeg — `npx playwright install ffmpeg`.
- PGlite-гарнес (якщо додаєте) — ще й `npm i -D --save-exact @electric-sql/pglite@0.5.8`.

## npm-скрипти

Ці імена використовують гайди й walkthrough. Команди — одним рядком кожна (у PowerShell `\` не переносить рядок):

```powershell
npm pkg set scripts.smoke="node scripts/smoke-prod.mjs"
npm pkg set scripts.gates="fallow audit"
npm pkg set scripts.test:coverage="vitest run --config vitest.coverage.config.mts --coverage"
npm pkg set scripts.mutation:ts="stryker run"
npm pkg set scripts.mutation:sql="node scripts/mutation-check.mjs"
npm pkg set scripts.uat="playwright test"
npm pkg set scripts.uat:review="node scripts/uat/review.mjs"
npm pkg set scripts.accounts:zip="node scripts/zip-accounts.mjs"
```

<!-- TODO(sync-from-demo): uat:review — точна команда конвеєра (build-review-pack → review → combine) з демо. -->

## `.gitignore` і ESLint

Додайте в `.gitignore`:

```text
accounts.txt
coverage/
reports/
.stryker-tmp/
.fallow/
uat-results/
playwright/.auth/
playwright-report/
test-results/
```

ESLint не читає `.gitignore`, тож ті самі теки — у `globalIgnores([...])` вашого `eslint.config.mjs`: `coverage/**`,
`reports/**`, `.stryker-tmp/**`, `.fallow/**`, `uat-results/**`, `playwright-report/**`, `test-results/**`.

## Що важливо при копіюванні

- **`ci.yml` і назви його jobs не змінюємо:** на них тримається ruleset `solo-main`. Нові перевірки живуть в окремих
  workflow (`quality`, `smoke`).
- **Конфіги Vitest для покриття й Stryker імпортують базовий конфіг як `./vitest.config.mjs`**, хоча файл —
  `vitest.config.mts`. TypeScript і Vite зводять `.mjs` до `.mts`. А з `.mts` в імпорті `npm run typecheck` і
  `npm run build` падають з `TS5097`.
- **Тестові правила лінтера:** рівень `warn` в `eslint.config.mjs` не є м'яким стартом. `npm run lint` має
  `--max-warnings 0`, тож обов'язковий `app` стане червоним. Або спершу почистіть репо і вмикайте як `error`, або
  ганяйте правила окремим кроком у `quality.yml`.
- **fallow:** перед першим запуском — `npm ci` (без `node_modules` fallow попереджає, що знахідки про залежності можуть
  бути хибними). Якщо результати виглядають застарілими — `npx fallow --no-cache`.
- **Stryker** після невдалого прогону лишає `.stryker-tmp/` з повною копією репо. Видаліть теку, інакше агент і
  `ac:coverage` шукатимуть і в ній.
