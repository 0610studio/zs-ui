import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSSkeleton from '../../ui/ZSSkeleton';
import ZSSkeletonBox from '../../ui/ZSSkeletonBox';
import SkiaShimmerWeb from '../../ui/ZSSkeleton/SkiaShimmer.web';
import { warnWebUnsupported } from '../../model/webUnsupported';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const palette = paletteFn({ mode: 'light' });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette }),
  };
});

jest.mock('../../ui/atoms/AnimatedWrapper', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

jest.mock('../../model/webUnsupported', () => ({
  IS_WEB: true,
  warnWebUnsupported: jest.fn(),
}));

describe('ZSSkeleton (web)', () => {
  it('isFetching=true여도 shimmer Canvas 없이 children을 렌더한다', () => {
    const { getByText, queryByTestId } = render(
      <ZSSkeleton isFetching>
        <Text>fetching DATA</Text>
      </ZSSkeleton>
    );

    expect(getByText('fetching DATA')).toBeTruthy();
    expect(queryByTestId('skia-canvas')).toBeNull();
  });

  it('웹 미지원 경고를 호출한다', () => {
    render(
      <ZSSkeleton isFetching>
        <Text>fetching DATA</Text>
      </ZSSkeleton>
    );

    expect(warnWebUnsupported).toHaveBeenCalledWith('ZSSkeleton · ZSSkeletonBox');
  });
});

describe('ZSSkeletonBox (web)', () => {
  it('shimmer Canvas 없이 배경 박스만 렌더한다', () => {
    const { queryByTestId, getByTestId } = render(
      <ZSSkeletonBox height={100} testID="skeleton-box" />
    );

    expect(getByTestId('skeleton-box')).toBeTruthy();
    expect(queryByTestId('skia-canvas')).toBeNull();
  });
});

describe('SkiaShimmer (SkiaShimmer.web.tsx — 웹 번들용 구현)', () => {
  it('null을 렌더하고 웹 미지원 경고를 호출한다', () => {
    const { toJSON } = render(<SkiaShimmerWeb color="#ffffff" />);

    expect(toJSON()).toBeNull();
    expect(warnWebUnsupported).toHaveBeenCalledWith('ZSSkeleton · ZSSkeletonBox');
  });
});
