import type { APIRoute } from "astro";
import { datasetCsv } from "../../../lib/reincarnation-dataset";

// /api/reincarnation/weights.csv — CC BY 4.0, see /en/reincarnation-country/data/.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(datasetCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
