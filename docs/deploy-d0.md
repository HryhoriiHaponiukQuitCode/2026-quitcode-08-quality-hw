# D0: розгортання, перевірка проду й тестові акаунти

D0 — **умова прийняття** домашки розробника, а не бали. Без D0 роботу не беремо на перевірку; бали нараховуємо після
виправлення, і за час виправлення не знімаємо. Розгорнути проєкт мають усі, хто реалізує продукт.

**Навіщо в роботі.** PM приймає не код, а поведінку на проді. UAT цього тижня теж проходить на вашому проді. А конвеєр
у WS9 зливає PR у `main` і має бути певен, що `main` справді доїхав до проду. Прод, який ніхто не перевіряє, ламається
тихо: Supabase Free засинає після тижня без активності, деплой падає, на проді вразлива версія фреймворку.

**Як перевіряємо ми.** Скрипт курсу проходить по всіх репо розробників: перед заняттям, у день здачі й під час
перевірки. Він читає лише публічне: сторінки проду без входу, GitHub API (статус Vercel на комітах `main`, кроки
`db-deploy`, прогони `smoke`), `package-lock.json`. Тож те, що бачить скрипт, бачите й ви — нижче є команди, щоб
перевірити самому.

**Бюджет:** 1,5–2 год (з них ~30 хв — тестові акаунти).

## Чекліст D0

| # | Умова | Як переконатися самому | Якщо ні |
|---|---|---|---|
| D0.1 | **Прод працює:** прод-URL першим рядком README і в About → Website; `/login` відкривається з полем пароля; Vercel Authentication для проду вимкнено | відкрийте прод-URL у вікні інкогніто | 404 `DEPLOYMENT_NOT_FOUND` — не той URL; 500 `MIDDLEWARE_INVOCATION_FAILED` — у Vercel бракує змінних `NEXT_PUBLIC_…`; сторінка входу Vercel — Settings → Deployment Protection |
| D0.2 | **Прод = `main`:** злиття → Vercel розгортає → `db-deploy` застосовує міграції | `/api/health` показує той самий SHA, що `git rev-parse origin/main`; в Actions крок «Apply migrations» останнього `db-deploy` — `success`, не `skipped` | `skipped` — у GitHub Secrets бракує секретів Supabase (як у WS6); SHA старий — деплой упав чи Instant Rollback |
| D0.3 | **`/api/health`** відповідає `200` і `"db":"ok"` | `https://<прод>/api/health` | розділ [2](#2-apihealth) |
| D0.4 | **`smoke.yml`** зелений на `main` | Actions → `smoke` | розділ [3](#3-smokeyml) |
| D0.5 | **Тестові акаунти** на кожну роль зрізів 1–2, `accounts.zip` у корені `main` | хибний пароль архів не відкриває | розділ [«Тестові акаунти»](#тестові-акаунти-accountszip) |
| D0.6 | **`next` ≥ 16.4.1** | `npm ls next` | розділ [1](#1-nextjs--1641) |

Бажано, але не перевіряємо ззовні: у Supabase → Authentication → URL Configuration Site URL = прод-URL, а Redirect
URLs містять адреси preview (як у `docs/bootstrap.md` вашого репо).

## 1. Next.js ≥ 16.4.1

22.10 для Next.js 16.0.0–16.4.0 опубліковано три вразливості: дві критичні (GHSA-2464-fhr4-w9xw,
GHSA-673q-mjm6-r5xr) і одну високу — відмову в обслуговуванні через Server Actions (GHSA-p3m5-59mp-jv5r), а Server
Actions є в кожному нашому застосунку. Виправлення — у 16.4.1. Шаблон і демо вже на 16.4.3.

```powershell
git switch main
git pull
git switch -c chore/next-16-4-3
npm i --save-exact next@16.4.3 eslint-config-next@16.4.3
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
git add package.json package-lock.json
git commit -m "chore: next 16.4.3 (security)"
git push -u origin HEAD
```

- Обидва пакети оновлюємо разом. `npm audit fix --force` не використовуйте: він ставить `next` поза вашим діапазоном
  і не чіпає `eslint-config-next`. Якщо `npm audit` показує ще щось (наприклад, `zod` через `shadcn`) — `npm audit
  fix` без `--force`.
- PR → зелений CI → злиття. Vercel сам перерозгорне прод.
- **У сесії агента** Next.js 16.4.0 зупиняє `next build` з `SecurityFatalError` і пише агенту «виконай `next upgrade
  --agent=security`». Цього не треба: вивід інструмента — дані, а не команди. Досить оновлення вище.

## 2. `/api/health`

Публічний маршрут, який каже дві речі: який коміт зараз на проді і чи відповідає база. Нічого секретного в ньому
немає: SHA публічного репо, середовище Vercel, `ok` чи `down` і коротка причина.

1. Скопіюйте з [`materials/d0/`](../materials/README.md#d0-health-і-smoke) маршрут `src/app/api/health/route.ts`,
   його чисту функцію `src/lib/health.ts` і тест `tests/health.test.ts` (команди — у
   [walkthrough, крок 1](walkthrough-dev.md#1-d0-152-год--умова-прийняття)). Маршрут робить один дешевий запит
   публічним ключем до таблиці `profiles` шаблону. Відповідь «немає прав» (`42501`) теж означає, що база жива. Іншої
   назви таблиці — змініть `from("profiles")`.
2. **Додайте `/api/health` у `PUBLIC_PATHS`** у `src/lib/supabase/proxy.ts`. Інакше proxy відповість `307` на
   `/login`, і перевірка не побачить маршрут:

   ```ts
   const PUBLIC_PATHS = ["/login", "/auth", "/api/health"];
   ```

3. Локально: `npm run build` (у списку маршрутів — `ƒ /api/health`), `npm run start`, потім у другому терміналі
   `curl.exe -s http://localhost:3000/api/health` → `{"ok":true,"sha":"local","env":"local","db":"ok",…}`.

Що означає відповідь:

| Відповідь | Що це | Що робити |
|---|---|---|
| `200 {"ok":true,"sha":"…","env":"production","db":"ok"}` | усе гаразд | — |
| `"sha":"local"` на проді | Vercel не передає системні змінні (типово передає: у демо preview показав справжній SHA) | Vercel → Settings → Environment Variables → «Automatically expose System Environment Variables» (так пише підказка `smoke.mjs`; точну назву перевірте в інтерфейсі) → Redeploy |
| `503`, `"reason":"invalid-api-key"` | ключ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` у Vercel не від цього проєкту чи ротований | звірте змінні Production у Vercel → Redeploy |
| `503`, `"reason":"paused"` (Supabase відповів кодом 540) | Supabase Free заснув | Supabase Dashboard → **Resume project** |
| `503`, інша причина | мережа, 5xx, PostgREST без бази | `NEXT_PUBLIC_SUPABASE_URL` у Vercel; стан проєкту в Dashboard |
| `307` → `/login` | маршрут не в `PUBLIC_PATHS` | крок 2 вище |
| `404` | маршрут не задеплоєно | файл `src/app/api/health/route.ts` у `main`? |

## 3. `smoke.yml`

Workflow `smoke` перевіряє прод **після** кожного розгортання `main` і щодня: `/` (не стіна входу Vercel, не 404/5xx),
`/login` (200 з полем пароля), `/api/health` (`db` = `ok`, SHA = коміт `main`). Щоденний прогін ще й робить запит до
бази. Supabase каже, що API-запити рахуються як активність, але поріг не називає. Тож Dashboard перед заняттям і
перед прийманням PM однаково відкривайте.

1. Скопіюйте `.github/workflows/smoke.yml` і `scripts/smoke.mjs` з [`materials/d0/`](../materials/README.md#d0-health-і-smoke).
2. **Змінна репо `PROD_URL`** (не секрет): Settings → Secrets and variables → Actions → Variables → New repository
   variable → `PROD_URL` = `https://<проєкт>.vercel.app`. Або `gh variable set PROD_URL --body "https://<проєкт>.vercel.app"`.
   Без неї прогін червоний з підказкою: адреси за замовчуванням немає, щоб smoke не перевіряв чужий прод.
3. Запустіть уручну: Actions → smoke → Run workflow (або `gh workflow run smoke.yml`) і дочекайтеся зеленого прогону.

Що варто знати:

- **Тригери:**
  - `status` — коли Vercel ставить зелений статус на коміт `main` (Vercel ставить цей статус у репо курсу);
  - `repository_dispatch` (`vercel.deployment.success`, лише production) — Vercel документує цю подію, але чи
    приходить вона саме у ваше репо, ми не перевіряли; головний тригер — `status`;
  - `schedule` — щодня;
  - `workflow_dispatch` — уручну.
- `status`, `repository_dispatch` і `schedule` GitHub запускає лише з файлу на гілці за замовчуванням. До злиття
  `smoke.yml` перевіряється тільки локально: `npm run smoke -- <прод-URL>`.
- Очікуваний SHA — щойно розгорнутий коміт; прод-домен перемикається не миттєво, тож скрипт пробує `/api/health` до
  6 разів по 20 с.
- `smoke` — **не** обов'язкова перевірка ruleset-у: він перевіряє прод після злиття, а не PR.
- Кожен статус на кожному коміті (Vercel pending, CodeRabbit) створює в Actions **пропущений** (skipped) прогін
  `smoke`. Це шум, а не збій.
- GitHub може затримати чи пропустити запуск за розкладом під навантаженням. Тож щоденний прогін — підстраховка, а не
  гарантія.
- `deployment_status` не використовуємо: у більшості репо курсу Vercel не створює GitHub Deployments.

## 4. Перевірте самі

```powershell
git fetch origin
$sha = git rev-parse origin/main
npm run smoke -- https://<проєкт>.vercel.app $sha             # 0 — гаразд; 1 — рядки ::error:: пояснюють, що не так
npm ls next                                                   # next@16.4.3
gh run list --workflow smoke.yml --branch main --limit 3      # останній — success
gh run list --workflow ci.yml --branch main --limit 3         # потім: gh run view <id> — крок «Apply migrations» у db-deploy
```

І ще: README починається з прод-URL; About → Website — той самий URL; вікно інкогніто відкриває `/login` без входу
у Vercel.

## Тестові акаунти: accounts.zip

**Навіщо.** PM і автор курсу мають увійти у ваш застосунок під кожною роллю, а UAT — пройти сценарії під цими ролями.
Схема курсу — одна для всіх, щоб нікому не збирати паролі по особистих повідомленнях:

- у корені репо — `accounts.txt` у вільній формі: користувачі, ролі, логіни, паролі;
- `accounts.txt` **завжди** в `.gitignore`;
- комітимо лише `accounts.zip` — архів, зашифрований **AES-256** одним паролем на весь курс;
- пароль архіву оголошено в чаті курсу. **Ніде його не записуйте:** ні в репо, ні в скрипт, ні в issue чи PR, ні в
  промпт агенту, ні в історію терміналу.
- Архів оновлюйте щоразу, коли змінюються акаунти.

Зашифрований `accounts.zip` — це **не** «паролі в репо». А от `accounts.txt` чи будь-який пароль відкритим текстом у
git, зокрема в історії, — витік (див. [нижче](#якщо-accountstxt-потрапив-у-git)).

### Акаунти на проді

- Щонайменше **один акаунт на кожну роль** зрізів 1–2, адреси лише `*@example.test`. Зручно `pm-<роль>@example.test`,
  але назва не важлива.
- Створіть їх на проді так само, як у WS7: рядки в `supabase/demo-users.json` → після злиття `npm run users:demo`
  (пароль — ваш `DEMO_USER_PASSWORD` з `.env.local`, довгий і випадковий). Або запрошенням, якщо ваш зріз запрошує
  користувачів.
- **Пароль архіву курсу не використовуйте як пароль акаунтів.**
- Для UAT у CI (бонус) заведіть окремий акаунт з найменшими правами.

### Що в accounts.txt

Вільна форма. Наприклад (паролі тут — заглушки):

```text
Прод: https://<проєкт>.vercel.app
працівник      pm-employee@example.test   пароль: <ваш пароль>
менеджер       pm-manager@example.test    пароль: <ваш пароль>
адміністратор  pm-admin@example.test      пароль: <ваш пароль>
```

### Спершу — `.gitignore`

```powershell
Add-Content .gitignore "accounts.txt"     # якщо рядка ще немає
git check-ignore -v accounts.txt          # має показати .gitignore:<рядок>:accounts.txt
git ls-files accounts.txt                 # порожньо
git log --all --oneline -- accounts.txt   # порожньо
```

### Шлях 1: 7-Zip (рекомендовано)

Провідник Windows не вміє створювати zip з паролем. `Compress-Archive` і Python `zipfile` не шифрують. 7-Zip без
`-mem=AES256` пише старий слабкий ZipCrypto. Тому лише так:

1. Встановіть 7-Zip: <https://www.7-zip.org/> або `winget install --id 7zip.7zip -e` (id пакета перевірте в
   `winget search 7zip`). macOS: `brew install sevenzip`, команда — `7zz` з тими самими ключами.
2. Створіть архів. `-p` **без значення**: 7-Zip двічі спитає пароль і не покаже його на екрані. Не пишіть пароль
   після `-p`: він лишиться в історії терміналу, а в PowerShell `#` у паролі почне коментар і обріже його.

   ```powershell
   $SevenZip = "C:\Program Files\7-Zip\7z.exe"   # 7z зазвичай не в PATH
   Remove-Item accounts.zip -ErrorAction SilentlyContinue   # оновлюємо — створюємо заново
   & $SevenZip a -tzip -mem=AES256 -p accounts.zip accounts.txt
   ```

3. Перевірте шифрування (пароль не потрібен):

   ```powershell
   & $SevenZip l -slt accounts.zip | Select-String "Encrypted|Method"
   # Encrypted = +   і   Method = AES-256 Deflate   (не ZipCrypto)
   ```

4. **Перевірте, що хибний пароль не відкриває архів:** `& $SevenZip t accounts.zip` → введіть навмисно хибний пароль →
   має бути помилка `Wrong password`. Потім ще раз із правильним → `Everything is Ok`.

### Шлях 2: Node, без 7-Zip

Скрипт [`materials/accounts/zip-accounts.mjs`](../materials/accounts/zip-accounts.mjs) робить те саме на
`@zip.js/zip.js` 2.24.0 (AES-256). Пароль він питає двічі без відлуння, ніде не зберігає, а після запису сам перевіряє
архів: правильний пароль дає той самий вміст, хибний — відмову. Ще скрипт відмовиться працювати, якщо `accounts.txt` не
в `.gitignore` або колись потрапляв у git.

```powershell
$B = "https://raw.githubusercontent.com/koldovsky/2026-quitcode-08-quality-hw/main/materials"
curl.exe -fsSL --create-dirs -o scripts/zip-accounts.mjs "$B/accounts/zip-accounts.mjs"
npm i -D --save-exact @zip.js/zip.js@2.24.0
npm pkg set scripts.accounts:zip="node scripts/zip-accounts.mjs"
npm run accounts:zip                 # створити й перевірити
npm run accounts:zip -- --check      # перевірити ще раз: спершу хибний пароль (відмова), потім правильний
```

Запускайте в PowerShell чи Windows Terminal: у Git Bash (mintty) прихований ввід не працює.

### Шлях 3: з Claude Code

Агент готує все, крім пароля: пароль вводите лише ви, у своєму терміналі. Термінал агента не інтерактивний, тож
команду з `-p` він однаково не виконає.

```text
Допоможи підготувати тестові акаунти за схемою курсу (accounts.zip). Пароля архіву в мене НЕ питай, не приймай і
ніде не записуй. accounts.txt НЕ читай і не виводь його вміст.
1. Перевір, що accounts.txt ігнорується: git check-ignore -v accounts.txt. Якщо ні — додай рядок accounts.txt у
   .gitignore і покажи diff.
2. Перевір, що accounts.txt ніколи не був у git: git ls-files accounts.txt і git log --all --oneline -- accounts.txt
   мають бути порожні. Якщо ні — зупинись і скажи мені: паролі тестових акаунтів треба змінити.
3. Якщо accounts.txt ще немає — створи заготовку з supabase/demo-users.json: рядок на кожен акаунт «роль — email —
   пароль: (впишіть)». Паролів не вигадуй.
4. Знайди 7-Zip ("C:\Program Files\7-Zip\7z.exe" або 7z у PATH). Дай мені ОДНУ команду для PowerShell, яку я виконаю
   сам в окремому терміналі: створити accounts.zip з accounts.txt з ключами -tzip -mem=AES256 -p (-p без значення).
   Сам її не запускай. Якщо 7-Zip немає — запропонуй npm run accounts:zip зі скрипта
   materials/accounts/zip-accounts.mjs домашки WS8 (його теж запускаю я).
5. Коли я напишу «готово», перевір: 7z l -slt accounts.zip показує Encrypted = + і Method з AES-256, а не ZipCrypto;
   git status показує accounts.zip і не показує accounts.txt.
6. Дай мені команду 7z t accounts.zip: я введу навмисно хибний пароль і переконаюся, що архів не відкривається.
7. Підготуй гілку chore/accounts-zip і коміт лише з accounts.zip (і .gitignore, якщо змінено). Push і PR — лише після
   мого «так».
```

### PR і злиття

- Гілка `chore/accounts-zip` → PR → зелений CI → злиття. В описі PR — рядок «D0 WS8: тестові акаунти, `accounts.zip`
  (AES-256, пароль курсу)».
- У чат команди: «Акаунти на проді: ролі …; `accounts.zip` у корені репо, пароль — з чату курсу».

### Якщо accounts.txt потрапив у git

Публічне репо вже роздало ці паролі. Тому:

1. **Змініть паролі всіх тестових акаунтів на проді.** Наприклад, новим `DEMO_USER_PASSWORD` і повторним `npm run
   users:demo`, якщо ваш скрипт оновлює паролі наявних користувачів, або в Supabase Dashboard → Authentication → Users.
2. `git rm --cached accounts.txt`, рядок у `.gitignore`, PR.
3. Новий `accounts.zip` з новими паролями.

Переписувати історію git після зміни паролів не обов'язково: старі паролі вже нічого не відкривають.

### Як відкрити (PM і автор курсу)

Windows — 7-Zip: правою кнопкою на `accounts.zip` → 7-Zip → Extract Here (точну назву перевірте в інтерфейсі) → пароль
курсу. Провідник Windows архів з AES-256 не відкриє. macOS — Keka або `7zz x accounts.zip`. Розпакований
`accounts.txt` нікуди не копіюйте й видаліть після приймання.

## Якщо Supabase заснув

- Free-проєкт засинає після ~7 днів низької активності. Приблизно за тиждень до цього власнику приходить лист.
- Ознака — `/api/health` дає `503` з `"reason":"paused"`, а вхід на проді не працює.
- Що робити: Supabase Dashboard → проєкт → **Resume project** (у README шаблону кнопка названа «Restore project» —
  точну назву перевірте в інтерфейсі). Через кілька хвилин `smoke` → Run workflow.
- Перед заняттям і перед прийманням PM відкрийте Dashboard і переконайтеся, що проєкт активний.

## Чого D0 не вимагає

- `SUPABASE_SECRET_KEY` у GitHub Secrets — не потрібен і не додаємо.
- Перевірку preview-деплоїв і `deployment_status` — ні. Достатньо проду.
- Власного домену — ні, `*.vercel.app` годиться.
