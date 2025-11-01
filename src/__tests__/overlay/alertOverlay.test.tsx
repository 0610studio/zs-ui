import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlertOverlay from '../../overlay/AlertOverlay';

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

jest.mock('../../model/useOverlay', () => {
  let visible = true;
  return {
    useAlert: () => ({ alertVisible: visible, setAlertVisible: (v: boolean) => { visible = v; } })
  };
});

describe('AlertOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('타이틀/본문/버튼이 렌더된다', () => {
    const { getByText } = render(
      <AlertOverlay
        title="제목"
        informative="안내문"
        actions={{ primary: { label: '확인' } }}
      />
    );
    getByText('제목');
    getByText('안내문');
    getByText('확인');
  });

  it('secondary 버튼이 있을 때 두 버튼을 렌더한다', () => {
    const { getByText } = render(
      <AlertOverlay
        title="제목"
        informative="안내문"
        actions={{
          primary: { label: '확인', onPress: jest.fn() },
          secondary: { label: '취소', onPress: jest.fn() }
        }}
      />
    );
    getByText('제목');
    getByText('안내문');
    getByText('확인');
    getByText('취소');
  });

  it('버튼 클릭 시 onPress를 호출한다', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AlertOverlay
        title="제목"
        informative="안내문"
        actions={{ primary: { label: '확인', onPress: mockOnPress } }}
      />
    );

    fireEvent.press(getByText('확인'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('alertVisible이 false일 때 렌더되지 않는다', () => {
    jest.spyOn(require('../../model/useOverlay'), 'useAlert').mockReturnValue({
      alertVisible: false,
      setAlertVisible: jest.fn(),
    });

    const { queryByText } = render(
      <AlertOverlay
        title="제목"
        informative="안내문"
        actions={{ primary: { label: '확인' } }}
      />
    );

    expect(queryByText('제목')).toBeNull();
  });
});



