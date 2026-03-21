import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import BottomSheetOverlay from '../../overlay/BottomSheetOverlay';
import type { BottomSheetContextProps } from '../../model/types';

const createBottomSheetContext = (
  overrides: Partial<BottomSheetContextProps> = {}
): BottomSheetContextProps => ({
  bottomSheetVisible: true,
  setBottomSheetVisible: () => {},
  height: 300,
  maxHeight: 500,
  setHeight: () => {},
  ...overrides,
});

const mockUseBottomSheet = jest.fn<BottomSheetContextProps, []>(() => createBottomSheetContext());

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

jest.mock('../../model/useOverlay', () => ({
  useBottomSheet: () => mockUseBottomSheet(),
}));

jest.mock('../../model/useFoldingState', () => ({
  __esModule: true,
  default: () => ({ width: 390 })
}));

describe('BottomSheetOverlay', () => {
  afterEach(() => {
    mockUseBottomSheet.mockReset();
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext());
  });

  it('헤더/콘텐츠를 렌더한다', () => {
    const { getByText } = render(
      <BottomSheetOverlay
        headerComponent={<Text>header</Text>}
        component={<Text>content</Text>}
      />
    );
    getByText('header');
    getByText('content');
  });

  it('height가 auto여도 콘텐츠를 렌더한다', () => {
    mockUseBottomSheet.mockReturnValue(createBottomSheetContext({ height: 'auto', maxHeight: 320 }));

    const { getByText } = render(
      <BottomSheetOverlay
        headerComponent={<Text>auto header</Text>}
        component={<Text>auto content</Text>}
      />
    );

    getByText('auto header');
    getByText('auto content');
  });
});
