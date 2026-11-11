import type { ImageSourcePropType } from 'react-native';
import type { DiaryCategoryCode } from '../../model/diary/categories';

const CATEGORY_ICONS: Record<DiaryCategoryCode, ImageSourcePropType> = {
  memo: require('../../../assets/barabom/diary/diary_memo.png'),
  todo: require('../../../assets/barabom/diary/diary_todo.png'),
  weight: require('../../../assets/barabom/diary/diary_weight.png'),
  play: require('../../../assets/barabom/diary/diary_play.png'),
  poopee: require('../../../assets/barabom/diary/diary_poopee.png'),
  measure: require('../../../assets/barabom/diary/diary_measure.png'),
  abnormal: require('../../../assets/barabom/diary/diary_abnormal.png'),
  medical: require('../../../assets/barabom/diary/diary_medical.png'),
  feed: require('../../../assets/barabom/diary/diary_feed.png'),
  walk: require('../../../assets/barabom/diary/diary_walk.png'),
  behavior: require('../../../assets/barabom/diary/diary_behavior.png'),
};

export const categoryIcon = (code: DiaryCategoryCode): ImageSourcePropType => CATEGORY_ICONS[code];

export const STICKERS: { code: string; name: string; image: ImageSourcePropType }[] = [
  { code: 'n', name: '없음', image: require('../../../assets/barabom/stickers/sticker_none.png') },
  { code: 'alrm', name: '알람', image: require('../../../assets/barabom/stickers/stk_clock.png') },
  { code: 'm', name: '메모', image: require('../../../assets/barabom/stickers/stk_memo.png') },
  { code: 'chek', name: '할일', image: require('../../../assets/barabom/stickers/stk_chek.png') },
  { code: 'fod', name: '급여', image: require('../../../assets/barabom/stickers/stk_fod.png') },
  { code: 'fec', name: '대소변', image: require('../../../assets/barabom/stickers/stk_fec.png') },
  { code: 'ply', name: '놀이', image: require('../../../assets/barabom/stickers/stk_ply.png') },
  { code: 'walk', name: '산책', image: require('../../../assets/barabom/stickers/stk_walk.png') },
  { code: 'wei', name: '체중', image: require('../../../assets/barabom/stickers/stk_wei.png') },
  { code: 'abno', name: '이상증상', image: require('../../../assets/barabom/stickers/stk_abno.png') },
  { code: 'hosp', name: '병원', image: require('../../../assets/barabom/stickers/stk_hosp.png') },
  { code: 'syringe', name: '주사', image: require('../../../assets/barabom/stickers/stk_syringe.png') },
  { code: 'drug', name: '약', image: require('../../../assets/barabom/stickers/stk_drug.png') },
  { code: 'ball', name: '공', image: require('../../../assets/barabom/stickers/stk_ball.png') },
  { code: 'cage', name: '이동장', image: require('../../../assets/barabom/stickers/stk_cage.png') },
  { code: 'can', name: '캔', image: require('../../../assets/barabom/stickers/stk_can.png') },
  { code: 'car', name: '자동차', image: require('../../../assets/barabom/stickers/stk_car.png') },
  { code: 'feed', name: '사료', image: require('../../../assets/barabom/stickers/stk_feed.png') },
  { code: 'money', name: '돈', image: require('../../../assets/barabom/stickers/stk_money.png') },
  { code: 'snood', name: '스누드', image: require('../../../assets/barabom/stickers/stk_snood.png') },
  { code: 'bath', name: '목욕', image: require('../../../assets/barabom/stickers/stk_bath.png') },
  { code: 'cat', name: '고양이', image: require('../../../assets/barabom/stickers/stk_cat.png') },
  { code: 'comb', name: '빗', image: require('../../../assets/barabom/stickers/stk_comb.png') },
  { code: 'cut', name: '미용', image: require('../../../assets/barabom/stickers/stk_cut.png') },
  { code: 'dog', name: '강아지', image: require('../../../assets/barabom/stickers/stk_dog.png') },
  { code: 'ear', name: '귀', image: require('../../../assets/barabom/stickers/stk_ear.png') },
  { code: 'heart', name: '하트', image: require('../../../assets/barabom/stickers/stk_heart.png') },
  { code: 'hotel', name: '호텔', image: require('../../../assets/barabom/stickers/stk_hotel.png') },
  { code: 'medicine', name: '약병', image: require('../../../assets/barabom/stickers/stk_medicine.png') },
  { code: 'period', name: '생리', image: require('../../../assets/barabom/stickers/stk_period.png') },
  { code: 'shop', name: '쇼핑', image: require('../../../assets/barabom/stickers/stk_shop.png') },
  { code: 'teeth', name: '이빨', image: require('../../../assets/barabom/stickers/stk_teeth.png') },
  { code: 'travel', name: '여행', image: require('../../../assets/barabom/stickers/stk_travel.png') },
];

export const STICKER_EMOJI_BASE: ImageSourcePropType = require('../../../assets/barabom/stickers/stk_emoji_base.png');

export const findSticker = (code: string) => STICKERS.find((sticker) => sticker.code === code);
