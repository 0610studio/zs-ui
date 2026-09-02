import type { ImageSourcePropType } from 'react-native';
import type { StickerCode } from '../../../mock-api/db';

/** 바라봄 앱 스티커 중 데모 카테고리에 쓰이는 것만 옮겨 왔다 */
const STICKERS: Record<StickerCode, ImageSourcePropType> = {
  walk: require('../../../assets/barabom/stickers/stk_walk.png'),
  fod: require('../../../assets/barabom/stickers/stk_fod.png'),
  fec: require('../../../assets/barabom/stickers/stk_fec.png'),
  hosp: require('../../../assets/barabom/stickers/stk_hosp.png'),
  ply: require('../../../assets/barabom/stickers/stk_ply.png'),
  wei: require('../../../assets/barabom/stickers/stk_wei.png'),
  memo: require('../../../assets/barabom/stickers/stk_memo.png'),
  chek: require('../../../assets/barabom/stickers/stk_chek.png'),
  clock: require('../../../assets/barabom/stickers/stk_clock.png'),
  abno: require('../../../assets/barabom/stickers/stk_abno.png'),
  heart: require('../../../assets/barabom/stickers/stk_heart.png'),
};

export const stickerToImg = (code: StickerCode): ImageSourcePropType => STICKERS[code];

export const BARABOM_IMAGES = {
  GRADIENT_WHITE: require('../../../assets/barabom/gradient_white.png') as ImageSourcePropType,
  DIVIDER_GRADIENT: require('../../../assets/barabom/img_divider_gradient.png') as ImageSourcePropType,
  ARROW_DOWN: require('../../../assets/barabom/ic_arrow_down.png') as ImageSourcePropType,
  NOTI_MESSAGE: require('../../../assets/barabom/ic_noti_message.png') as ImageSourcePropType,
};
