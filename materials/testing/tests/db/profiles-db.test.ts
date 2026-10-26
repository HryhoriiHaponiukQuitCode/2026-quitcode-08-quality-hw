// Перевірка PGlite-гарнесу на таблиці profiles шаблону курсу (міграція 20261012000000_profiles_and_roles.sql)
// і ціль мутантів P1/P2 у scripts/mutants.mjs. Це НЕ доказ ваших AC: назви без AC ID, ac:coverage їх не рахує.
// Ваші тести бази — поруч, назва починається з AC ID. Якщо ви змінили profiles чи ролі й тест не підходить —
// підправте його або видаліть разом із P1/P2.
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "./supabase-pglite";

let t: TestDb;
let someone: string;
let nonAdmin: string;

beforeAll(async () => {
  t = await createTestDb();
  someone = Object.values(t.users)[0];
  const profiles = await t.asService<{ id: string; role: string }>("select id, role from public.profiles order by id");
  nonAdmin = profiles.filter((p) => p.role !== "admin")[0].id;
}, 60_000);

describe("profiles (перевірка гарнесу)", () => {
  it("користувач змінює власне ім'я", async () => {
    await t.asUser(someone, "update public.profiles set full_name = 'Нове Ім''я' where id = $1", [someone]);
    const rows = await t.asService<{ full_name: string }>("select full_name from public.profiles where id = $1", [someone]);
    expect(rows).toEqual([{ full_name: "Нове Ім'я" }]);
  });

  it("користувач не може змінити собі роль: grant update лише на full_name", async () => {
    await expect(
      t.asUser(someone, "update public.profiles set role = 'admin' where id = $1", [someone]),
    ).rejects.toThrow(/permission denied/);
  });

  it("користувач без ролі admin бачить лише власний профіль", async () => {
    const rows = await t.asUser<{ id: string }>(nonAdmin, "select id from public.profiles");
    expect(rows).toEqual([{ id: nonAdmin }]);
  });

  it("без входу профілів не прочитати", async () => {
    await expect(t.asAnon("select id from public.profiles")).rejects.toThrow(/permission denied/);
  });
});
