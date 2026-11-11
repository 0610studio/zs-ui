import { mixHex, toRgbHex, withAlpha } from '../../ui/hexColor';

describe('hexColor', () => {
  it('#rrggbb 는 그대로, #rgb 는 각 채널을 두 번 반복해 편다', () => {
    expect(toRgbHex('#12abEF')).toBe('#12abEF');
    expect(toRgbHex('#0af')).toBe('#00aaff');
  });

  it('hex 가 아니면 null 이다', () => {
    expect(toRgbHex('red')).toBeNull();
    expect(toRgbHex('#12345')).toBeNull();
    expect(toRgbHex('#11223344')).toBeNull();
  });

  it('withAlpha 는 편 hex 에 두 자리 알파를 붙이고, hex 가 아니면 null 이다', () => {
    expect(withAlpha('#0af', '66')).toBe('#00aaff66');
    expect(withAlpha('#000000', '1F')).toBe('#0000001F');
    expect(withAlpha('rgb(0, 0, 0)', '66')).toBeNull();
  });

  it('mixHex 는 채널별로 섞는다 — 0 이면 아래 색, 1 이면 위 색, 범위 밖은 자른다', () => {
    expect(mixHex('#ffffff', '#000000', 0.5)).toBe('#808080');
    expect(mixHex('#e2e2e2', '#353535', 0.12)).toBe('#4a4a4a');
    expect(mixHex('#fff', '#102030', 0)).toBe('#102030');
    expect(mixHex('#fff', '#102030', 1)).toBe('#ffffff');
    expect(mixHex('#fff', '#102030', 2)).toBe('#ffffff');
    expect(mixHex('#fff', '#102030', -1)).toBe('#102030');
  });

  it('mixHex 는 둘 중 하나라도 hex 가 아니면 null 이다', () => {
    expect(mixHex('#ffffff', 'transparent', 0.5)).toBeNull();
    expect(mixHex('white', '#000000', 0.5)).toBeNull();
  });
});
