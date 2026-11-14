export type ActionEnergy = 'low' | 'available';
export type ActionMinutes = 1 | 5 | 15;
export type ActionKind = 'pause' | 'clear' | 'start' | 'choose' | 'prepare' | 'reflect';
// WHY 2026-10-28: choices describe current capacity, not a diagnosis or a new test score.
export function nextAction(energy: ActionEnergy, minutes: ActionMinutes): ActionKind {
  if (energy === 'low') return minutes === 1 ? 'pause' : minutes === 5 ? 'clear' : 'reflect';
  return minutes === 1 ? 'choose' : minutes === 5 ? 'start' : 'prepare';
}
