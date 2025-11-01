jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
import palette from '../../theme/palette';
const { Platform } = require('react-native');
const { default: elevation, IOS_SHADOW } = require('../../theme/elevation');

describe('elevation()', () => {
  const light = palette({ mode: 'light' });

  afterEach(() => {
    (Platform as any).OS = 'ios';
  });

  it('iOS에서 IOS_SHADOW와 shadowColor를 매핑한다', () => {
    (Platform as any).OS = 'ios';
    const e = elevation(light);
    expect(e[0]).toEqual({ ...IOS_SHADOW[0], shadowColor: light.elevationShadow[0] });
    expect(e[4]).toEqual({ ...IOS_SHADOW[4], shadowColor: light.elevationShadow[4] });
    expect(e[9]).toEqual({ ...IOS_SHADOW[9], shadowColor: light.elevationShadow[9] });
  });

  it('Android에서 elevation 숫자와 shadowColor를 매핑한다', () => {
    (Platform as any).OS = 'android';
    const e = elevation(light);
    expect(e[0]).toEqual({ elevation: 0, shadowColor: light.elevationShadow[0] });
    expect(e[4]).toEqual({ elevation: 4, shadowColor: light.elevationShadow[4] });
    expect(e[9]).toEqual({ elevation: 9, shadowColor: light.elevationShadow[9] });
  });
});



