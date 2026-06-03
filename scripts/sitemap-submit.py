#!/usr/bin/env python3
"""
sitemap-submit.py — Automated sitemap & URL submission to Google and Bing

Supports three submission methods:
  1. Google Search Console API  — sitemap-level submission (requires service account)
  2. Bing Webmaster API         — sitemap-level submission (requires API key)
  3. IndexNow                  — URL-level submission to Bing, Yandex, Naver (requires key)

Usage:
  python scripts/sitemap-submit.py                  # all methods
  python scripts/sitemap-submit.py --google          # Google only
  python scripts/sitemap-submit.py --bing            # Bing Webmaster only
  python scripts/sitemap-submit.py --indexnow        # IndexNow only
  python scripts/sitemap-submit.py --dry-run         # show what would be submitted

Environment variables (or .env file):
  GOOGLE_APPLICATION_CREDENTIALS  path to service account JSON
  BING_WEBMASTER_API_KEY           Bing Webmaster Tools API key
  INDEXNOW_API_KEY                 IndexNow key (generate at https://www.indexnow.org/signup)
"""

import argparse
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env.local")
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build as google_build
    HAS_GOOGLE_CLIENT = True
except ImportError:
    HAS_GOOGLE_CLIENT = False

SITE_URL = "https://oiyo.net"
SITEMAP_INDEX_URL = "https://oiyo.net/sitemap-index.xml"
SITEMAPS = [
    "https://oiyo.net/sitemap-index.xml",
]


def log(msg: str, level: str = "INFO") -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    symbols = {"INFO": "→", "OK": "✓", "WARN": "!", "ERR": "✗"}
    print(f"[{ts}] {symbols.get(level, '·')} {msg}")


def parse_sitemap(url: str, visited: set | None = None) -> list[str]:
    if visited is None:
        visited = set()
    if url in visited:
        return []
    visited.add(url)

    urls: list[str] = []
    try:
        resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as exc:
        log(f"Cannot fetch {url}: {exc}", "WARN")
        return urls

    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    tag = root.tag.split("}")[-1] if "}" in root.tag else root.tag

    if tag == "sitemapindex":
        for sitemap in root.findall(f"{{{ns}}}sitemap"):
            loc = sitemap.findtext(f"{{{ns}}}loc")
            if loc:
                urls.extend(parse_sitemap(loc.strip(), visited))
    else:
        for url_elem in root.findall(f"{{{ns}}}url"):
            loc = url_elem.findtext(f"{{{ns}}}loc")
            if loc:
                urls.append(loc.strip())

    return urls


def submit_google_gsc(site_url: str, sitemap_url: str, credentials_path: Optional[str] = None, dry_run: bool = False) -> dict:
    if not HAS_GOOGLE_CLIENT:
        return {"status": "skip", "reason": "google-api-python-client not installed. Run: pip install google-api-python-client google-auth"}

    json_content = os.environ.get("GSC_SERVICE_ACCOUNT_JSON")
    creds_path = credentials_path or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    if not json_content and (not creds_path or not Path(creds_path).exists()):
        return {"status": "skip", "reason": "Set GSC_SERVICE_ACCOUNT_JSON (CI) or GOOGLE_APPLICATION_CREDENTIALS (local)"}

    if dry_run:
        return {"status": "dry-run", "would_submit": sitemap_url, "to": "Google Search Console"}

    try:
        if json_content:
            import json as _json
            info = _json.loads(json_content)
            creds = service_account.Credentials.from_service_account_info(info, scopes=["https://www.googleapis.com/auth/webmasters"])
        else:
            creds = service_account.Credentials.from_service_account_file(creds_path, scopes=["https://www.googleapis.com/auth/webmasters"])
        service = google_build("webmasters", "v3", credentials=creds)
        service.sitemaps().submit(siteUrl=site_url, feedpath=sitemap_url).execute()
        return {"status": "ok", "submitted": sitemap_url}
    except Exception as exc:
        return {"status": "error", "reason": str(exc)}


def submit_bing_webmaster(site_url: str, sitemap_url: str, api_key: Optional[str] = None, dry_run: bool = False) -> dict:
    key = api_key or os.environ.get("BING_WEBMASTER_API_KEY")
    if not key:
        return {"status": "skip", "reason": "BING_WEBMASTER_API_KEY not set"}

    if dry_run:
        return {"status": "dry-run", "would_submit": sitemap_url, "to": "Bing Webmaster"}

    endpoint = "https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap"
    try:
        resp = requests.post(endpoint, params={"apikey": key}, json={"siteUrl": site_url, "sitemap": sitemap_url}, timeout=15)
        if resp.status_code == 200:
            return {"status": "ok", "submitted": sitemap_url}
        return {"status": "error", "http": resp.status_code, "body": resp.text[:200]}
    except Exception as exc:
        return {"status": "error", "reason": str(exc)}


INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"
INDEXNOW_BATCH_SIZE = 10_000


def submit_indexnow(site_url: str, urls: list[str], api_key: Optional[str] = None, dry_run: bool = False) -> dict:
    key = api_key or os.environ.get("INDEXNOW_API_KEY")
    if not key:
        return {"status": "skip", "reason": "INDEXNOW_API_KEY not set"}
    if not urls:
        return {"status": "skip", "reason": "No URLs to submit"}

    host = site_url.replace("https://", "").replace("http://", "").rstrip("/")
    key_location = f"{site_url}/{key}.txt"

    if dry_run:
        return {"status": "dry-run", "would_submit": f"{len(urls)} URLs", "to": "IndexNow", "key_location": key_location}

    results = []
    for i in range(0, len(urls), INDEXNOW_BATCH_SIZE):
        batch = urls[i: i + INDEXNOW_BATCH_SIZE]
        payload = {"host": host, "key": key, "keyLocation": key_location, "urlList": batch}
        try:
            resp = requests.post(INDEXNOW_ENDPOINT, json=payload, headers={"Content-Type": "application/json; charset=utf-8"}, timeout=30)
            results.append({"batch_start": i, "count": len(batch), "http": resp.status_code, "ok": resp.status_code in (200, 202)})
            if i + INDEXNOW_BATCH_SIZE < len(urls):
                time.sleep(1)
        except Exception as exc:
            results.append({"batch_start": i, "error": str(exc)})

    total_ok = sum(r.get("count", 0) for r in results if r.get("ok"))
    return {"status": "ok" if total_ok else "error", "submitted": total_ok, "total": len(urls), "batches": results}


def main() -> int:
    parser = argparse.ArgumentParser(description="Submit sitemaps/URLs to Google and Bing search engines")
    parser.add_argument("--google", action="store_true")
    parser.add_argument("--bing", action="store_true")
    parser.add_argument("--indexnow", action="store_true")
    parser.add_argument("--sitemap", default=SITEMAP_INDEX_URL)
    parser.add_argument("--site", default=SITE_URL)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", action="store_true", dest="json_out")
    args = parser.parse_args()

    run_all = not (args.google or args.bing or args.indexnow)

    print(f"\n{'='*60}")
    print(f"  Sitemap Submission — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Site    : {args.site}")
    print(f"  Sitemap : {args.sitemap}")
    if args.dry_run:
        print(f"  Mode    : DRY RUN (no requests will be made)")
    print(f"{'='*60}\n")

    all_results: dict = {}

    if run_all or args.google:
        log("Google Search Console...")
        result = submit_google_gsc(args.site, args.sitemap, dry_run=args.dry_run)
        all_results["google"] = result
        level = "OK" if result["status"] == "ok" else ("WARN" if result["status"] in ("skip", "dry-run") else "ERR")
        log(f"Google GSC: {result}", level)

    if run_all or args.bing:
        log("Bing Webmaster API...")
        result = submit_bing_webmaster(args.site, args.sitemap, dry_run=args.dry_run)
        all_results["bing"] = result
        level = "OK" if result["status"] == "ok" else ("WARN" if result["status"] in ("skip", "dry-run") else "ERR")
        log(f"Bing Webmaster: {result}", level)

    if run_all or args.indexnow:
        log("Parsing sitemap to collect URLs for IndexNow...")
        if args.dry_run:
            urls = ["(dry-run: sitemap not fetched)"]
        else:
            urls = parse_sitemap(args.sitemap)
            log(f"Found {len(urls):,} URLs in sitemap", "OK")

        log("Submitting via IndexNow...")
        result = submit_indexnow(args.site, urls, dry_run=args.dry_run)
        all_results["indexnow"] = result
        level = "OK" if result.get("status") == "ok" else ("WARN" if result.get("status") in ("skip", "dry-run") else "ERR")
        log(f"IndexNow: {result}", level)

    print()
    if args.json_out:
        print(json.dumps(all_results, indent=2, ensure_ascii=False))

    fatal_errors = [k for k, v in all_results.items() if isinstance(v, dict) and v.get("status") == "error" and k != "bing"]
    all_errors = [k for k, v in all_results.items() if isinstance(v, dict) and v.get("status") == "error"]
    if all_errors:
        log(f"Submission errors (bing is non-fatal): {all_errors}", "WARN")
    if fatal_errors:
        return 1

    log("All submissions complete.", "OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
