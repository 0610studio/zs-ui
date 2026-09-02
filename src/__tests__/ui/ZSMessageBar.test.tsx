import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import ZSMessageBar from '../../ui/ZSMessageBar';
import { ZSText } from '../../index';

// jest.mock 팩토리는 호이스팅되므로 mock 접두사 변수만 참조할 수 있다
let mockMode: 'light' | 'dark' = 'light';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette: paletteFn({ mode: mockMode }), typography }),
  };
});

afterEach(() => {
  mockMode = 'light';
});

describe('ZSMessageBar', () => {
  it('메시지를 렌더한다', () => {
    const { getByText } = render(<ZSMessageBar message='주소를 입력해 주세요' />);
    expect(getByText('주소를 입력해 주세요')).toBeTruthy();
  });

  it('title을 넘기면 메시지와 함께 렌더한다', () => {
    const { getByText } = render(
      <ZSMessageBar title='본인 인증이 필요합니다' message='30일마다 인증이 필요해요' />
    );
    expect(getByText('본인 인증이 필요합니다')).toBeTruthy();
    expect(getByText('30일마다 인증이 필요해요')).toBeTruthy();
  });

  it('기본 아이콘을 렌더하고, icon={null}이면 숨긴다', () => {
    const { queryByTestId, rerender } = render(<ZSMessageBar message='안내' />);
    expect(queryByTestId('zs-message-bar-icon')).toBeTruthy();

    rerender(<ZSMessageBar message='안내' icon={null} />);
    expect(queryByTestId('zs-message-bar-icon')).toBeNull();
  });

  it('커스텀 아이콘 노드를 아이콘 자리에 렌더한다', () => {
    const { getByText } = render(
      <ZSMessageBar message='안내' icon={<ZSText>커스텀</ZSText>} />
    );
    expect(getByText('커스텀')).toBeTruthy();
  });

  it('showClose가 아니면 닫기 버튼을 렌더하지 않는다', () => {
    const { queryByTestId } = render(<ZSMessageBar message='안내' />);
    expect(queryByTestId('zs-message-bar-close')).toBeNull();
  });

  it('비제어 모드: 닫기를 누르면 사라지고 onClose가 호출된다', () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText } = render(
      <ZSMessageBar message='안내' showClose onClose={onClose} />
    );

    fireEvent.press(getByTestId('zs-message-bar-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByText('안내')).toBeNull();
  });

  it('제어 모드: visible을 넘기면 내부에서 닫지 않고 onClose만 호출된다', () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText } = render(
      <ZSMessageBar message='안내' visible showClose onClose={onClose} />
    );

    fireEvent.press(getByTestId('zs-message-bar-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByText('안내')).toBeTruthy();
  });

  it('visible={false}면 렌더하지 않는다', () => {
    const { queryByText } = render(<ZSMessageBar message='안내' visible={false} />);
    expect(queryByText('안내')).toBeNull();
  });

  it('기본은 부모 폭을 채우고, fullWidth={false}면 콘텐츠 폭으로 hug 한다', () => {
    const { getByTestId, rerender } = render(<ZSMessageBar message='안내' />);
    const fill = StyleSheet.flatten(getByTestId('zs-message-bar-root').props.style);
    expect(fill.width).toBe('100%');
    expect(fill.alignSelf).toBeUndefined();

    rerender(<ZSMessageBar message='안내' fullWidth={false} />);
    const hug = StyleSheet.flatten(getByTestId('zs-message-bar-root').props.style);
    expect(hug.width).toBeUndefined();
    expect(hug.alignSelf).toBe('flex-start');
  });

  it('pastel 은 배경을 shade 5 로 깔고 본문에 중립 base 잉크를 쓴다', () => {
    const paletteFn = require('../../theme/palette').default;
    const palette = paletteFn({ mode: 'light' });

    const { getByText, getByTestId } = render(<ZSMessageBar intent='warning' message='곧 종료돼요' />);

    const container = StyleSheet.flatten(getByTestId('zs-message-bar-container').props.style);
    expect(container.backgroundColor).toBe(palette.warning[5]);
    expect(container.borderColor).toBe(palette.warning[20]);

    const color = StyleSheet.flatten(getByText('곧 종료돼요').props.style).color;
    expect(color).toBe(palette.text.base);
    expect(color).not.toBe(palette.warning[100]);
  });

  it('pastel 다크모드는 배경이 그대로 밝으므로 본문 잉크도 어둡게 유지한다', () => {
    const paletteFn = require('../../theme/palette').default;
    const dark = paletteFn({ mode: 'dark' });

    mockMode = 'dark';
    const { getByText, getByTestId } = render(<ZSMessageBar intent='warning' message='곧 종료돼요' />);

    expect(StyleSheet.flatten(getByTestId('zs-message-bar-container').props.style).backgroundColor).toBe(dark.warning[5]);
    // 배경이 밝으므로 text.base 대신 어두운 grey.10 을 쓴다
    const color = StyleSheet.flatten(getByText('곧 종료돼요').props.style).color;
    expect(color).toBe(dark.grey[10]);
    expect(color).not.toBe(dark.text.base);
  });

  it('grey pastel 은 배경이 mode 에 따라 뒤집히므로 base 잉크를 그대로 쓴다', () => {
    const paletteFn = require('../../theme/palette').default;
    const dark = paletteFn({ mode: 'dark' });

    mockMode = 'dark';
    const { getByText, getByTestId } = render(<ZSMessageBar intent='grey' message='안내' />);

    expect(StyleSheet.flatten(getByTestId('zs-message-bar-container').props.style).backgroundColor).toBe(dark.grey[5]);
    expect(StyleSheet.flatten(getByText('안내').props.style).color).toBe(dark.text.base);
  });

  it('stroke 는 배경이 뒤집히는 다크모드에서 밝은 잉크로 바뀐다', () => {
    const paletteFn = require('../../theme/palette').default;
    const light = paletteFn({ mode: 'light' });
    const dark = paletteFn({ mode: 'dark' });

    const lightRender = render(<ZSMessageBar intent='warning' variant='stroke' message='stroke' />);
    expect(StyleSheet.flatten(lightRender.getByText('stroke').props.style).color)
      .toBe(light.warning[100]);
    lightRender.unmount();

    mockMode = 'dark';
    const darkRender = render(<ZSMessageBar intent='warning' variant='stroke' message='stroke' />);
    expect(StyleSheet.flatten(darkRender.getByText('stroke').props.style).color)
      .toBe(dark.warning[50]);
  });

  it('actionLabel을 누르면 onAction이 호출된다', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <ZSMessageBar message='카드 승인 실패' actionLabel='카드 변경하기' onAction={onAction} />
    );

    fireEvent.press(getByText('카드 변경하기'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('disabled면 액션·닫기 콜백이 호출되지 않는다', () => {
    const onAction = jest.fn();
    const onClose = jest.fn();
    const { getByText, getByTestId, queryByText } = render(
      <ZSMessageBar
        message='안내'
        actionLabel='실행'
        onAction={onAction}
        showClose
        onClose={onClose}
        disabled
      />
    );

    fireEvent.press(getByText('실행'));
    fireEvent.press(getByTestId('zs-message-bar-close'));
    expect(onAction).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(queryByText('안내')).toBeTruthy();
  });
});
