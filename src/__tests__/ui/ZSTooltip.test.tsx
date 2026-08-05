import { fireEvent, render } from '@testing-library/react-native';
import ZSTooltip from '../../ui/ZSTooltip';
import { ZSText } from '../../index';

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

describe('ZSTooltip', () => {
  it('메시지를 렌더한다', () => {
    const { getByText } = render(<ZSTooltip message='길게 눌러 순서를 바꿔보세요' />);
    expect(getByText('길게 눌러 순서를 바꿔보세요')).toBeTruthy();
  });

  it('children 지정 시 message 대신 children을 렌더한다', () => {
    const { getByText, queryByText } = render(
      <ZSTooltip message='무시되는 메시지'>
        <ZSText>커스텀 콘텐츠</ZSText>
      </ZSTooltip>
    );
    expect(getByText('커스텀 콘텐츠')).toBeTruthy();
    expect(queryByText('무시되는 메시지')).toBeNull();
  });

  it('showClose가 아니면 닫기 버튼을 렌더하지 않는다', () => {
    const { queryByTestId } = render(<ZSTooltip message='안내' />);
    expect(queryByTestId('zs-tooltip-close')).toBeNull();
  });

  it('비제어 모드: 닫기 버튼을 누르면 사라지고 onClose가 호출된다', () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText } = render(
      <ZSTooltip message='안내' showClose onClose={onClose} />
    );

    fireEvent.press(getByTestId('zs-tooltip-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByText('안내')).toBeNull();
  });

  it('제어 모드: visible을 넘기면 닫기를 눌러도 내부에서 숨기지 않는다', () => {
    const onClose = jest.fn();
    const { getByTestId, getByText } = render(
      <ZSTooltip message='안내' visible showClose onClose={onClose} />
    );

    fireEvent.press(getByTestId('zs-tooltip-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(getByText('안내')).toBeTruthy();
  });

  it('visible=false면 렌더하지 않는다', () => {
    const { queryByText } = render(<ZSTooltip message='안내' visible={false} />);
    expect(queryByText('안내')).toBeNull();
  });

  it('initialVisible=false면 렌더하지 않는다', () => {
    const { queryByText } = render(<ZSTooltip message='안내' initialVisible={false} />);
    expect(queryByText('안내')).toBeNull();
  });

  it('placement=bottom·floating 조합도 렌더된다', () => {
    const { getByText } = render(
      <ZSTooltip message='아래 툴팁' placement='bottom' floating tailAlign='center' />
    );
    expect(getByText('아래 툴팁')).toBeTruthy();
  });
});
