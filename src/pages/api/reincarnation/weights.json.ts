import type { APIRoute } from "astro";
import { DATASET_AS_OF, DATASET_CITATION, DATASET_LICENSE, DATASET_SOURCES, datasetRows } from "../../../lib/reincarnation-dataset";

// /api/reincarnation/weights.json — same rows as the CSV and the table page.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: "Reincarnation country weights",
        license: DATASET_LICENSE,
        citation: DATASET_CITATION,
        sources: DATASET_SOURCES,
        asOf: DATASET_AS_OF,
        rows: datasetRows(),
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } },
  );
