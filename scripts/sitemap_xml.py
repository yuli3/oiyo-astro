"""Network-free sitemap traversal shared by submission adapters."""
import xml.etree.ElementTree as ET


def collect_sitemap_urls(url, load_xml, on_error, visited=None):
    # WHY 2026-11-05: injected IO preserves each site's credential/network policy.
    # This core must never discover credentials, fetch, or submit URLs itself.
    if visited is None:
        visited = set()
    if url in visited:
        return []
    visited.add(url)
    try:
        root = ET.fromstring(load_xml(url))
    except Exception as exc:
        on_error(url, exc)
        return []
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    urls = []
    if root.tag.split('}')[-1] == 'sitemapindex':
        for entry in root.findall(f'{{{ns}}}sitemap'):
            loc = entry.findtext(f'{{{ns}}}loc')
            if loc:
                urls.extend(collect_sitemap_urls(loc.strip(), load_xml, on_error, visited))
    else:
        for entry in root.findall(f'{{{ns}}}url'):
            loc = entry.findtext(f'{{{ns}}}loc')
            if loc:
                urls.append(loc.strip())
    return urls
