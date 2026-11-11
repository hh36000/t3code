import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { expect } from "e2e";

import { T3_HOME } from "../e2e.config.ts";
import { test, WEB } from "./t3.ts";

test(
  "A thread.fork shortcut forks the thread from its latest response",
  WEB,
  async ({ t3, app, screen, browser }) => {
    const keybindingsPath = join(T3_HOME, "userdata/keybindings.json");
    const rules = JSON.parse(await readFile(keybindingsPath, "utf8")) as Array<unknown>;
    await writeFile(
      keybindingsPath,
      JSON.stringify([...rules, { key: "mod+shift+y", command: "thread.fork" }], null, 2),
    );

    const project = await t3.project("demo", { "src/math.ts": "export const sum = 1 + 1;\n" });
    await t3.thread({ project, title: "Release notes", messages: ["Start", "Continue"] });
    await t3.open();

    await screen.getByRole("button", "Release notes, Done, demo").tap();
    await expect(screen.getByText("Continue").first()).toBeVisible();
    await app.screenshot("before-shortcut");

    await browser.keyboard.press(process.platform === "darwin" ? "Meta+Shift+Y" : "Control+Shift+Y");
    await expect(screen.getByText("Release notes fork").first()).toBeVisible();
    await app.screenshot("after-shortcut");
  },
);
