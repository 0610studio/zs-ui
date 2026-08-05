import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSBorderBeam from '../../ui/ZSBorderBeam';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const palette = paletteFn({ mode: 'light' });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette }),
  };
});

const contentLayout = (width: number, height: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height } },
});

// 컴포넌트 내부 content 래퍼(onLayout 대상)를 children으로 찾기 위한 헬퍼
const fireContentLayout = (getByText: any, text: string, width = 200, height = 100) => {
  const content = getByText(text).parent;
  fireEvent(content, 'layout', contentLayout(width, height));
};

describe('ZSBorderBeam', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(getByText('Beam Content')).toBeTruthy();
  });

  it('레이아웃 측정 후 Skia Canvas(글로우 + stroke 레이어)를 렌더한다', () => {
    const { getByText, queryByTestId, getByTestId, getAllByTestId } = render(
      <ZSBorderBeam>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    expect(queryByTestId('skia-canvas')).toBeNull();

    fireContentLayout(getByText, 'Beam Content');

    expect(getByTestId('skia-canvas')).toBeTruthy();
    // track + glow + beam 3중 레이어
    expect(getAllByTestId('skia-rounded-rect')).toHaveLength(3);
    expect(getByTestId('skia-blur')).toBeTruthy();
  });

  it('active=false면 Canvas를 렌더하지 않는다', () => {
    const { getByText, queryByTestId } = render(
      <ZSBorderBeam active={false}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    expect(queryByTestId('skia-canvas')).toBeNull();
  });

  it('beamLength=1이면 colors 배열을 그대로 전달한다', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    const { getByText, getAllByTestId } = render(
      <ZSBorderBeam colors={customColors} beamLength={1}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    const gradients = getAllByTestId('skia-sweep-gradient');
    gradients.forEach((gradient) => {
      expect(gradient.props.colors).toEqual(customColors);
      expect(gradient.props.positions).toBeUndefined();
    });
  });

  it('기본값은 혜성 형태 — 광선을 beamLength 구간에 압축하고 나머지는 투명 처리한다', () => {
    const { getByText, getAllByTestId } = render(
      <ZSBorderBeam colorFrom="#FF0000" colorTo="#0000FF" beamLength={0.35}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    const gradient = getAllByTestId('skia-sweep-gradient')[0];
    // 꼬리(투명) → 몸통 → 머리(선명) → 컷오프(투명) → 링 끝까지 투명 유지
    expect(gradient.props.colors).toEqual([
      '#FF000000',
      '#FF000066',
      '#FF0000',
      '#0000FF',
      '#0000FF00',
      '#0000FF00',
    ]);
    const positions = gradient.props.positions;
    expect(positions).toHaveLength(6);
    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBe(1);
    // 머리는 beamLength 위치에서 끝난다
    expect(positions[3]).toBeCloseTo(0.35);
  });

  it('glow=false면 blur 글로우 레이어를 그리지 않는다', () => {
    const { getByText, getAllByTestId, queryByTestId } = render(
      <ZSBorderBeam glow={false}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    // track + beam 2중 레이어만, blur 없음
    expect(getAllByTestId('skia-rounded-rect')).toHaveLength(2);
    expect(queryByTestId('skia-blur')).toBeNull();
  });

  it('glow 객체로 blur 값을 세밀 제어할 수 있다', () => {
    const { getByText, getByTestId } = render(
      <ZSBorderBeam glow={{ blur: 20 }}>
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    expect(getByTestId('skia-blur').props.blur).toBe(20);
  });

  it('trackColor="none"이면 기본 테두리 레이어를 그리지 않는다', () => {
    const { getByText, getAllByTestId } = render(
      <ZSBorderBeam trackColor="none">
        <Text>Beam Content</Text>
      </ZSBorderBeam>
    );

    fireContentLayout(getByText, 'Beam Content');

    // glow + beam 2중 레이어만
    expect(getAllByTestId('skia-rounded-rect')).toHaveLength(2);
  });
});
