import palette from '../../theme/palette';
import elevation, {
  IOS_SHADOW,
  parseColorChannels,
  createBoxShadow,
} from '../../theme/elevation';

describe('parseColorChannels()', () => {
  it('rgba 문자열에서 r·g·b·a 채널을 추출한다', () => {
    expect(parseColorChannels('rgba(0, 0, 0, 0.18)')).toEqual({ r: 0, g: 0, b: 0, a: 0.18 });
    expect(parseColorChannels('rgba(255, 255, 255, 0.58)')).toEqual({ r: 255, g: 255, b: 255, a: 0.58 });
  });

  it('alpha가 없는 rgb 문자열은 a를 1로 채운다', () => {
    expect(parseColorChannels('rgb(12, 34, 56)')).toEqual({ r: 12, g: 34, b: 56, a: 1 });
  });

  it('일부 채널이 누락되면 0으로 채운다', () => {
    expect(parseColorChannels('rgb(10)')).toEqual({ r: 10, g: 0, b: 0, a: 1 });
  });

  it('파싱할 수 없는 문자열은 불투명 검정으로 폴백한다', () => {
    expect(parseColorChannels('')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColorChannels('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it('alpha 값이 숫자가 아니면 1로 폴백한다', () => {
    expect(parseColorChannels('rgba(0, 0, 0, abc)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe('createBoxShadow()', () => {
  it('alpha가 양수면 IOS_SHADOW 기하값으로 boxShadow를 만든다', () => {
    expect(createBoxShadow(1, 'rgba(0, 0, 0, 0.2)')).toEqual([
      {
        offsetX: 0,
        offsetY: 1,
        blurRadius: 1.0,
        spreadDistance: 0,
        color: `rgba(0, 0, 0, ${0.2 * 0.2})`,
      },
    ]);
  });

  it('최종 불투명도는 색상 alpha × shadowOpacity 로 계산한다', () => {
    const [shadow] = createBoxShadow(7, 'rgba(0, 0, 0, 0.3)');
    expect(shadow?.color).toBe(`rgba(0, 0, 0, ${0.3 * 0.25})`);
  });

  it('level 0은 shadowOpacity가 0이라 빈 배열을 반환한다', () => {
    expect(createBoxShadow(0, 'rgba(0, 0, 0, 0.18)')).toEqual([]);
  });

  it('색상 alpha가 0이면 빈 배열을 반환한다', () => {
    expect(createBoxShadow(5, 'rgba(0, 0, 0, 0)')).toEqual([]);
  });
});

describe('elevation()', () => {
  const light = palette({ mode: 'light' });

  it('모든 레벨을 boxShadow 스타일로 매핑한다', () => {
    const e = elevation(light);
    expect(e[0]).toEqual({ boxShadow: [] });
    expect(e[1]).toEqual({ boxShadow: createBoxShadow(1, light.elevationShadow[1] ?? '') });
    expect(e[9]).toEqual({ boxShadow: createBoxShadow(9, light.elevationShadow[9] ?? '') });
  });

  it('elevation 프로퍼티 없이 boxShadow만 노출한다', () => {
    const e = elevation(light);
    (Object.keys(e) as unknown as Array<keyof typeof e>).forEach((level) => {
      expect(e[level]).not.toHaveProperty('elevation');
      expect(e[level]).toHaveProperty('boxShadow');
    });
  });

  it('IOS_SHADOW는 11개 레벨을 정의한다', () => {
    expect(IOS_SHADOW).toHaveLength(11);
  });
});
