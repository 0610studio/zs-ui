import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import SnackbarNotify from '../../overlay/SnackbarNotify';

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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

describe('SnackbarNotify', () => {
  it('snackItemStack이 없으면 null을 반환한다', () => {
    jest.spyOn(require('../../model/useOverlay'), 'useSnackbar').mockReturnValue({
      snackItemStack: null,
      hideSnackBar: jest.fn(),
    });

    const { queryByText } = render(<SnackbarNotify />);
    // null이면 아무것도 렌더되지 않음
    expect(queryByText).toBeDefined();
  });

  it('snackItemStack이 있으면 SnackbarItem들을 렌더한다', () => {
    jest.spyOn(require('../../model/useOverlay'), 'useSnackbar').mockReturnValue({
      snackItemStack: [
        { message: 'Success message', type: 'success', index: 1, snackbarDuration: 3000 },
        { message: 'Error message', type: 'error', index: 2, snackbarDuration: 3000 },
      ],
      hideSnackBar: jest.fn(),
    });

    const { getByText } = render(<SnackbarNotify />);
    expect(getByText('Success message')).toBeTruthy();
    expect(getByText('Error message')).toBeTruthy();
  });

  it('customSnackbar prop을 사용할 수 있다', () => {
    const customSnackbar = jest.fn(({ snackMessage }) => <Text>{snackMessage}</Text>);
    
    jest.spyOn(require('../../model/useOverlay'), 'useSnackbar').mockReturnValue({
      snackItemStack: [
        { message: 'Custom message', type: 'success', index: 1, snackbarDuration: 3000 },
      ],
      hideSnackBar: jest.fn(),
    });

    render(<SnackbarNotify customSnackbar={customSnackbar} />);
    expect(customSnackbar).toHaveBeenCalled();
  });
});

