export function parsePilotJsonLines(text) {
  return text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch {
      throw new Error(`line ${index + 1} is not valid JSON`);
    }
  });
}

export function validatePilotBatchManifest(manifest, instrument) {
  const required = ["assessmentId", "instrumentVersion", "locale", "promptRevision", "administeredFormHashSha256", "consentProtocolVersion", "collectionStart", "collectionEnd"];
  const missing = required.filter((key) => typeof manifest?.[key] !== "string" || !manifest[key]);
  if (missing.length) throw new Error(`batch manifest missing required fields: ${missing.join(", ")}`);
  if (manifest.assessmentId !== instrument.assessmentId) throw new Error("batch manifest assessmentId does not match instrument");
  if (manifest.instrumentVersion !== instrument.instrumentVersion) throw new Error("batch manifest instrumentVersion does not match instrument");
  if (!instrument.allowedLocales.includes(manifest.locale)) throw new Error("batch manifest locale is not allowed");
  const localeVersion = instrument.localeVersions[manifest.locale];
  if (manifest.promptRevision !== localeVersion.promptRevision) throw new Error("batch manifest promptRevision does not match instrument");
  if (manifest.administeredFormHashSha256 !== localeVersion.administeredFormHashSha256) throw new Error("batch manifest administered form hash does not match instrument");
  if (Number.isNaN(Date.parse(manifest.collectionStart)) || Number.isNaN(Date.parse(manifest.collectionEnd))) throw new Error("batch manifest collection dates must be ISO dates");
  if (Date.parse(manifest.collectionStart) > Date.parse(manifest.collectionEnd)) throw new Error("batch manifest collectionStart must not follow collectionEnd");
  return true;
}

export function analyzePilotRows(rows, instrument, batchManifest) {
  validatePilotBatchManifest(batchManifest, instrument);
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("pilot input must contain at least one row");
  const allowedRowKeys = new Set(["locale", "responses"]);
  const allowedLocales = new Set(instrument.allowedLocales);
  const itemIds = new Set(instrument.items.map((item) => item.id));
  const dimensions = [...new Set(instrument.items.map((item) => item.dimension))];
  const { min, max } = instrument.responseScale;

  for (const [rowIndex, row] of rows.entries()) {
    const extraKeys = Object.keys(row).filter((key) => !allowedRowKeys.has(key));
    if (extraKeys.length) throw new Error(`row ${rowIndex + 1} contains disallowed fields: ${extraKeys.join(", ")}`);
    if (!allowedLocales.has(row.locale)) throw new Error(`row ${rowIndex + 1} locale must be one of: ${instrument.allowedLocales.join(", ")}`);
    if (!row.responses || typeof row.responses !== "object" || Array.isArray(row.responses)) throw new Error(`row ${rowIndex + 1} requires responses object`);
    const unknownItems = Object.keys(row.responses).filter((id) => !itemIds.has(id));
    if (unknownItems.length) throw new Error(`row ${rowIndex + 1} contains unknown items: ${unknownItems.join(", ")}`);
    for (const [id, value] of Object.entries(row.responses)) {
      if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`row ${rowIndex + 1} ${id} must be an integer from ${min} to ${max}`);
      }
    }
  }

  const locales = [...new Set(rows.map((row) => row.locale))];
  if (locales.length !== 1) throw new Error("pilot input must contain one locale per pilot file; analyze locales separately");
  if (locales[0] !== batchManifest.locale) throw new Error("pilot row locale does not match batch manifest");

  const result = {
    assessmentId: instrument.assessmentId,
    instrumentVersion: instrument.instrumentVersion,
    locale: locales[0],
    promptRevision: instrument.localeVersions[locales[0]].promptRevision,
    administeredFormHashSha256: instrument.localeVersions[locales[0]].administeredFormHashSha256,
    note: "Input-quality control only. This report does not calculate reliability, validity, norms, cutoffs, comparisons, or release readiness.",
    participants: rows.length,
    dimensions: {},
  };

  for (const dimension of dimensions) {
    const items = instrument.items.filter((item) => item.dimension === dimension);
    const missingByItem = {};
    const responseCountsByItem = {};
    for (const item of items) {
      missingByItem[item.id] = rows.filter((row) => row.responses[item.id] === undefined).length;
      responseCountsByItem[item.id] = Object.fromEntries(
        Array.from({ length: max - min + 1 }, (_, index) => {
          const value = min + index;
          return [String(value), rows.filter((row) => row.responses[item.id] === value).length];
        }),
      );
    }
    result.dimensions[dimension] = {
      completeCases: rows.filter((row) => items.every((item) => row.responses[item.id] !== undefined)).length,
      missingByItem,
      responseCountsByItem,
    };
  }
  return result;
}
