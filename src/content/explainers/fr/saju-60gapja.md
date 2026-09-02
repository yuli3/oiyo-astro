---
topic: saju-60gapja
locale: fr
title: "Le cycle sexagésimal : pourquoi soixante et non cent vingt"
description: "Dix troncs célestes et douze branches terrestres semblent devoir donner 120 combinaisons, mais le cycle en compte 60. La raison tient au plus petit commun multiple et à la parité du yin et du yang. C'est la structure qu'emploie le moteur Saju de ce site."
definition: "Le cycle sexagésimal est l'ensemble des 60 paires tronc-branche formées en faisant avancer de concert dix troncs célestes et douze branches terrestres. Le PPCM de 10 et 12 valant 60, l'appariement revient à son point de départ au soixantième rang."
updated: 2026-09-03
---

Dix troncs célestes, douze branches terrestres. Multipliés, cela fait 120. Or le cycle compte **soixante** termes. Cet article part de cet écart.

## 1. Pourquoi pas 120 — c'est un engrènement, pas un produit

Troncs et branches ne se combinent **pas librement**. Chacun avance dans sa propre séquence, et ils se rencontrent au même rang.

```
Troncs :  Gap Eul Byeong Jeong Mu Gi Gyeong Sin Im Gye Gap Eul …  (cycle de 10)
Branches: Ja Chuk In Myo Jin Sa O Mi Sin Yu Sul Hae Ja …          (cycle de 12)
           ↓   ↓    ↓
        Gap-Ja  Eul-Chuk  Byeong-In …
```

Quand deux engrenages tournent ensemble, ils reviennent simultanément à leur position initiale au **plus petit commun multiple** de 10 et 12 — au soixantième pas. 120 est le produit de deux ensembles ; 60 est le point où les deux cycles se retrouvent.

Une conséquence en découle. **Des paires comme Gap-Chuk ou Eul-Ja n'existent pas.** Gap ne rencontre jamais que des branches de rang pair (Ja, In, Jin, O, Sin, Sul) ; Eul, jamais que des rangs impairs.

La raison est que 10 et 12 sont tous deux pairs : **la parité ne glisse jamais**. La théorie myeongni le dit en termes de yin et de yang — les troncs yang (Gap, Byeong, Mu, Gyeong, Im) ne s'apparient qu'à des branches yang, les troncs yin qu'à des branches yin. Le fait mathématique et l'explication théorique désignent la même chose.

Des 120 paires concevables, la moitié seulement — soixante — se produisent.

## 2. À quoi cela sert

Le cycle fournit une paire tronc-branche pour **les quatre piliers** d'un thème Saju : année, mois, jour et heure.

- **Le pilier de l'année** revient tous les soixante ans. Retrouver la paire de son année de naissance, c'est le *hwangap* : à 61 ans on rencontre à nouveau son tronc-branche natal.
- **Le pilier du mois** est fixé par les termes solaires. Il tourne à l'instant d'entrée, non au premier du mois civil.
- **Le pilier du jour** court sans interruption sur un cycle de 60 jours. Cette continuité sert d'ancrage au calcul.
- **Le pilier de l'heure** divise la journée en douze tranches de deux heures.

Le pilier du jour compte le plus. Année, mois et heure suivent des règles calendaires, mais **le compte des jours fixe une date de référence et compte à partir d'elle**. Le moteur Saju de ce site emploie la même structure.

## 3. Les soixante paires

Le tableau ci-dessous suit exactement l'ordre qu'emploie le moteur Saju de ce site. Il n'a pas été recopié : il est généré à partir des mêmes données.

| Décade | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gap-Ja | Gap-Ja | Eul-Chuk | Byeong-In | Jeong-Myo | Mu-Jin | Gi-Sa | Gyeong-O | Sin-Mi | Im-Sin | Gye-Yu |
| Gap-Sul | Gap-Sul | Eul-Hae | Byeong-Ja | Jeong-Chuk | Mu-In | Gi-Myo | Gyeong-Jin | Sin-Sa | Im-O | Gye-Mi |
| Gap-Sin | Gap-Sin | Eul-Yu | Byeong-Sul | Jeong-Hae | Mu-Ja | Gi-Chuk | Gyeong-In | Sin-Myo | Im-Jin | Gye-Sa |
| Gap-O | Gap-O | Eul-Mi | Byeong-Sin | Jeong-Yu | Mu-Sul | Gi-Hae | Gyeong-Ja | Sin-Chuk | Im-In | Gye-Myo |
| Gap-Jin | Gap-Jin | Eul-Sa | Byeong-O | Jeong-Mi | Mu-Sin | Gi-Yu | Gyeong-Sul | Sin-Hae | Im-Ja | Gye-Chuk |
| Gap-In | Gap-In | Eul-Myo | Byeong-Jin | Jeong-Sa | Mu-O | Gi-Mi | Gyeong-Sin | Sin-Yu | Im-Sul | Gye-Hae |

## 4. Malentendus courants

**« L'animal du zodiaque change le 1er janvier. »** Le pilier de l'année Saju ne tourne ni au 1er janvier ni au Nouvel An lunaire, mais au **Début du printemps**. Une naissance en janvier et une début février peuvent donc tomber de part et d'autre, et la limite est l'instant d'entrée du terme solaire, non une date.

**« Le pilier du jour détermine la personnalité. »** Il n'est qu'un pilier sur quatre et, même en myeongni, il se lit avec les trois autres. Isoler le pilier du jour pour trancher d'un caractère est partiel selon les critères de ce système lui-même.

**« Le cycle ne sert qu'au Saju. »** C'est un instrument calendaire. Des événements historiques en portent les noms : la réforme Gabo (1894), la guerre d'Imjin (1592), l'invasion mandchoue de Byeongja (1636). Les noms revenant tous les soixante ans, les historiens tranchent par le contexte de quel cycle il s'agit.

## 5. Comment ce site le calcule

Le moteur Saju ne va pas chercher la paire dans une table. Il **calcule par indice** : reste modulo 10 pour le tronc, modulo 12 pour la branche, puis appariement. Le tableau ci-dessus est sorti de ce même code.

La limite du pilier du mois est fixée par la longitude solaire — découpée tous les 30° à partir du Début du printemps à 315°. La référence est donc un instant d'entrée, non une date de calendrier.

## Références

> **Yi Sun-ji et Kim Dam** (1444) *Chiljeongsan Naepyeon* — traité calendaire de Joseon calculant les jours tronc-branche pour le méridien de Hanyang.

> **Korea Astronomy and Space Science Institute (KASI)** — API ouverte Special Day Information, publiant les instants d'entrée des termes solaires ; sert à vérifier la limite du pilier du mois.

> **Les Annales véridiques de la dynastie Joseon** — source primaire consignant dates et événements par tronc-branche, le cycle à l'œuvre comme outil calendaire.

> **Musée national du folklore de Corée**, *Encyclopédie de la culture populaire coréenne* — entrées sur le hwangap et autres usages liés au cycle sexagésimal.
