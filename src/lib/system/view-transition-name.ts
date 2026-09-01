/**
 * A stable `view-transition-name` for a route, so the same subject can be named
 * on both sides of a navigation — a card title on a listing and the heading of
 * the page it opens.
 *
 * Cross-document view transitions match old and new elements **by name**, so the
 * two sides must derive the same string from the same route. Deriving it from
 * the path rather than hand-writing pairs is what keeps ~90 destination pages
 * from having to know they are a transition target.
 *
 * The result must be a CSS custom-ident: letters, digits, hyphens, no leading
 * digit. The `route-` prefix guarantees the leading character and keeps these
 * names from colliding with hand-written ones like `site-header`.
 */
export function routeTransitionName(path: string): string {
  const slug = path
    .replace(/^\/[a-z]{2}(?=\/|$)/, "") // drop the locale segment — the same
    .replace(/[^a-zA-Z0-9]+/g, "-") //     card should morph in every language
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug ? `route-${slug}` : "route-home";
}
