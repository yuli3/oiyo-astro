import { useState, useEffect, useCallback, useRef } from 'react';
import type { Locale } from '../../i18n';

/**
 * Pranayama (yoga breathing) guide. A curated library of traditional yogic
 * breathing techniques, each with a guided animated pacer plus step-by-step
 * instructions, benefits and cautions. Distinct from the clinical
 * /breathing/timer — this is the yoga-tradition counterpart.
 */

interface Props { locale: Locale; }

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';
type L<T> = Partial<Record<Locale, T>>;

interface Technique {
  id: string;
  sanskrit: string;          // Sanskrit / romanized (locale-neutral)
  name: L<string>;           // common name
  level: L<string>;
  benefit: L<string>;
  steps: L<string[]>;
  caution?: L<string>;
  inhale: number; holdIn: number; exhale: number; holdOut: number;
  // optional short cue shown during inhale / exhale (e.g. nostril, humming)
  inhaleCue?: L<string>;
  exhaleCue?: L<string>;
}

function tt<T>(m: L<T> | undefined, locale: Locale): T | undefined {
  if (!m) return undefined;
  return m[locale] ?? m.en;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'nadi-shodhana',
    sanskrit: 'Nadi Shodhana',
    name: { ko: '교호(콧구멍 교대) 호흡', en: 'Alternate Nostril Breathing', ja: '片鼻交互呼吸', zh: '交替鼻孔呼吸', fr: 'Respiration alternée par les narines', es: 'Respiración alterna por fosas nasales' },
    level: { ko: '초급', en: 'Beginner', ja: '初級', zh: '初级', fr: 'Débutant', es: 'Principiante' },
    benefit: { ko: '좌우 신경계를 균형 있게 하고 마음을 가라앉힙니다.', en: 'Balances the nervous system and calms the mind.', ja: '左右の神経系のバランスを整え、心を落ち着けます。', zh: '平衡左右神经系统，让心绪安定。', fr: 'Équilibre le système nerveux et apaise l’esprit.', es: 'Equilibra el sistema nervioso y calma la mente.' },
    steps: {
      ko: ['오른손 엄지로 오른쪽 콧구멍을 막습니다.', '왼쪽 콧구멍으로 천천히 들이쉽니다.', '약지로 왼쪽을 막고 잠시 멈춥니다.', '엄지를 떼고 오른쪽으로 내쉽니다.', '오른쪽으로 들이쉬고, 막고, 왼쪽으로 내쉽니다 — 이것이 한 번입니다.'],
      en: ['Close your right nostril with your right thumb.', 'Inhale slowly through the left nostril.', 'Close the left with your ring finger and pause.', 'Release the thumb and exhale through the right.', 'Inhale right, hold, exhale left — that is one round.'],
      ja: ['右手の親指で右の鼻孔を閉じます。', '左の鼻孔からゆっくり吸います。', '薬指で左を閉じ、少し止めます。', '親指を離して右から吐きます。', '右から吸い、止めて、左から吐きます。これで1ラウンドです。'],
      zh: ['用右手拇指闭住右鼻孔。', '从左鼻孔慢慢吸气。', '用无名指闭住左侧，短暂停留。', '松开拇指，从右侧呼气。', '从右侧吸气、屏息、从左侧呼气，这是一轮。'],
      fr: ['Fermez la narine droite avec le pouce droit.', 'Inspirez lentement par la narine gauche.', 'Fermez la gauche avec l’annulaire et faites une pause.', 'Relâchez le pouce et expirez par la droite.', 'Inspirez à droite, retenez, expirez à gauche : c’est un cycle.'],
      es: ['Cierra la fosa nasal derecha con el pulgar derecho.', 'Inhala lentamente por la fosa nasal izquierda.', 'Cierra la izquierda con el anular y haz una pausa.', 'Suelta el pulgar y exhala por la derecha.', 'Inhala por la derecha, retén y exhala por la izquierda: eso es una ronda.'],
    },
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 0,
    inhaleCue: { ko: '왼쪽 콧구멍', en: 'Left nostril', ja: '左の鼻孔', zh: '左鼻孔', fr: 'Narine gauche', es: 'Fosa nasal izquierda' },
    exhaleCue: { ko: '오른쪽 콧구멍', en: 'Right nostril', ja: '右の鼻孔', zh: '右鼻孔', fr: 'Narine droite', es: 'Fosa nasal derecha' },
  },
  {
    id: 'sama-vritti',
    sanskrit: 'Sama Vritti',
    name: { ko: '균등(사각) 호흡', en: 'Equal / Box Breathing', ja: '均等呼吸（ボックス呼吸）', zh: '等长 / 方块呼吸', fr: 'Respiration égale / carrée', es: 'Respiración igual / cuadrada' },
    level: { ko: '초급', en: 'Beginner', ja: '初級', zh: '初级', fr: 'Débutant', es: 'Principiante' },
    benefit: { ko: '들숨·멈춤·날숨을 같게 하여 집중과 평정을 키웁니다.', en: 'Equal counts build focus and steady calm.', ja: '吸う・止める・吐く時間をそろえ、集中と穏やかさを育てます。', zh: '用相同计数吸气、屏息和呼气，培养专注和平稳。', fr: 'Des temps égaux développent la concentration et un calme stable.', es: 'Los tiempos iguales desarrollan enfoque y calma estable.' },
    steps: {
      ko: ['편안히 앉아 척추를 세웁니다.', '4를 세며 들이쉽니다.', '4를 세며 멈춥니다.', '4를 세며 내쉬고, 다시 4를 세며 멈춥니다.'],
      en: ['Sit comfortably with a tall spine.', 'Inhale for a count of 4.', 'Hold for 4.', 'Exhale for 4, then hold empty for 4.'],
      ja: ['楽に座り、背筋を伸ばします。', '4つ数えながら吸います。', '4つ数えて止めます。', '4つ数えて吐き、空のまま4つ止めます。'],
      zh: ['舒适坐好，脊柱挺直。', '数到4时吸气。', '屏息4拍。', '呼气4拍，然后空肺停留4拍。'],
      fr: ['Asseyez-vous confortablement, la colonne longue.', 'Inspirez sur 4 temps.', 'Retenez pendant 4 temps.', 'Expirez sur 4 temps, puis restez poumons vides 4 temps.'],
      es: ['Siéntate cómodamente con la columna erguida.', 'Inhala contando hasta 4.', 'Retén durante 4.', 'Exhala durante 4 y luego mantén vacío durante 4.'],
    },
    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4,
  },
  {
    id: 'ujjayi',
    sanskrit: 'Ujjayi',
    name: { ko: '우자이(승리/바다) 호흡', en: 'Ujjayi (Ocean) Breath', ja: 'ウジャイ（海の）呼吸', zh: '乌加依（海浪）呼吸', fr: 'Respiration Ujjayi (océan)', es: 'Respiración Ujjayi (océano)' },
    level: { ko: '중급', en: 'Intermediate', ja: '中級', zh: '中级', fr: 'Intermédiaire', es: 'Intermedio' },
    benefit: { ko: '목을 살짝 좁혀 바다 같은 소리를 내며 집중과 체온을 높입니다.', en: 'A soft throat constriction makes an ocean sound, building focus and warmth.', ja: '喉をやさしく狭めて海のような音を出し、集中と温かさを高めます。', zh: '轻微收窄喉咙，发出海浪般的声音，提升专注和温暖感。', fr: 'Une légère constriction de la gorge crée un son d’océan et développe concentration et chaleur.', es: 'Una suave constricción de la garganta crea un sonido de océano y aumenta el enfoque y el calor.' },
    steps: {
      ko: ['목구멍 뒤쪽을 살짝 조입니다(속삭이듯).', '코로 들이쉬며 부드러운 "바다 소리"를 냅니다.', '같은 소리를 유지하며 코로 길게 내쉽니다.', '소리가 고르고 끊기지 않게 합니다.'],
      en: ['Gently constrict the back of the throat (as if whispering).', 'Inhale through the nose with a soft "ocean" sound.', 'Exhale long through the nose keeping the same sound.', 'Keep the sound even and unbroken.'],
      ja: ['ささやくように、喉の奥をやさしく狭めます。', '鼻から吸いながら、やわらかな「海の音」を出します。', '同じ音を保ちながら、鼻から長く吐きます。', '音が均一で途切れないようにします。'],
      zh: ['像轻声耳语一样，轻轻收窄喉咙后部。', '从鼻子吸气，发出柔和的“海浪声”。', '保持同样的声音，从鼻子长长呼气。', '让声音均匀、不断开。'],
      fr: ['Contractez doucement l’arrière de la gorge, comme pour chuchoter.', 'Inspirez par le nez avec un doux son d’océan.', 'Expirez longuement par le nez en gardant le même son.', 'Gardez un son régulier et continu.'],
      es: ['Contrae suavemente la parte posterior de la garganta, como si susurraras.', 'Inhala por la nariz con un suave sonido de “océano”.', 'Exhala largo por la nariz manteniendo el mismo sonido.', 'Mantén el sonido uniforme y continuo.'],
    },
    inhale: 5, holdIn: 0, exhale: 5, holdOut: 0,
    inhaleCue: { ko: '바다 소리로 들숨', en: 'Ocean-sound inhale', ja: '海の音で吸う', zh: '海浪声吸气', fr: 'Inspirez avec le son d’océan', es: 'Inhala con sonido de océano' },
    exhaleCue: { ko: '바다 소리로 날숨', en: 'Ocean-sound exhale', ja: '海の音で吐く', zh: '海浪声呼气', fr: 'Expirez avec le son d’océan', es: 'Exhala con sonido de océano' },
  },
  {
    id: 'dirga',
    sanskrit: 'Dirga',
    name: { ko: '디르가(3단계 완전) 호흡', en: 'Dirga (Three-Part) Breath', ja: 'ディルガ（三部式）呼吸', zh: '迪尔伽（三段式）呼吸', fr: 'Respiration Dirga (trois parties)', es: 'Respiración Dirga (tres partes)' },
    level: { ko: '초급', en: 'Beginner', ja: '初級', zh: '初级', fr: 'Débutant', es: 'Principiante' },
    benefit: { ko: '배–갈비–가슴 순으로 차오르게 하여 깊은 이완을 줍니다.', en: 'Fills belly–ribs–chest in turn for deep relaxation.', ja: '腹・肋骨・胸の順に満たし、深いリラックスを促します。', zh: '依次充满腹部、肋骨和胸腔，带来深度放松。', fr: 'Remplit ventre, côtes puis poitrine pour une relaxation profonde.', es: 'Llena vientre, costillas y pecho en orden para una relajación profunda.' },
    steps: {
      ko: ['먼저 배가 부풀도록 들이쉽니다.', '이어서 갈비뼈가 벌어지게 합니다.', '마지막으로 가슴 윗부분까지 채웁니다.', '가슴–갈비–배 순으로 천천히 비웁니다.'],
      en: ['Inhale first into the belly so it expands.', 'Then let the ribs widen.', 'Finally fill the upper chest.', 'Exhale slowly chest–ribs–belly.'],
      ja: ['まずお腹がふくらむように吸います。', '次に肋骨が広がるようにします。', '最後に胸の上部まで満たします。', '胸、肋骨、お腹の順にゆっくり吐きます。'],
      zh: ['先吸到腹部，让腹部鼓起。', '然后让肋骨向外展开。', '最后充满上胸部。', '按胸部、肋骨、腹部的顺序慢慢呼气。'],
      fr: ['Inspirez d’abord dans le ventre pour qu’il se gonfle.', 'Laissez ensuite les côtes s’élargir.', 'Remplissez enfin le haut de la poitrine.', 'Expirez lentement poitrine, côtes, ventre.'],
      es: ['Inhala primero hacia el vientre para que se expanda.', 'Luego deja que las costillas se abran.', 'Por último llena la parte alta del pecho.', 'Exhala lentamente pecho, costillas y vientre.'],
    },
    inhale: 6, holdIn: 0, exhale: 6, holdOut: 0,
    inhaleCue: { ko: '배→갈비→가슴', en: 'Belly → ribs → chest', ja: '腹→肋骨→胸', zh: '腹部→肋骨→胸部', fr: 'Ventre → côtes → poitrine', es: 'Vientre → costillas → pecho' },
    exhaleCue: { ko: '가슴→갈비→배', en: 'Chest → ribs → belly', ja: '胸→肋骨→腹', zh: '胸部→肋骨→腹部', fr: 'Poitrine → côtes → ventre', es: 'Pecho → costillas → vientre' },
  },
  {
    id: 'relaxing-1-2',
    sanskrit: '1:2 Breathing',
    name: { ko: '1:2 이완 호흡', en: '1:2 Relaxing Breath', ja: '1:2 リラックス呼吸', zh: '1:2 放松呼吸', fr: 'Respiration relaxante 1:2', es: 'Respiración relajante 1:2' },
    level: { ko: '초급', en: 'Beginner', ja: '初級', zh: '初级', fr: 'Débutant', es: 'Principiante' },
    benefit: { ko: '날숨을 들숨의 두 배로 늘려 부교감신경을 켜고 잠을 돕습니다.', en: 'Doubling the exhale activates the calming nervous system and aids sleep.', ja: '吐く時間を吸う時間の2倍にして、鎮静系を働かせ睡眠を助けます。', zh: '把呼气延长到吸气的两倍，激活放松神经系统并帮助入睡。', fr: 'Doubler l’expiration active le système apaisant et favorise le sommeil.', es: 'Duplicar la exhalación activa el sistema calmante y favorece el sueño.' },
    steps: {
      ko: ['코로 4를 세며 들이쉽니다.', '입이나 코로 8을 세며 길게 내쉽니다.', '날숨 끝에서 몸의 긴장을 내려놓습니다.', '5~10번 반복합니다.'],
      en: ['Inhale through the nose for 4.', 'Exhale long for 8 through nose or mouth.', 'Let tension drop at the end of the exhale.', 'Repeat 5–10 rounds.'],
      ja: ['鼻から4つ数えて吸います。', '鼻または口から8つ数えて長く吐きます。', '吐き終わりに体の緊張をほどきます。', '5〜10ラウンド繰り返します。'],
      zh: ['用鼻子吸气4拍。', '用鼻子或嘴长长呼气8拍。', '在呼气结束时放下身体的紧张。', '重复5到10轮。'],
      fr: ['Inspirez par le nez sur 4 temps.', 'Expirez longuement sur 8 temps par le nez ou la bouche.', 'Relâchez la tension à la fin de l’expiration.', 'Répétez 5 à 10 cycles.'],
      es: ['Inhala por la nariz durante 4.', 'Exhala largo durante 8 por la nariz o la boca.', 'Suelta la tensión al final de la exhalación.', 'Repite de 5 a 10 rondas.'],
    },
    inhale: 4, holdIn: 0, exhale: 8, holdOut: 0,
  },
  {
    id: 'bhramari',
    sanskrit: 'Bhramari',
    name: { ko: '브라마리(벌 소리) 호흡', en: 'Bhramari (Bee) Breath', ja: 'ブラーマリー（蜂の）呼吸', zh: '蜂鸣呼吸', fr: 'Respiration Bhramari (abeille)', es: 'Respiración Bhramari (abeja)' },
    level: { ko: '초급', en: 'Beginner', ja: '初級', zh: '初级', fr: 'Débutant', es: 'Principiante' },
    benefit: { ko: '날숨에 "음~" 허밍을 내어 불안과 머릿속 소음을 가라앉힙니다.', en: 'Humming "mmm" on the exhale quiets anxiety and mental noise.', ja: '吐く息で「mmm」とハミングし、不安や頭の中の雑音を静めます。', zh: '呼气时发出“mmm”哼鸣，安抚焦虑和脑中的杂念。', fr: 'Fredonner « mmm » à l’expiration calme l’anxiété et le bruit mental.', es: 'Tararear “mmm” al exhalar calma la ansiedad y el ruido mental.' },
    steps: {
      ko: ['눈을 감고 어깨의 힘을 뺍니다.', '코로 편안히 들이쉽니다.', '입을 다물고 날숨 내내 "음~" 하고 허밍합니다.', '머리에 울리는 진동을 느낍니다.'],
      en: ['Close your eyes and soften the shoulders.', 'Inhale comfortably through the nose.', 'Keep lips closed and hum "mmm" through the whole exhale.', 'Feel the vibration in your head.'],
      ja: ['目を閉じ、肩の力を抜きます。', '鼻から楽に吸います。', '唇を閉じたまま、吐く息の間ずっと「mmm」とハミングします。', '頭に響く振動を感じます。'],
      zh: ['闭上眼睛，放松肩膀。', '用鼻子舒适地吸气。', '双唇闭合，在整个呼气中发出“mmm”哼鸣。', '感受头部的振动。'],
      fr: ['Fermez les yeux et relâchez les épaules.', 'Inspirez confortablement par le nez.', 'Gardez les lèvres fermées et fredonnez « mmm » pendant toute l’expiration.', 'Sentez la vibration dans votre tête.'],
      es: ['Cierra los ojos y relaja los hombros.', 'Inhala cómodamente por la nariz.', 'Mantén los labios cerrados y tararea “mmm” durante toda la exhalación.', 'Siente la vibración en la cabeza.'],
    },
    inhale: 4, holdIn: 0, exhale: 6, holdOut: 0,
    exhaleCue: { ko: '"음~" 허밍', en: 'Hum "mmm"', ja: '「mmm」とハミング', zh: '哼鸣“mmm”', fr: 'Fredonnez « mmm »', es: 'Tararea “mmm”' },
  },
  {
    id: 'sheetali',
    sanskrit: 'Sheetali',
    name: { ko: '시탈리(냉각) 호흡', en: 'Sheetali (Cooling) Breath', ja: 'シータリー（冷却）呼吸', zh: '清凉呼吸', fr: 'Respiration Sheetali (rafraîchissante)', es: 'Respiración Sheetali (refrescante)' },
    level: { ko: '중급', en: 'Intermediate', ja: '中級', zh: '中级', fr: 'Intermédiaire', es: 'Intermedio' },
    benefit: { ko: '혀를 말아 들이쉬어 몸의 열과 긴장을 식힙니다.', en: 'Inhaling through a curled tongue cools heat and tension.', ja: '丸めた舌から吸い込み、体の熱と緊張を冷まします。', zh: '通过卷起的舌头吸气，缓解热感和紧张。', fr: 'Inspirer par la langue roulée apaise la chaleur et la tension.', es: 'Inhalar por la lengua enrollada refresca el calor y la tensión.' },
    steps: {
      ko: ['혀를 통(빨대)처럼 말아 살짝 내밉니다.', '말린 혀를 통해 시원한 공기를 들이쉽니다.', '혀를 넣고 입을 다뭅니다.', '코로 천천히 내쉽니다.'],
      en: ['Curl the tongue into a tube and let it out slightly.', 'Inhale cool air through the curled tongue.', 'Draw the tongue in and close the mouth.', 'Exhale slowly through the nose.'],
      ja: ['舌を筒のように丸め、少し外に出します。', '丸めた舌から冷たい空気を吸います。', '舌を戻して口を閉じます。', '鼻からゆっくり吐きます。'],
      zh: ['把舌头卷成管状，稍微伸出。', '通过卷起的舌头吸入清凉空气。', '收回舌头并闭上嘴。', '从鼻子慢慢呼气。'],
      fr: ['Roulez la langue en tube et sortez-la légèrement.', 'Inspirez l’air frais par la langue roulée.', 'Rentrez la langue et fermez la bouche.', 'Expirez lentement par le nez.'],
      es: ['Enrolla la lengua formando un tubo y sácala ligeramente.', 'Inhala aire fresco por la lengua enrollada.', 'Recoge la lengua y cierra la boca.', 'Exhala lentamente por la nariz.'],
    },
    caution: { ko: '혀를 말 수 없으면 이를 살짝 다물고 그 사이로 들이쉬세요(시트카리).', en: 'If you cannot curl the tongue, sip air through lightly closed teeth instead (Sitkari).', ja: '舌を丸められない場合は、軽く閉じた歯の間から空気を吸ってください（シートカーリー）。', zh: '如果无法卷舌，可改为轻合牙齿，从齿缝吸气（Sitkari）。', fr: 'Si vous ne pouvez pas rouler la langue, aspirez plutôt l’air entre les dents légèrement fermées (Sitkari).', es: 'Si no puedes enrollar la lengua, sorbe aire entre los dientes ligeramente cerrados (Sitkari).' },
    inhale: 4, holdIn: 2, exhale: 6, holdOut: 0,
    inhaleCue: { ko: '말린 혀로 들숨', en: 'Inhale via curled tongue', ja: '丸めた舌から吸う', zh: '卷舌吸气', fr: 'Inspirez par la langue roulée', es: 'Inhala por la lengua enrollada' },
    exhaleCue: { ko: '코로 날숨', en: 'Exhale via nose', ja: '鼻から吐く', zh: '鼻子呼气', fr: 'Expirez par le nez', es: 'Exhala por la nariz' },
  },
  {
    id: 'surya-bhedana',
    sanskrit: 'Surya Bhedana',
    name: { ko: '수리야 베다나(우비공) 호흡', en: 'Surya Bhedana (Right-Nostril) Breath', ja: 'スーリヤ・ベーダナ（右鼻孔）呼吸', zh: '太阳穿透（右鼻孔）呼吸', fr: 'Respiration Surya Bhedana (narine droite)', es: 'Respiración Surya Bhedana (fosa derecha)' },
    level: { ko: '중급', en: 'Intermediate', ja: '中級', zh: '中级', fr: 'Intermédiaire', es: 'Intermedio' },
    benefit: { ko: '오른쪽으로 들이쉬어 활력과 따뜻함, 각성을 높입니다.', en: 'Inhaling right raises energy, warmth and alertness.', ja: '右から吸うことで、活力・温かさ・覚醒感を高めます。', zh: '从右侧吸气，提升能量、温暖感和清醒度。', fr: 'Inspirer à droite augmente l’énergie, la chaleur et la vigilance.', es: 'Inhalar por la derecha aumenta la energía, el calor y la alerta.' },
    steps: {
      ko: ['왼손은 무릎에, 오른손으로 콧구멍을 조절합니다.', '왼쪽을 막고 오른쪽으로 들이쉽니다.', '잠시 멈춥니다.', '오른쪽을 막고 왼쪽으로 내쉽니다.'],
      en: ['Left hand on the knee, right hand controls the nostrils.', 'Close the left, inhale through the right.', 'Hold briefly.', 'Close the right, exhale through the left.'],
      ja: ['左手は膝に置き、右手で鼻孔を調整します。', '左を閉じ、右から吸います。', '短く止めます。', '右を閉じ、左から吐きます。'],
      zh: ['左手放在膝上，右手控制鼻孔。', '闭住左侧，从右侧吸气。', '短暂停留。', '闭住右侧，从左侧呼气。'],
      fr: ['Main gauche sur le genou, la main droite contrôle les narines.', 'Fermez la gauche et inspirez par la droite.', 'Retenez brièvement.', 'Fermez la droite et expirez par la gauche.'],
      es: ['Mano izquierda sobre la rodilla; la derecha controla las fosas nasales.', 'Cierra la izquierda e inhala por la derecha.', 'Retén brevemente.', 'Cierra la derecha y exhala por la izquierda.'],
    },
    caution: { ko: '활력을 높이므로 잠자기 직전에는 피하세요.', en: 'Energizing — avoid right before sleep.', ja: '活性化する呼吸なので、就寝直前は避けてください。', zh: '此法会提振精神，睡前请避免练习。', fr: 'Stimulante : évitez-la juste avant de dormir.', es: 'Es energizante: evítala justo antes de dormir.' },
    inhale: 4, holdIn: 4, exhale: 6, holdOut: 0,
    inhaleCue: { ko: '오른쪽 콧구멍', en: 'Right nostril', ja: '右の鼻孔', zh: '右鼻孔', fr: 'Narine droite', es: 'Fosa nasal derecha' },
    exhaleCue: { ko: '왼쪽 콧구멍', en: 'Left nostril', ja: '左の鼻孔', zh: '左鼻孔', fr: 'Narine gauche', es: 'Fosa nasal izquierda' },
  },
];

const PHASE_LABELS: Record<Phase, L<string>> = {
  inhale: { ko: '들숨', en: 'Inhale', ja: '吸う', zh: '吸气', fr: 'Inspirez', es: 'Inhala' },
  'hold-in': { ko: '멈춤', en: 'Hold', ja: '止める', zh: '屏息', fr: 'Retenez', es: 'Retén' },
  exhale: { ko: '날숨', en: 'Exhale', ja: '吐く', zh: '呼气', fr: 'Expirez', es: 'Exhala' },
  'hold-out': { ko: '멈춤', en: 'Hold', ja: '止める', zh: '屏息', fr: 'Retenez', es: 'Retén' },
  idle: { ko: '준비', en: 'Ready', ja: '準備', zh: '准备', fr: 'Prêt', es: 'Listo' },
};

const UI: Record<string, L<string>> = {
  title: { ko: '요가 호흡(프라나야마) 가이드', en: 'Yoga Breathing (Pranayama) Guide', ja: 'ヨガ呼吸（プラーナーヤーマ）ガイド', zh: '瑜伽呼吸（调息法）指南', fr: 'Guide de respiration yoga (pranayama)', es: 'Guía de respiración yóguica (pranayama)' },
  start: { ko: '시작', en: 'Start', ja: 'スタート', zh: '开始', fr: 'Démarrer', es: 'Iniciar' },
  pause: { ko: '정지', en: 'Pause', ja: '一時停止', zh: '暂停', fr: 'Pause', es: 'Pausar' },
  reset: { ko: '리셋', en: 'Reset', ja: 'リセット', zh: '重置', fr: 'Réinit.', es: 'Reiniciar' },
  rounds: { ko: '완료 횟수', en: 'Rounds', ja: 'ラウンド', zh: '次数', fr: 'Cycles', es: 'Rondas' },
  technique: { ko: '호흡 기법', en: 'Technique', ja: '技法', zh: '技法', fr: 'Technique', es: 'Técnica' },
  benefit: { ko: '효과', en: 'Benefit', ja: '効果', zh: '效果', fr: 'Bienfait', es: 'Beneficio' },
  steps: { ko: '하는 법', en: 'How to', ja: 'やり方', zh: '方法', fr: 'Mode d’emploi', es: 'Cómo hacerlo' },
  caution: { ko: '주의', en: 'Caution', ja: '注意', zh: '注意', fr: 'Attention', es: 'Precaución' },
  rhythm: { ko: '리듬(초)', en: 'Rhythm (sec)', ja: 'リズム（秒）', zh: '节奏（秒）', fr: 'Rythme (s)', es: 'Ritmo (s)' },
};

function getSequence(t: Technique): { phase: Phase; duration: number }[] {
  const seq: { phase: Phase; duration: number }[] = [];
  if (t.inhale > 0) seq.push({ phase: 'inhale', duration: t.inhale });
  if (t.holdIn > 0) seq.push({ phase: 'hold-in', duration: t.holdIn });
  if (t.exhale > 0) seq.push({ phase: 'exhale', duration: t.exhale });
  if (t.holdOut > 0) seq.push({ phase: 'hold-out', duration: t.holdOut });
  return seq;
}

export default function PranayamaGuide({ locale }: Props) {
  const u = (k: string) => tt(UI[k], locale) ?? k;
  const [selected, setSelected] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [scale, setScale] = useState(0.5);

  const phaseIdx = useRef(0);
  const timeLeft = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundsRef = useRef(0);

  const technique = TECHNIQUES[selected];
  const sequence = getSequence(technique);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const reset = useCallback(() => {
    stop(); setIsRunning(false); setPhase('idle'); setCountdown(0);
    setRounds(0); roundsRef.current = 0; phaseIdx.current = 0; timeLeft.current = 0; setScale(0.5);
  }, [stop]);

  const startPhase = useCallback((index: number) => {
    const { phase: p, duration } = sequence[index];
    phaseIdx.current = index; timeLeft.current = duration;
    setPhase(p); setCountdown(duration);
    if (p === 'inhale') setScale(1);
    else if (p === 'exhale') setScale(0.3);
    else setScale(p === 'hold-in' ? 1 : 0.3);
  }, [sequence]);

  useEffect(() => {
    if (!isRunning) return;
    startPhase(phaseIdx.current);
    intervalRef.current = setInterval(() => {
      timeLeft.current -= 1;
      setCountdown(timeLeft.current);
      if (timeLeft.current <= 0) {
        const nextIndex = phaseIdx.current + 1;
        if (nextIndex >= sequence.length) {
          roundsRef.current += 1; setRounds(roundsRef.current); startPhase(0);
        } else { startPhase(nextIndex); }
      }
    }, 1000);
    return () => stop();
  }, [isRunning, startPhase, sequence, stop]);

  const startPause = () => {
    if (isRunning) { stop(); setIsRunning(false); }
    else { if (phase === 'idle') phaseIdx.current = 0; setIsRunning(true); }
  };

  const pick = (i: number) => { reset(); setSelected(i); };

  const size = 120 + scale * 100;
  const transition = phase === 'inhale' ? technique.inhale : phase === 'exhale' ? technique.exhale : 0.3;
  const phaseColor: Record<Phase, string> = {
    inhale: 'from-green-400 to-green-500',
    'hold-in': 'from-green-500 to-green-600',
    exhale: 'from-green-400 to-green-500',
    'hold-out': 'from-green-300 to-green-400',
    idle: 'from-green-300 to-green-400',
  };
  const cue = phase === 'inhale' ? tt(technique.inhaleCue, locale)
    : phase === 'exhale' ? tt(technique.exhaleCue, locale) : undefined;

  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-green-50 p-5">
      <h1 className="text-2xl font-bold text-foreground">{u('title')}</h1>

      {/* Technique selector */}
      <p className="mt-4 text-sm font-semibold text-green-800">{u('technique')}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TECHNIQUES.map((tch, i) => (
          <button key={tch.id} type="button" onClick={() => pick(i)}
            className={`rounded-xl px-4 py-2.5 text-left text-sm transition-all ${
              selected === i ? 'bg-green-600 text-white shadow-sm' : 'bg-card text-green-800 hover:bg-green-100'
            }`}>
            <span className="font-semibold">{tt(tch.name, locale)}</span>
            <span className={`ml-1 block text-xs ${selected === i ? 'text-green-100' : 'text-green-500'}`}>
              {tch.sanskrit} · {tt(tch.level, locale)}
            </span>
          </button>
        ))}
      </div>

      {/* Pacer */}
      <div className="mt-6 flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center rounded-full"
          style={{ width: `${size + 40}px`, height: `${size + 40}px`, transition: `all ${transition}s ease-in-out` }}>
          <div className={`flex flex-col items-center justify-center rounded-full bg-gradient-to-br ${phaseColor[phase]} shadow-lg`}
            style={{ width: `${size}px`, height: `${size}px`, transition: `all ${transition}s ease-in-out` }}>
            <span className="px-2 text-center text-base font-semibold text-white drop-shadow">
              {tt(PHASE_LABELS[phase], locale)}
            </span>
            {countdown > 0 && <span className="text-3xl font-bold text-white drop-shadow">{countdown}</span>}
          </div>
        </div>
        {cue && <p className="mt-3 text-sm font-medium text-green-700">{cue}</p>}
      </div>

      {/* Rounds + controls */}
      <div className="mb-4 text-center text-sm text-green-600">
        {u('rounds')}: <span className="text-lg font-bold text-green-700">{rounds}</span>
      </div>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={startPause}
          className={`rounded-xl px-8 py-3 font-semibold text-primary-foreground shadow-sm transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-primary'}`}>
          {isRunning ? u('pause') : u('start')}
        </button>
        <button type="button" onClick={reset}
          className="rounded-xl bg-green-100 px-6 py-3 font-semibold text-green-700 transition-all hover:bg-green-200">
          {u('reset')}
        </button>
      </div>

      {/* Rhythm */}
      <div className="mt-5 flex justify-center gap-5 rounded-2xl bg-white/70 p-3 text-sm text-green-700">
        {sequence.map(({ phase: p, duration }, i) => (
          <div key={`${p}-${i}`} className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-green-600">{duration}s</span>
            <span>{tt(PHASE_LABELS[p], locale)}</span>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">{u('benefit')}</p>
          <p className="mt-1 text-sm leading-6 text-green-900">{tt(technique.benefit, locale)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">{u('steps')}</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-green-900">
            {(tt(technique.steps, locale) ?? []).map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        {tt(technique.caution, locale) && (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm leading-6 text-amber-900">
            <span className="font-semibold">{u('caution')}: </span>{tt(technique.caution, locale)}
          </p>
        )}
      </div>
    </div>
  );
}
