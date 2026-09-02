---
topic: saju-60gapja
locale: es
title: "El ciclo sexagesimal: por qué sesenta y no ciento veinte"
description: "Diez troncos celestes y doce ramas terrestres parecen dar 120 combinaciones, pero el ciclo tiene 60. La razón está en el mínimo común múltiplo y en la paridad de yin y yang. Es la misma estructura que usa el motor de Saju de este sitio."
definition: "El ciclo sexagesimal es el conjunto de 60 pares tronco-rama que se forman al avanzar a la vez diez troncos celestes y doce ramas terrestres. El mínimo común múltiplo de 10 y 12 es 60, así que el emparejamiento vuelve al inicio en el sexagésimo."
updated: 2026-09-03
---

Diez troncos celestes y doce ramas terrestres. Multiplicados, 120. Y sin embargo el ciclo tiene **sesenta** términos. Este artículo empieza por esa diferencia.

## 1. Por qué no 120: es un engranaje, no un producto

Troncos y ramas **no se combinan libremente**. Cada uno avanza por su propia secuencia y se encuentran en la misma posición.

```
Troncos: Gap Eul Byeong Jeong Mu Gi Gyeong Sin Im Gye Gap Eul …  (ciclo de 10)
Ramas:   Ja Chuk In Myo Jin Sa O Mi Sin Yu Sul Hae Ja …          (ciclo de 12)
          ↓   ↓    ↓
       Gap-Ja  Eul-Chuk  Byeong-In …
```

Cuando dos engranajes encajan, vuelven juntos a su posición inicial en el **mínimo común múltiplo** de 10 y 12: el paso sesenta. 120 es el producto de dos conjuntos; 60 es donde ambos ciclos vuelven a coincidir.

De ahí se sigue algo: **pares como Gap-Chuk o Eul-Ja no existen.** Gap solo se encuentra con ramas en posición par (Ja, In, Jin, O, Sin, Sul); Eul, solo con impares.

La razón es que 10 y 12 son ambos pares, así que **la paridad nunca se desplaza**. La teoría myeongni lo dice en términos de yin y yang: los troncos yang (Gap, Byeong, Mu, Gyeong, Im) solo se emparejan con ramas yang, y los yin solo con ramas yin. El hecho matemático y la explicación teórica señalan lo mismo.

De los 120 pares concebibles, solo la mitad —sesenta— ocurren.

## 2. Para qué se usa

El ciclo aporta un par tronco-rama a **los cuatro pilares** de una carta de Saju: año, mes, día y hora.

- **El pilar del año** vuelve cada sesenta años. Reencontrar el par del año de nacimiento es el *hwangap*: a los 61 se vuelve a encontrar el tronco-rama natal.
- **El pilar del mes** lo fijan los términos solares. Gira en el instante de entrada, no el día uno del mes civil.
- **El pilar del día** corre sin interrupción en un ciclo de 60 días. Esa continuidad es lo que ancla el cálculo.
- **El pilar de la hora** divide el día en doce tramos de dos horas.

El pilar del día es el que más pesa. Año, mes y hora siguen reglas calendáricas, pero **la cuenta de los días fija una fecha de referencia y cuenta desde ella**. El motor de Saju de este sitio usa la misma estructura.

## 3. Los sesenta pares

La tabla siguiente sigue exactamente el orden que usa el motor de Saju de este sitio. No se transcribió aparte: se generó a partir de los mismos datos.

| Década | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gap-Ja | Gap-Ja | Eul-Chuk | Byeong-In | Jeong-Myo | Mu-Jin | Gi-Sa | Gyeong-O | Sin-Mi | Im-Sin | Gye-Yu |
| Gap-Sul | Gap-Sul | Eul-Hae | Byeong-Ja | Jeong-Chuk | Mu-In | Gi-Myo | Gyeong-Jin | Sin-Sa | Im-O | Gye-Mi |
| Gap-Sin | Gap-Sin | Eul-Yu | Byeong-Sul | Jeong-Hae | Mu-Ja | Gi-Chuk | Gyeong-In | Sin-Myo | Im-Jin | Gye-Sa |
| Gap-O | Gap-O | Eul-Mi | Byeong-Sin | Jeong-Yu | Mu-Sul | Gi-Hae | Gyeong-Ja | Sin-Chuk | Im-In | Gye-Myo |
| Gap-Jin | Gap-Jin | Eul-Sa | Byeong-O | Jeong-Mi | Mu-Sin | Gi-Yu | Gyeong-Sul | Sin-Hae | Im-Ja | Gye-Chuk |
| Gap-In | Gap-In | Eul-Myo | Byeong-Jin | Jeong-Sa | Mu-O | Gi-Mi | Gyeong-Sin | Sin-Yu | Im-Sul | Gye-Hae |

## 4. Malentendidos frecuentes

**«El animal del zodiaco cambia el 1 de enero.»** El pilar del año no gira ni el 1 de enero ni en el Año Nuevo lunar, sino en el **Comienzo de la primavera**. Así que un nacimiento en enero y otro a primeros de febrero pueden caer a lados distintos, y el límite es el instante de entrada del término solar, no una fecha.

**«El pilar del día determina la personalidad.»** Es uno de cuatro y, aun dentro del myeongni, se lee junto a los otros tres. Aislar el pilar del día para dictaminar un carácter es parcial según los criterios del propio sistema.

**«El ciclo solo sirve para el Saju.»** Es un instrumento calendárico. Hay sucesos históricos que llevan sus nombres: la reforma Gabo (1894), la guerra de Imjin (1592), la invasión manchú de Byeongja (1636). Como los nombres reaparecen cada sesenta años, los historiadores deciden por el contexto de qué ciclo se habla.

## 5. Cómo lo calcula este sitio

El motor de Saju no busca el par en una tabla. **Calcula por índice**: resto módulo 10 para el tronco, módulo 12 para la rama, y luego los empareja. La tabla de arriba salió de ese mismo código.

El límite del pilar del mes lo fija la longitud solar, cortada cada 30° desde el Comienzo de la primavera en 315°. La referencia es, pues, un instante de entrada y no una fecha del calendario.

## Referencias

> **Yi Sun-ji y Kim Dam** (1444) *Chiljeongsan Naepyeon* — tratado calendárico de Joseon que calculaba los días tronco-rama para el meridiano de Hanyang.

> **Korea Astronomy and Space Science Institute (KASI)** — API abierta Special Day Information, que publica los instantes de entrada de los términos solares; sirve para comprobar el límite del pilar del mes.

> **Anales Veraces de la Dinastía Joseon** — fuente primaria que registra fechas y sucesos por tronco-rama: el ciclo en uso como herramienta calendárica.

> **Museo Nacional del Folclore de Corea**, *Enciclopedia de la cultura popular coreana* — entradas sobre el hwangap y otros usos ligados al ciclo sexagesimal.
