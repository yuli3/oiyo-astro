/** solarlunar 에는 타입 선언이 없다 — 이 저장소가 쓰는 두 함수만 적는다. */
declare module "solarlunar" {
  interface SolarLunarDate {
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
    cYear: number;
    cMonth: number;
    cDay: number;
    [key: string]: unknown;
  }
  const solarlunar: {
    solar2lunar(year: number, month: number, day: number): SolarLunarDate | -1;
    lunar2solar(year: number, month: number, day: number, isLeap?: boolean): SolarLunarDate | -1;
  };
  export default solarlunar;
}
