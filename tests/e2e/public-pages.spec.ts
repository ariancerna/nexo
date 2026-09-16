import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

for (const route of publicRoutes) {
  test(`${route} renders without runtime or horizontal overflow errors`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response?.ok()).toBeTruthy();
    expect(runtimeErrors).toEqual([]);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test("landing hero fills the viewport and keeps its content over the image", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const hero = page.locator("[data-testid='landing-hero']");
  const image = page.locator("[data-testid='landing-hero-image']");
  const content = page.locator("[data-testid='landing-hero-content']");

  await expect(hero).toBeVisible();
  await expect(image).toBeVisible();
  await expect(content).toBeVisible();

  const [heroBox, imageBox, contentBox] = await Promise.all([
    hero.boundingBox(),
    image.boundingBox(),
    content.boundingBox(),
  ]);

  expect(heroBox).not.toBeNull();
  expect(imageBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(imageBox!.x).toBeCloseTo(heroBox!.x, 0);
  expect(imageBox!.width).toBeCloseTo(heroBox!.width, 0);
  expect(contentBox!.x).toBeGreaterThanOrEqual(heroBox!.x);
  expect(contentBox!.x + contentBox!.width).toBeLessThanOrEqual(heroBox!.x + heroBox!.width + 1);
});

test("login presents a centered form and white provider buttons", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  const card = page.locator("main section > div");
  const googleButton = page.getByRole("button", { name: "Continuar con Google" });
  const microsoftButton = page.getByRole("button", { name: "Continuar con Microsoft" });

  await expect(card).toBeVisible();
  await expect(googleButton).toBeVisible();
  await expect(microsoftButton).toBeVisible();
  await expect(googleButton).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(microsoftButton).toHaveCSS("background-color", "rgb(255, 255, 255)");

  const box = await card.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(Math.min(420, viewport!.width));
});

test("auth screens expose the intended focused flows", async ({ page }) => {
  await page.goto("/register", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Crea tu cuenta en Nexo" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Acepto los términos/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta gratis" })).toBeVisible();

  await page.goto("/forgot-password", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "¿Olvidaste tu contraseña?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar enlace de recuperación" })).toBeVisible();
});

test("password visibility control is accessible", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  const password = page.getByLabel("Contraseña", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "text");
});

test("manifest exposes installable PNG icons", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: "/icons/nexo-icon-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/icons/nexo-icon-512.png", sizes: "512x512" }),
    ]),
  );
});

test("invalid password sign-in returns a friendly error", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");

  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill("invalid-login@nexo.invalid");
  await page.getByLabel("Contraseña", { exact: true }).fill("not-a-real-password");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/\/login\?message=/);
  await expect(page.getByText("No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.")).toBeVisible();
});
