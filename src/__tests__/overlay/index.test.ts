jest.mock('../../model/useOverlay', () => ({
  useOverlay: () => ({}),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ palette: {} }),
}));

jest.mock('../../overlay/AlertOverlay', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../overlay/BottomSheetOverlay', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../overlay/SnackbarNotify', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../overlay/PopOver/PopOverButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../overlay/PopOver/PopOverMenu', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../overlay/ZSPortal', () => ({
  ZSPortal: () => null,
}));

describe('overlay/index.ts exports', () => {
  it('모든 주요 overlay 컴포넌트와 hooks를 export 한다', async () => {
    const overlayExports = await import('../../overlay');
    expect(overlayExports).toHaveProperty('AlertOverlay');
    expect(overlayExports).toHaveProperty('BottomSheetOverlay');
    expect(overlayExports).toHaveProperty('SnackbarNotify');
    expect(overlayExports).toHaveProperty('useOverlay');
    expect(overlayExports).toHaveProperty('PopOverButton');
    expect(overlayExports).toHaveProperty('PopOverMenu');
    expect(overlayExports).toHaveProperty('ZSPortal');
    expect(overlayExports).toHaveProperty('types');
  });

  it('types가 객체로 export된다', async () => {
    const overlayExports = await import('../../overlay');
    expect(typeof overlayExports.types).toBe('object');
  });
});

