---
topic: saju-60gapja
locale: en
title: "The sexagenary cycle: why sixty and not a hundred and twenty"
description: "Ten heavenly stems and twelve earthly branches look like they should give 120 combinations, but the cycle has 60. The reason is the least common multiple and the parity of yin and yang. It is the same structure this site's Saju engine uses."
definition: "The sexagenary cycle is the set of 60 stem-branch pairs formed by advancing ten heavenly stems and twelve earthly branches in step. The least common multiple of 10 and 12 is 60, so the pairing returns to its start on the sixtieth."
updated: 2026-09-03
---

There are ten heavenly stems and twelve earthly branches. Multiplied, that is 120. Yet the cycle has **sixty** terms. This article starts from where that difference comes from.

## 1. Why not 120 — it is a meshing, not a product

Stems and branches are **not combined freely**. Each advances through its own sequence, and they meet at the same position.

```
Stems:    Gap Eul Byeong Jeong Mu Gi Gyeong Sin Im Gye Gap Eul …  (cycle of 10)
Branches: Ja Chuk In Myo Jin Sa O Mi Sin Yu Sul Hae Ja …          (cycle of 12)
           ↓   ↓    ↓
        Gap-Ja  Eul-Chuk  Byeong-In …
```

When two gears mesh, they return to their starting positions together at the **least common multiple** of 10 and 12 — the sixtieth step. 120 is the product of two sets; 60 is where the two cycles meet again.

One consequence follows. **Pairs like Gap-Chuk or Eul-Ja do not exist.** Gap only ever meets branches at even positions (Ja, In, Jin, O, Sin, Sul); Eul only ever meets odd ones.

The reason is that 10 and 12 are both even, so **parity never slips**. Myeongni theory describes this as yin and yang: yang stems (Gap, Byeong, Mu, Gyeong, Im) pair only with yang branches, yin stems only with yin branches. The mathematical fact and the theoretical account point at the same thing.

So of the 120 conceivable pairs, only half — sixty — occur.

## 2. What it is used for

The cycle supplies a stem-branch pair for **all four pillars** of a Saju chart: year, month, day and hour.

- **The year pillar** returns every sixty years. Meeting the pair of your birth year again is *hwangap* — at 61 you encounter the stem-branch you were born under.
- **The month pillar** is set by solar terms. It turns at the entry moment, not on the first of a calendar month.
- **The day pillar** runs unbroken on a 60-day cycle. That continuity is what anchors the calculation.
- **The hour pillar** divides the day into twelve two-hour slots.

The day pillar matters most. Year, month and hour follow calendrical rules, but **the day count works by fixing one reference date and counting from it**. This site's Saju engine uses the same structure.

## 3. The sixty pairs

The table below follows the exact order this site's Saju engine uses. It was not transcribed separately — it is generated from the same data.

| Decade | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gap-Ja | Gap-Ja | Eul-Chuk | Byeong-In | Jeong-Myo | Mu-Jin | Gi-Sa | Gyeong-O | Sin-Mi | Im-Sin | Gye-Yu |
| Gap-Sul | Gap-Sul | Eul-Hae | Byeong-Ja | Jeong-Chuk | Mu-In | Gi-Myo | Gyeong-Jin | Sin-Sa | Im-O | Gye-Mi |
| Gap-Sin | Gap-Sin | Eul-Yu | Byeong-Sul | Jeong-Hae | Mu-Ja | Gi-Chuk | Gyeong-In | Sin-Myo | Im-Jin | Gye-Sa |
| Gap-O | Gap-O | Eul-Mi | Byeong-Sin | Jeong-Yu | Mu-Sul | Gi-Hae | Gyeong-Ja | Sin-Chuk | Im-In | Gye-Myo |
| Gap-Jin | Gap-Jin | Eul-Sa | Byeong-O | Jeong-Mi | Mu-Sin | Gi-Yu | Gyeong-Sul | Sin-Hae | Im-Ja | Gye-Chuk |
| Gap-In | Gap-In | Eul-Myo | Byeong-Jin | Jeong-Sa | Mu-O | Gi-Mi | Gyeong-Sin | Sin-Yu | Im-Sul | Gye-Hae |

## 4. Common misunderstandings

**"The zodiac animal changes on 1 January."** The Saju year pillar turns neither on 1 January nor on Lunar New Year but at **Start of Spring**. So people born in January and in early February can fall on different sides, and the boundary is the entry moment of that solar term, not a date.

**"The day pillar determines personality."** The day pillar is one of four, and even within myeongni it is read against the other three. Taking the day pillar alone as a verdict on character is partial by the standards of that system itself.

**"The cycle is only for Saju."** It is a calendrical instrument. Historical events carry its names — the Gabo Reform (1894), the Imjin War (1592), the Byeongja Manchu invasion (1636). Because names recur every sixty years, historians disambiguate which cycle is meant from context.

## 5. How this site computes it

The Saju engine here does not look the pair up in a table. It **computes by index**: taking the remainder modulo 10 for the stem and modulo 12 for the branch, then pairing them. The table above came out of that same code.

The month-pillar boundary is set by solar longitude — cut every 30° from Start of Spring at 315°. So the reference is an entry moment, not a calendar date.

## References

> **Yi Sun-ji & Kim Dam** (1444) *Chiljeongsan Naepyeon* — the Joseon calendrical treatise computing stem-branch days for the meridian of Hanyang.

> **Korea Astronomy and Space Science Institute (KASI)** — Special Day Information Open API, publishing solar term entry moments; used to check the month-pillar boundary.

> **The Veritable Records of the Joseon Dynasty** — a primary source recording dates and events by stem-branch, showing the cycle in use as a calendrical tool.

> **National Folk Museum of Korea**, *Encyclopedia of Korean Folk Culture* — entries on hwangap and other observances tied to the sexagenary cycle.
