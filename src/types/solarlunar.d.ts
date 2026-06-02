declare module "solarlunar" {
  export function lunar2solar(
    y: number,
    m: number,
    d: number,
    isLeap?: boolean,
  ): {
    cDay: number;
    cMonth: number;
    cYear: number;
  };
  export function solar2lunar(
    y: number,
    m: number,
    d: number,
  ): {
    animal: string;
    cDay: number;
    cMonth: number;
    cYear: number;
    dayCn: string;
    gzDay: string;
    gzMonth: string;
    gzYear: string;
    isLeap: boolean;
    isTerm: boolean;
    isToday: boolean;
    lDay: number;
    lMonth: number;
    lYear: number;
    monthCn: string;
    ncWeek: string;
    nWeek: number;
    term: string;
  };
}
