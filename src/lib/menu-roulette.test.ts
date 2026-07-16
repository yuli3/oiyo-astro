import { describe, expect, it } from 'vitest';
import {
  filterMenuOptions,
  pickMenuOption,
  pushRecentResult,
  type MenuOption,
} from './menu-roulette';

const menus: MenuOption[] = [
  { id: 'soup', cuisine: 'korean', meals: ['lunch', 'dinner'], seasons: ['winter'], weather: ['cold'] },
  { id: 'noodles', cuisine: 'korean', meals: ['lunch'], seasons: ['summer'], weather: ['hot'] },
  { id: 'cake', cuisine: 'cafe', meals: ['cafe'] },
];

describe('menu roulette', () => {
  it('combines meal, cuisine, season, and weather filters', () => {
    expect(filterMenuOptions(menus, {
      meal: 'lunch', cuisine: 'korean', season: 'winter', weather: 'cold',
    }).map((menu) => menu.id)).toEqual(['soup']);
  });

  it('treats missing season and weather tags as suitable year-round', () => {
    expect(filterMenuOptions(menus, {
      meal: 'cafe', cuisine: '', season: 'spring', weather: 'rainy',
    }).map((menu) => menu.id)).toEqual(['cake']);
  });

  it('avoids recent results while another candidate is available', () => {
    expect(pickMenuOption(menus, ['soup', 'noodles'], () => 0)?.id).toBe('cake');
  });

  it('falls back to the full pool when every candidate is recent', () => {
    expect(pickMenuOption([menus[0]], ['soup'], () => 0)?.id).toBe('soup');
    expect(pickMenuOption([], [], () => 0)).toBeNull();
  });

  it('keeps a unique, bounded recent-result queue', () => {
    expect(pushRecentResult(['b', 'a', 'c'], 'a', 3)).toEqual(['a', 'b', 'c']);
    expect(pushRecentResult(['b', 'c', 'd'], 'a', 3)).toEqual(['a', 'b', 'c']);
  });
});
