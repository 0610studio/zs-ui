import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
// 네이티브 구현의 IS_WEB 가드(비 metro 번들러 대비 방어선)를 검증하기 위해 명시 import
import ZSBorderBeam from '../../ui/ZSBorderBeam/ZSBorderBeam';
import ZSBorderBeamWeb from '../../ui/ZSBorderBeam/index.web';
import { warnWebUnsupported } from '../../model/webUnsupported';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const palette = paletteFn({ mode: 'light' });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette }),
  };
});

jest.mock('../../model/webUnsupported', () => ({
  IS_WEB: true,
  warnWebUnsupported: jest.fn(),
}));

describe('ZSBorderBeam (web)', () => {
  it('웹에서는 Skia Canvas 없이 children만 렌더한다', () => {
    const { getByText, queryByTestId } = render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(getByText('Beam Content')).toBeTruthy();
    expect(queryByTestId('skia-canvas')).toBeNull();
  });

  it('웹 미지원 경고를 컴포넌트명과 함께 호출한다', () => {
    render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(warnWebUnsupported).toHaveBeenCalledWith('ZSBorderBeam');
  });
});

describe('ZSBorderBeam (index.web.tsx — 웹 번들용 구현)', () => {
  it('Skia 없이 children만 렌더하고 광선 props를 View에 흘리지 않는다', () => {
    const { getByText, queryByTestId } = render(
      <ZSBorderBeamWeb glow duration={3000} beamLength={0.5} testID="beam-web">
        <Text>Beam Content</Text>
      </ZSBorderBeamWeb>
    );

    expect(getByText('Beam Content')).toBeTruthy();
    expect(queryByTestId('skia-canvas')).toBeNull();
    expect(warnWebUnsupported).toHaveBeenCalledWith('ZSBorderBeam');
  });
});
