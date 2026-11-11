import { createThemeColors, DEFAULT_COLORS } from '../../theme/color';
import { createShadows, SHADOW, shadowFor } from '../../theme/shadow';
import { nth } from '../utils/hostQueries';

type Layer = { offsetX: number; offsetY: number; blurRadius: number; color: string };

const layers = (dp: number, color = '#000000') => shadowFor(dp, color) as Layer[];
const alpha = (rgba: string) => Number(/,\s*([\d.]+)\)$/.exec(rgba)?.[1]);
const LEVELS = (Object.values(SHADOW) as number[]).filter((dp) => dp > 0);

describe('shadowFor()', () => {
  it('0 이하 높이는 그림자가 없다', () => {
    expect(shadowFor(0, '#000000')).toEqual([]);
    expect(shadowFor(-3, '#000000')).toEqual([]);
  });

  it('md(6dp)는 떠 있는 층 그림자 0 6 18 α.08 + 0 1 2 α.05 다', () => {
    expect(shadowFor(SHADOW.md, '#000000')).toEqual([
      { offsetX: 0, offsetY: 6, blurRadius: 18, color: 'rgba(0, 0, 0, 0.08)' },
      { offsetX: 0, offsetY: 1, blurRadius: 2, color: 'rgba(0, 0, 0, 0.05)' },
    ]);
  });

  it.each(LEVELS)('key 는 y = dp·blur 3dp·불투명도 0.08 이다(%sdp)', (dp) => {
    const key = nth(layers(dp), 0);
    expect(key.offsetY).toBe(Math.max(1, Math.round(dp)));
    expect(key.blurRadius).toBe(3 * dp);
    expect(alpha(key.color)).toBe(0.08);
  });

  it.each(LEVELS)('ambient 는 y 1·blur 2·불투명도 0.05 로 가장자리만 잡고 key 보다 넓지도 진하지도 않다(%sdp)', (dp) => {
    const [key, ambient] = [nth(layers(dp), 0), nth(layers(dp), 1)];
    expect(ambient).toMatchObject({ offsetY: 1, blurRadius: 2 });
    expect(alpha(ambient.color)).toBe(0.05);
    expect(ambient.blurRadius).toBeLessThanOrEqual(key.blurRadius);
    expect(alpha(ambient.color)).toBeLessThan(alpha(key.color));
  });

  it('shadow 색의 rgb 를 쓴다(뒤 알파는 무시)', () => {
    expect(shadowFor(12, '#10203080')[0]?.color).toBe('rgba(16, 32, 48, 0.08)');
  });

  it('hex 가 아니면 검정으로 그린다', () => {
    expect(shadowFor(3, 'black')[0]?.color).toBe('rgba(0, 0, 0, 0.08)');
  });
});

describe('createShadows()', () => {
  it('none·xs~xl 단계이고 높이(dp)는 M3 elevation 0~5 다', () => {
    expect(SHADOW).toEqual({ none: 0, xs: 1, sm: 3, md: 6, lg: 8, xl: 12 });
  });

  it('라이트: none 은 빈 스타일, 나머지는 단계 dp 의 shadowFor 그림자다', () => {
    const colors = createThemeColors(DEFAULT_COLORS, { mode: 'light', contrastLevel: 0 });
    const shadows = createShadows(colors);
    expect(shadows.none).toEqual({});
    (['xs', 'sm', 'md', 'lg', 'xl'] as const).forEach((token) => {
      expect(shadows[token].boxShadow).toEqual(shadowFor(SHADOW[token], colors.shadow));
    });
    const blur = (token: 'xs' | 'xl') => nth(shadows[token].boxShadow as readonly { blurRadius: number }[], 0).blurRadius;
    expect(blur('xl')).toBeGreaterThan(blur('xs'));
  });

  it('다크: 같은 모양에 진한 그림자(key .45·ambient .4) — 어두운 바탕에 묻히지 않는다', () => {
    const dark = createThemeColors(DEFAULT_COLORS, { mode: 'dark', contrastLevel: 0 });
    const [key, ambient] = createShadows(dark).md.boxShadow as readonly Layer[];
    const [lightKey, lightAmbient] = layers(SHADOW.md, dark.shadow);
    expect(key).toEqual({ ...lightKey, color: 'rgba(0, 0, 0, 0.45)' });
    expect(ambient).toEqual({ ...lightAmbient, color: 'rgba(0, 0, 0, 0.4)' });
  });

  it('shadow 색만 받으면 밝은 바탕 그림자다(배경을 알 수 없다)', () => {
    expect(createShadows({ shadow: '#000000' }).sm.boxShadow).toEqual(shadowFor(SHADOW.sm, '#000000'));
  });
});
