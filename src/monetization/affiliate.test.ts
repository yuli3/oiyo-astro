import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n";
import {
  AFFILIATE_CATEGORIES,
  AFFILIATE_DISCLOSURE_COPY,
  AFFILIATE_LINK_REL,
  AFFILIATE_SCHEMA,
  AFFILIATE_SCHEMA_VERSION,
  buildAffiliateClickEvent,
  findForbiddenClaims,
  isPartnerLive,
  validatePartnerDueDiligence,
  type PartnerDueDiligence,
} from "./affiliate";

function dueDiligence(overrides: Partial<PartnerDueDiligence> = {}): PartnerDueDiligence {
  return validatePartnerDueDiligence({
    category: "books-courses",
    contractStatus: "candidate",
    dataSharedWithPartner: "none",
    disclosurePlacement: "adjacent-to-link",
    exitPlan: "링크 제거로 즉시 종료, 잔여 의무 없음",
    legalName: "Example Books Co.",
    offering: "심리학 입문 도서 시리즈",
    partnerId: "example-books",
    reviewedAt: "2026-07-17T00:00:00.000Z",
    reviewedBy: "seuncho",
    schema: AFFILIATE_SCHEMA,
    schemaVersion: AFFILIATE_SCHEMA_VERSION,
    ...overrides,
  });
}

describe("affiliate foundation (C3 Wave 0)", () => {
  it("only allows low-risk reversible categories into a pilot", () => {
    const allowed = AFFILIATE_CATEGORIES.filter((category) => category.pilotAllowed).map((category) => category.id);
    expect(allowed).toEqual(["books-courses", "hobby-tools"]);
    for (const highRisk of ["tax-legal-leads", "finance-products", "health-services"] as const) {
      expect(AFFILIATE_CATEGORIES.find((category) => category.id === highRisk)?.pilotAllowed).toBe(false);
    }
  });

  it("flags forbidden claims per category and universally", () => {
    expect(findForbiddenClaims("books-courses", "이 책만 읽으면 인생이 바뀝니다")).toHaveLength(1);
    expect(findForbiddenClaims("books-courses", "100% 만족 보장됩니다")).not.toHaveLength(0);
    expect(findForbiddenClaims("finance-products", "고수익 원금 보장")).not.toHaveLength(0);
    expect(findForbiddenClaims("hobby-tools", "취미 생활에 쓸 만한 도구입니다")).toHaveLength(0);
    expect(() => findForbiddenClaims("unknown" as never, "x")).toThrow(/알 수 없는/);
  });

  it("enforces the due-diligence schema: no data sharing, adjacent disclosure, human approval", () => {
    expect(dueDiligence().partnerId).toBe("example-books");
    expect(() => dueDiligence({ dataSharedWithPartner: "emails" as never })).toThrow(/none 고정/);
    expect(() => dueDiligence({ disclosurePlacement: "footer" as never })).toThrow(/링크 인접/);
    expect(() => dueDiligence({ exitPlan: " " })).toThrow(/exitPlan/);
    expect(() => dueDiligence({ reviewedAt: "yesterday" })).toThrow(/reviewedAt/);
    expect(() => dueDiligence({ category: "unknown" as never })).toThrow(/알 수 없는/);

    // live = human approval AND pilot-allowed category, never either alone
    expect(isPartnerLive(dueDiligence())).toBe(false);
    expect(isPartnerLive(dueDiligence({ contractStatus: "approved-by-human" }))).toBe(true);
    expect(
      isPartnerLive(dueDiligence({ category: "tax-legal-leads", contractStatus: "approved-by-human" })),
    ).toBe(false);
  });

  it("keeps the click event payload minimal and free of personal identifiers", () => {
    expect(buildAffiliateClickEvent({ pageKey: "blog:/ko/height-converter", partnerId: "example-books", position: "result-footer" })).toEqual({
      event: "affiliate_click",
      pageKey: "blog:/ko/height-converter",
      partnerId: "example-books",
      position: "result-footer",
      schemaVersion: 1,
    });
    expect(() => buildAffiliateClickEvent({ pageKey: "", partnerId: "x", position: "y" })).toThrow(/pageKey/);
    expect(() =>
      buildAffiliateClickEvent({ pageKey: "a", partnerId: "b", position: "c", userId: "u1" } as never),
    ).toThrow(/식별 필드/);
    expect(() =>
      buildAffiliateClickEvent({ pageKey: "a", partnerId: "b", position: "c", resultScore: 88 } as never),
    ).toThrow(/식별 필드/);
  });

  it("ships disclosure copy for all six locales with sponsored link rel", () => {
    expect(AFFILIATE_LINK_REL).toBe("sponsored nofollow");
    for (const locale of LOCALES) {
      const copy = AFFILIATE_DISCLOSURE_COPY[locale];
      expect(copy.length).toBeGreaterThan(30);
    }
    expect(AFFILIATE_DISCLOSURE_COPY.ko).toContain("수수료");
    expect(AFFILIATE_DISCLOSURE_COPY.ko).toContain("개인 맞춤 조언이 아닙니다");
  });
});
