import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import ZSSegmented from '../../ui/ZSSegmented';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography }),
  };
});

const layoutEvent = (width: number, height = 40) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height } },
});

const segmentStyle = (getByTestId: any, index: number) =>
  StyleSheet.flatten(getByTestId(`zs-segmented-segment-${index}`).props.style);

describe('ZSSegmented', () => {
  it('옵션 개수만큼 세그먼트를 렌더한다', () => {
    const options = ['하나', '둘', '셋', '넷', '다섯'];
    const { getByTestId, getByText, queryByTestId } = render(
      <ZSSegmented options={options} />
    );

    options.forEach((label, index) => {
      expect(getByTestId(`zs-segmented-segment-${index}`)).toBeTruthy();
      expect(getByText(label)).toBeTruthy();
    });
    expect(queryByTestId('zs-segmented-segment-5')).toBeNull();
  });

  it('세그먼트를 누르면 onChange가 해당 인덱스로 호출된다', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ZSSegmented options={['산책', '간식']} onChange={onChange} />
    );

    fireEvent.press(getByText('간식'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('이미 선택된 세그먼트를 눌러도 onChange가 호출되지 않는다', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ZSSegmented options={['산책', '간식']} initialIndex={0} onChange={onChange} />
    );

    fireEvent.press(getByText('산책'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled면 눌러도 onChange가 호출되지 않는다', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ZSSegmented options={['산책', '간식']} disabled onChange={onChange} />
    );

    fireEvent.press(getByText('간식'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('선택된 세그먼트의 accessibilityState.selected가 true다', () => {
    const { getByTestId } = render(
      <ZSSegmented options={['산책', '간식']} selectedIndex={1} />
    );

    expect(getByTestId('zs-segmented-segment-0').props.accessibilityState.selected).toBe(false);
    expect(getByTestId('zs-segmented-segment-1').props.accessibilityState.selected).toBe(true);
  });

  it('fullWidth(기본): 세그먼트가 flex: 1로 균등 분할되고 썸 폭은 트랙 폭 / 개수다', () => {
    const { getByTestId } = render(
      <ZSSegmented testID='ctrl' options={['산책', '간식']} />
    );

    expect(segmentStyle(getByTestId, 0).flex).toBe(1);
    expect(segmentStyle(getByTestId, 1).flex).toBe(1);

    // 트랙 406 - 인셋(3) * 2 = 400 → 세그먼트당 200
    fireEvent(getByTestId('ctrl'), 'layout', layoutEvent(406));
    expect(StyleSheet.flatten(getByTestId('zs-segmented-thumb').props.style).width).toBe(200);
  });

  it('fullWidth={false}: 가장 긴 라벨 폭 기준으로 세그먼트/썸 폭이 정해진다', () => {
    const { getAllByText, getByTestId, queryByTestId } = render(
      <ZSSegmented fullWidth={false} options={['ON', 'OFF입니다']} />
    );

    // 측정 전에는 고정 폭도 썸도 없다
    expect(segmentStyle(getByTestId, 0).width).toBeUndefined();
    expect(queryByTestId('zs-segmented-thumb')).toBeNull();

    // 각 라벨은 측정용 히든 텍스트 + 실제 세그먼트 텍스트로 두 번 렌더된다 (측정용이 먼저)
    const hidden = { includeHiddenElements: true };
    fireEvent(getAllByText('ON', hidden)[0], 'layout', layoutEvent(24.4));
    fireEvent(getAllByText('OFF입니다', hidden)[0], 'layout', layoutEvent(70.2));

    // ceil(70.2) + SEGMENT_HORIZONTAL_PADDING(14) * 2 = 99
    expect(segmentStyle(getByTestId, 0).width).toBe(99);
    expect(segmentStyle(getByTestId, 1).width).toBe(99);
    expect(segmentStyle(getByTestId, 0).flex).toBeUndefined();
    expect(StyleSheet.flatten(getByTestId('zs-segmented-thumb').props.style).width).toBe(99);
  });
});
