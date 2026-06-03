import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const locales = ["en", "ja", "cn", "es", "fr"];
const sourceLocale = "en";
const messagesDir = path.resolve(process.cwd(), "src/i18n/messages");

/**
 * Recursively gets all keys from an object in dot notation
 */
function getKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      obj[key] !== null
    ) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n completeness", () => {
  const sourceLocalePath = path.join(messagesDir, sourceLocale);

  if (!fs.existsSync(sourceLocalePath)) {
    console.warn(`Source locale directory not found: ${sourceLocalePath}`);
    return;
  }

  const sourceFiles = fs
    .readdirSync(sourceLocalePath)
    .filter((f) => f.endsWith(".json"));

  sourceFiles.forEach((file) => {
    describe(`File: ${file}`, () => {
      let sourceKeys: string[] = [];

      try {
        const sourceContent = JSON.parse(
          fs.readFileSync(path.join(messagesDir, sourceLocale, file), "utf-8"),
        );
        sourceKeys = getKeys(sourceContent);
      } catch (e) {
        it("should have valid source JSON", () => {
          throw new Error(
            `Failed to parse source file ${sourceLocale}/${file}: ${e}`,
          );
        });
        return;
      }

      locales.forEach((locale) => {
        it(`should have all keys in ${locale}`, () => {
          const targetPath = path.join(messagesDir, locale, file);

          if (!fs.existsSync(targetPath)) {
            // Some files might be locale-specific, but generally we want them all synchronized
            expect.fail(`Missing translation file: ${locale}/${file}`);
          }

          let targetKeys: string[] = [];
          try {
            const targetContent = JSON.parse(
              fs.readFileSync(targetPath, "utf-8"),
            );
            targetKeys = getKeys(targetContent);
          } catch (e) {
            expect.fail(`Failed to parse target file ${locale}/${file}: ${e}`);
          }

          const missingKeys = sourceKeys.filter((k) => !targetKeys.includes(k));

          if (missingKeys.length > 0) {
            expect.fail(
              `Missing keys in ${locale}/${file}:\n${missingKeys.slice(0, 10).join("\n")}${missingKeys.length > 10 ? "\n...and " + (missingKeys.length - 10) + " more" : ""}`,
            );
          }
        });
      });
    });
  });
});
