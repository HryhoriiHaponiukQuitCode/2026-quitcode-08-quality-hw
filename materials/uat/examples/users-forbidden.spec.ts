// ЗРАЗОК ФОРМАТУ з демо-репо курсу (тег ws8-03-uat, tests/e2e/users-forbidden.spec.ts). AC, ролі, тексти й адреси — демо-продукту:
// у своє репо як є не копіюйте, пишіть специфікацію за своїм AC. ./support/… — це tests/e2e/support/ з materials/uat.
// AC-USERS-07 — відмова, яку видно в браузері. Лише читання: безпечно на проді.
import { expect, test, type Page } from "@playwright/test";
import { attachRuntimeErrors, given, thenStep, when } from "./support/uat";

test.use({ storageState: "playwright/.auth/teacher.json" });

const MESSAGE = "Список користувачів бачить лише адміністратор.";
const TEACHER = "teacher@example.test";

/** Усі адреси @example.test, які видно на сторінці. */
async function visibleEmails(page: Page): Promise<string[]> {
  const text = await page.locator("body").innerText();
  return [...new Set(text.match(/[\w.+-]+@example\.test/gi) ?? [])];
}

test.afterEach(async ({ page }) => attachRuntimeErrors(page));

test(
  "AC-USERS-07: працівник відкриває список користувачів — головна з «Список користувачів бачить лише адміністратор.», чужих даних не видно",
  { tag: ["@uat"], annotation: { type: "ac", description: "AC-USERS-07" } },
  async ({ page }) => {
    await given("працівник teacher@example.test — у порталі", async () => {
      await page.goto("/");
      await expect(page.getByTestId("user-email")).toHaveText(TEACHER);
    });

    await when("відкриває сторінку списку користувачів за її адресою", async () => {
      await page.goto("/admin/users");
    });

    await thenStep(
      page,
      {
        clause:
          "потрапляє на головну сторінку й бачить повідомлення «Список користувачів бачить лише адміністратор.», а жодного email, ролі чи посади інших користувачів не бачить",
        visible: [
          "головна сторінка порталу (заголовок «Портал відсутностей»)",
          "повідомлення «Список користувачів бачить лише адміністратор.»",
        ],
        hidden: [
          "жодного email, ролі чи посади інших користувачів: на сторінці лише власний email teacher@example.test, таблиці користувачів немає",
        ],
      },
      async () => {
        await expect(page).toHaveURL((url) => url.pathname === "/");
        await expect(page.getByRole("heading", { level: 1, name: "Портал відсутностей" })).toBeVisible();
        await expect(page.getByRole("status").filter({ hasText: MESSAGE })).toHaveText(MESSAGE);
        expect(await visibleEmails(page)).toEqual([TEACHER]);
        await expect(page.getByRole("table")).toHaveCount(0);
      },
    );
  },
);
