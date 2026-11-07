import { expect, test, type Page } from "@playwright/test";

const SEED = { email: "demo@songbook.local", password: "songbook-demo" };
const saveStatus = (page: Page) => page.locator("[role=status][aria-live=polite]");

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard");
}

test("anonymous visitors are sent to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
});

test("sign up, write a song with chords, reload, and find it in the library", async ({ page }) => {
  const email = `e2e-${Date.now()}@test.local`;
  await page.goto("/sign-up");
  await page.fill("#name", "E2E Writer");
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard");

  await page.getByRole("button", { name: "New song" }).first().click();
  await page.waitForURL(/\/songs\/[a-z0-9]+$/);

  await page.getByLabel("Song title").fill("Persistence Test");
  await page.getByRole("button", { name: "Verse" }).first().click();
  await page.getByLabel("Verse lyrics").fill("line one\nline two");

  // Chord sketch: add G and C, play, confirm the first chord lights up, stop.
  await page.getByRole("button", { name: "Add chord" }).click();
  await page.getByRole("radio", { name: "G", exact: true }).click();
  await page.getByRole("button", { name: /^Add G$/ }).click();
  await page.getByRole("button", { name: "Add chord" }).click();
  await page.getByRole("button", { name: /^Add C$/ }).click();
  await expect(page.getByRole("list", { name: "Chords" }).getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Play chords" }).click();
  await expect(page.getByRole("button", { name: /^Edit G,/ })).toHaveClass(/text-brand/);
  await page.getByRole("button", { name: "Stop" }).click();

  await expect(saveStatus(page)).toHaveText("Saved", { timeout: 15_000 });

  await page.reload();
  await expect(page.getByLabel("Song title")).toHaveValue("Persistence Test");
  await expect(page.getByLabel("Verse lyrics")).toHaveValue("line one\nline two");
  await expect(page.getByRole("list", { name: "Chords" }).getByRole("listitem")).toHaveCount(2);

  await page.goto("/songs");
  await expect(page.getByText("Persistence Test")).toBeVisible();
});

test("versions: save, restore, and a recovery point", async ({ page }) => {
  await signIn(page, SEED.email, SEED.password);
  await page.goto("/songs");
  await page.getByRole("link", { name: /Paper Boats/ }).first().click();
  await page.waitForURL(/\/songs\//);

  await page.getByRole("button", { name: "Version history" }).click();
  await page.getByRole("button", { name: "Save current version" }).click();
  await page.fill("#version-name", "E2E snapshot");
  await page.getByRole("button", { name: "Save version" }).click();
  await expect(page.getByText("E2E snapshot").first()).toBeVisible();

  await page.getByLabel("Song title").fill("Paper Boats (edited)");
  await expect(saveStatus(page)).toHaveText("Saved", { timeout: 15_000 });

  await page.getByRole("button", { name: "Restore" }).first().click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Restore" }).click();
  await expect(page.getByLabel("Song title")).toHaveValue("Paper Boats");
  await expect(page.getByText("Recovery").first()).toBeVisible();
});

test("a song cannot be opened by another user", async ({ page, browser }) => {
  await signIn(page, SEED.email, SEED.password);
  await page.goto("/songs");
  await page.getByRole("link", { name: /Overpass/ }).first().click();
  await page.waitForURL(/\/songs\//);
  const url = page.url();

  const other = await browser.newContext({ colorScheme: "dark" });
  const otherPage = await other.newPage();
  const email = `e2e-other-${Date.now()}@test.local`;
  await otherPage.goto("/sign-up");
  await otherPage.fill("#email", email);
  await otherPage.fill("#password", "password123");
  await otherPage.click("button[type=submit]");
  await otherPage.waitForURL("**/dashboard");
  await otherPage.goto(url);
  await expect(otherPage.getByText("That song isn't here")).toBeVisible();
  await other.close();
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.fill("#email", SEED.email);
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await expect(page.locator("p[role=alert]")).toHaveText("Invalid email or password");
});
