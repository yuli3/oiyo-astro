import type { Locale } from "../../i18n";

// Educational "how does this business make money?" cashflow models.
// Each model is a money-in → business → money-out → net-profit flow, with a
// plain-language insight about the underlying business model. ko/en authored;
// other locales fall back to en until translated.

export type LStr = Partial<Record<Locale, string>>;

export interface CashflowNode {
  label: LStr;
  note?: LStr;
}

export type ModelCategory = "asset" | "service" | "financial" | "attention" | "product";

export interface CashflowModel {
  id: string;
  icon: string;
  category: ModelCategory;
  name: LStr;
  tagline: LStr; // one-line: how it makes money
  revenue: CashflowNode[]; // money in
  costs: CashflowNode[]; // money out
  profit: LStr; // where the net profit / margin comes from
  insight: LStr; // the key business-model lesson
}

export const MODEL_CATEGORIES: Record<ModelCategory, LStr> = {
  asset: { ko: "자산형 — 가진 것을 빌려준다", en: "Asset — rent out what you own" },
  service: { ko: "서비스형 — 시간·전문성을 판다", en: "Service — sell time & expertise" },
  financial: { ko: "금융형 — 돈으로 돈을 번다", en: "Financial — money makes money" },
  attention: { ko: "관심형 — 주목을 모아 판다", en: "Attention — gather and sell attention" },
  product: { ko: "상품형 — 만들거나 사서 판다", en: "Product — make or resell goods" },
};

export const CASHFLOW_MODELS: CashflowModel[] = [
  {
    id: "rental",
    icon: "🏠",
    category: "asset",
    name: { ko: "부동산 임대 (렌트)", en: "Property Rental" },
    tagline: { ko: "가진 공간을 빌려주고 매달 임대료를 받는다", en: "Lend out space you own and collect rent every month" },
    revenue: [
      { label: { ko: "월세·임대료", en: "Monthly rent" }, note: { ko: "가장 큰 고정 수입", en: "the main recurring income" } },
      { label: { ko: "보증금 운용", en: "Deposit / lease income" } },
      { label: { ko: "자산 가치 상승", en: "Asset appreciation" }, note: { ko: "팔 때 실현", en: "realized on sale" } },
    ],
    costs: [
      { label: { ko: "대출 이자", en: "Loan interest" } },
      { label: { ko: "세금·보험·관리비", en: "Tax, insurance, maintenance" } },
      { label: { ko: "공실 손실", en: "Vacancy loss" } },
    ],
    profit: { ko: "임대료 − (이자 + 비용). 레버리지(대출)로 적은 자기자본으로 큰 자산을 굴린다.", en: "Rent − (interest + costs). Leverage lets a small down payment control a big asset." },
    insight: { ko: "핵심은 '공실률'과 '금리'. 빈 기간이 길거나 금리가 오르면 수익이 빠르게 무너진다.", en: "It lives or dies on vacancy rate and interest rates — empty months or rate hikes erode profit fast." },
  },
  {
    id: "academy",
    icon: "📚",
    category: "service",
    name: { ko: "학원 (교육 서비스)", en: "Private Academy" },
    tagline: { ko: "강의·관리라는 서비스를 수강료로 판다", en: "Sell teaching and management as a service via tuition" },
    revenue: [
      { label: { ko: "수강료", en: "Tuition fees" }, note: { ko: "학생 수 × 단가", en: "students × price" } },
      { label: { ko: "교재·부교재", en: "Textbooks & materials" } },
      { label: { ko: "특강·방학 단기반", en: "Special / seasonal courses" } },
    ],
    costs: [
      { label: { ko: "강사 인건비", en: "Instructor salaries" }, note: { ko: "최대 비용", en: "the largest cost" } },
      { label: { ko: "임대료", en: "Rent" } },
      { label: { ko: "마케팅·광고", en: "Marketing" } },
    ],
    profit: { ko: "수강료 − (인건비 + 임대료). 한 강의실에 학생을 더 채울수록 한계이익이 커진다.", en: "Tuition − (salaries + rent). Each extra student in the same room adds almost pure margin." },
    insight: { ko: "'좌석 점유율'이 수익의 열쇠. 같은 고정비로 학생을 더 받으면 이익이 폭발한다.", en: "Seat utilization is everything — filling the same fixed cost with more students multiplies profit." },
  },
  {
    id: "bank",
    icon: "🏦",
    category: "financial",
    name: { ko: "은행", en: "Bank" },
    tagline: { ko: "싸게 빌려서 비싸게 빌려주는 '예대마진'으로 번다", en: "Borrow cheap, lend dear — profit from the interest spread" },
    revenue: [
      { label: { ko: "대출 이자", en: "Loan interest" } },
      { label: { ko: "수수료(이체·카드·환전)", en: "Fees (transfer, card, FX)" } },
      { label: { ko: "투자·자산운용 수익", en: "Investment income" } },
    ],
    costs: [
      { label: { ko: "예금 이자", en: "Deposit interest paid" } },
      { label: { ko: "대손(부실채권)", en: "Loan defaults" } },
      { label: { ko: "인건비·전산·규제비용", en: "Staff, IT, compliance" } },
    ],
    profit: { ko: "받는 이자 − 주는 이자 = 예대마진(NIM). 여기에 수수료가 더해진다.", en: "Interest earned − interest paid = net interest margin (NIM), plus fee income." },
    insight: { ko: "은행은 '신용'과 '리스크 관리'가 상품. 떼이는 돈(대손)을 못 막으면 마진이 사라진다.", en: "A bank's product is trust and risk control — uncontrolled defaults wipe out the spread." },
  },
  {
    id: "youtuber",
    icon: "▶️",
    category: "attention",
    name: { ko: "유튜버", en: "YouTuber" },
    tagline: { ko: "콘텐츠로 시청 시간을 모아 광고·후원으로 바꾼다", en: "Turn watch-time into ad revenue and sponsorships" },
    revenue: [
      { label: { ko: "광고 수익(애드센스)", en: "Ad revenue (AdSense)" } },
      { label: { ko: "브랜드 협찬·PPL", en: "Brand sponsorships" }, note: { ko: "보통 광고보다 큼", en: "often bigger than ads" } },
      { label: { ko: "멤버십·슈퍼챗·굿즈", en: "Memberships, tips, merch" } },
    ],
    costs: [
      { label: { ko: "촬영·편집(시간·외주)", en: "Filming & editing" } },
      { label: { ko: "장비·소프트웨어", en: "Gear & software" } },
      { label: { ko: "세금", en: "Taxes" } },
    ],
    profit: { ko: "수익은 '조회수 × 단가(CPM)'에서 출발하지만, 진짜 돈은 협찬과 자체 상품에서 나온다.", en: "Income starts at views × CPM, but real money comes from sponsorships and own products." },
    insight: { ko: "구독자는 '자산', 조회수는 '현금흐름'. 알고리즘 의존을 줄이려 멤버십·굿즈로 수익을 다각화한다.", en: "Subscribers are the asset, views are the cashflow — diversifying into memberships/merch reduces algorithm risk." },
  },
  {
    id: "influencer",
    icon: "📸",
    category: "attention",
    name: { ko: "인플루언서", en: "Influencer" },
    tagline: { ko: "팔로워의 신뢰를 광고·판매로 전환한다", en: "Convert follower trust into ads and sales" },
    revenue: [
      { label: { ko: "협찬·광고 게시물", en: "Sponsored posts" } },
      { label: { ko: "공동구매·제휴(어필리에이트)", en: "Group buys & affiliate links" } },
      { label: { ko: "자체 브랜드·상품", en: "Own brand / products" }, note: { ko: "마진 가장 큼", en: "highest margin" } },
    ],
    costs: [
      { label: { ko: "콘텐츠 제작비", en: "Content production" } },
      { label: { ko: "샘플·재고(자체 상품 시)", en: "Samples / inventory" } },
      { label: { ko: "세금·수수료", en: "Taxes & fees" } },
    ],
    profit: { ko: "협찬은 즉시 현금, 자체 상품은 큰 마진. 신뢰를 잃으면 두 수익원이 동시에 무너진다.", en: "Sponsorships pay now, own products pay big — but losing trust collapses both at once." },
    insight: { ko: "'신뢰'가 재고다. 과한 광고로 신뢰를 소진하면 팔로워(자산)가 줄어 수익이 마른다.", en: "Trust is the inventory — over-advertising burns it, shrinking the follower asset and the income." },
  },
  {
    id: "cafe",
    icon: "☕",
    category: "product",
    name: { ko: "카페", en: "Cafe" },
    tagline: { ko: "원두·우유를 음료로 바꿔 마진을 붙여 판다", en: "Turn beans and milk into drinks sold at a markup" },
    revenue: [
      { label: { ko: "음료·디저트 판매", en: "Drink & dessert sales" } },
      { label: { ko: "원두·MD 상품", en: "Beans & merch" } },
      { label: { ko: "공간 회전율", en: "Table turnover" } },
    ],
    costs: [
      { label: { ko: "재료비(원가율 약 30%대)", en: "Ingredients (~30% of price)" } },
      { label: { ko: "임대료·인건비", en: "Rent & labor" } },
      { label: { ko: "감가상각(기계·인테리어)", en: "Equipment depreciation" } },
    ],
    profit: { ko: "음료는 원가율이 낮아 마진이 좋지만, 임대료·인건비라는 고정비가 이익을 좌우한다.", en: "Drinks have low ingredient cost, but fixed rent and labor decide whether the margin survives." },
    insight: { ko: "'객단가 × 회전율 vs 고정비'의 싸움. 좌석이 비는 시간을 줄이는 게 핵심.", en: "It's spend-per-customer × turnover vs fixed cost — minimizing empty-seat time wins." },
  },
  {
    id: "saas",
    icon: "💻",
    category: "service",
    name: { ko: "구독 서비스 (SaaS·앱)", en: "Subscription (SaaS / App)" },
    tagline: { ko: "한 번 만든 소프트웨어를 매달 구독료로 판다", en: "Build software once, charge a monthly subscription" },
    revenue: [
      { label: { ko: "월·연 구독료", en: "Monthly / annual subscriptions" }, note: { ko: "반복 매출(MRR)", en: "recurring revenue (MRR)" } },
      { label: { ko: "상위 요금제·부가기능", en: "Upgrades & add-ons" } },
      { label: { ko: "기업(B2B) 계약", en: "Enterprise contracts" } },
    ],
    costs: [
      { label: { ko: "개발·인건비", en: "Development & salaries" } },
      { label: { ko: "서버·인프라", en: "Servers & infra" } },
      { label: { ko: "고객 획득비(마케팅)", en: "Customer acquisition" } },
    ],
    profit: { ko: "추가 사용자당 비용이 거의 0에 가까워, 구독자가 늘수록 이익률이 급격히 좋아진다.", en: "The cost per extra user is near zero, so margins improve sharply as subscribers grow." },
    insight: { ko: "핵심은 '해지율(churn)'. 새로 들어오는 사람보다 나가는 사람이 적어야 복리처럼 성장한다.", en: "Churn is the metric — keep cancellations below new signups and growth compounds." },
  },
  {
    id: "ecommerce",
    icon: "🛒",
    category: "product",
    name: { ko: "온라인 쇼핑몰", en: "Online Store" },
    tagline: { ko: "싸게 떼와서 마진을 붙여 온라인으로 판다", en: "Source goods cheap, sell online at a markup" },
    revenue: [
      { label: { ko: "상품 판매 마진", en: "Product sales margin" } },
      { label: { ko: "배송비·옵션", en: "Shipping & options" } },
      { label: { ko: "재구매·정기배송", en: "Repeat & subscription orders" } },
    ],
    costs: [
      { label: { ko: "매입 원가", en: "Cost of goods" } },
      { label: { ko: "광고비(가장 큰 변수)", en: "Ad spend (the big variable)" } },
      { label: { ko: "물류·반품·결제수수료", en: "Logistics, returns, fees" } },
    ],
    profit: { ko: "판매가 − (원가 + 광고비). 광고비가 마진을 넘으면 팔수록 손해다.", en: "Price − (cost + ad spend). If ad cost exceeds margin, more sales mean more loss." },
    insight: { ko: "'고객획득비(CAC) < 고객생애가치(LTV)'가 생존 조건. 재구매를 못 만들면 광고로 번 손님이 1회용이 된다.", en: "Survival rule: acquisition cost < lifetime value — without repeat buyers, paid customers are one-and-done." },
  },
  {
    id: "franchise",
    icon: "🍔",
    category: "service",
    name: { ko: "프랜차이즈 본사", en: "Franchise HQ" },
    tagline: { ko: "검증된 사업 모델을 빌려주고 로열티를 받는다", en: "License a proven model and collect royalties" },
    revenue: [
      { label: { ko: "가맹비·교육비", en: "Franchise & training fees" } },
      { label: { ko: "로열티(매출 %)", en: "Royalties (% of sales)" } },
      { label: { ko: "물류·식자재 공급 마진", en: "Supply / ingredient margin" }, note: { ko: "실제 큰 수입", en: "often the real income" } },
    ],
    costs: [
      { label: { ko: "브랜드·R&D·마케팅", en: "Brand, R&D, marketing" } },
      { label: { ko: "가맹점 관리·교육", en: "Franchisee support" } },
      { label: { ko: "본사 운영비", en: "HQ operations" } },
    ],
    profit: { ko: "본사는 매장을 직접 운영하지 않고도 가맹점 수에 비례해 공급·로열티로 번다.", en: "HQ earns from supply and royalties scaling with store count — without running shops itself." },
    insight: { ko: "본사의 진짜 상품은 '시스템과 공급망'. 가맹점이 늘수록 본사 이익이 복제되듯 늘어난다.", en: "HQ's real product is the system and supply chain — profit replicates as the store network grows." },
  },
];
