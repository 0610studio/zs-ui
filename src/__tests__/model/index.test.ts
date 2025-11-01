jest.mock('../../model/useStyleSheetCreate', () => ({
  useStyleSheetCreate: () => ({}),
}));

jest.mock('../../model/globalOverlay', () => ({
  GlobalOverlay: {},
}));

describe('model/index.ts exports', () => {
  it('모든 주요 model utilities를 export 한다', async () => {
    const modelExports = await import('../../model');
    expect(modelExports).toHaveProperty('useStyleSheetCreate');
    expect(modelExports).toHaveProperty('GlobalOverlay');
  });

  it('export된 항목들이 함수 또는 객체이다', async () => {
    const modelExports = await import('../../model');
    expect(typeof modelExports.useStyleSheetCreate).toBe('function');
    expect(modelExports.GlobalOverlay).toBeDefined();
  });
});

