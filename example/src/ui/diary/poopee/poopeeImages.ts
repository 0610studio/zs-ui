import type { ImageSourcePropType } from 'react-native';
import type { PoopeeKind } from '../../../model/diary/poopee';

const IMAGES: Record<PoopeeKind, Record<string, ImageSourcePropType>> = {
  urine: {
    '투명한 노랑': require('../../../../assets/barabom/poopee/fec_pee_normal.png'),
    진노란색: require('../../../../assets/barabom/poopee/fec_pee_yello.png'),
    주황색: require('../../../../assets/barabom/poopee/fec_pee_orange.png'),
    분홍색: require('../../../../assets/barabom/poopee/fec_pee_pink.png'),
    붉은색: require('../../../../assets/barabom/poopee/fec_pee_blood.png'),
    '진한 갈색': require('../../../../assets/barabom/poopee/fec_pee_gal.png'),
    검은색: require('../../../../assets/barabom/poopee/fec_pee_black.png'),
    푸른색: require('../../../../assets/barabom/poopee/fec_pee_blue.png'),
  },
  feces: {
    초콜릿색: require('../../../../assets/barabom/poopee/fec_brown_2.png'),
    녹색: require('../../../../assets/barabom/poopee/fec_green_2.png'),
    노란색: require('../../../../assets/barabom/poopee/fec_yellow_2.png'),
    '피 섞인 변': require('../../../../assets/barabom/poopee/fec_red_2.png'),
    검은색: require('../../../../assets/barabom/poopee/fec_black_2.png'),
    보라색: require('../../../../assets/barabom/poopee/fec_purple_2.png'),
  },
  shape: {
    정상변1: require('../../../../assets/barabom/poopee/fec_brown_2.png'),
    정상변2: require('../../../../assets/barabom/poopee/fec_brown_3.png'),
    설사1: require('../../../../assets/barabom/poopee/fec_brown_4.png'),
    설사2: require('../../../../assets/barabom/poopee/fec_brown_5.png'),
    설사3: require('../../../../assets/barabom/poopee/fec_brown_6.png'),
    설사4: require('../../../../assets/barabom/poopee/fec_brown_7.png'),
    건조1: require('../../../../assets/barabom/poopee/fec_brown_1.png'),
  },
};

export const poopeeImage = (kind: PoopeeKind, code: string): ImageSourcePropType | undefined => IMAGES[kind][code];
