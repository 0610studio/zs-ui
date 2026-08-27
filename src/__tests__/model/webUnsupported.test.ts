describe('webUnsupported', () => {
  let warnSpy: jest.SpyInstance;
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
    (global as any).__DEV__ = true;
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    warnSpy.mockRestore();
  });

  const load = () => require('../../model/webUnsupported') as typeof import('../../model/webUnsupported');

  it('IS_WEB은 Platform.OS가 web이 아니면 false다', () => {
    expect(load().IS_WEB).toBe(false);
  });

  it('IS_WEB은 Platform.OS가 web이면 true다', () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
    expect(load().IS_WEB).toBe(true);
    jest.dontMock('react-native');
  });

  it('첫 호출 시 컴포넌트명이 포함된 경고를 1회 출력한다', () => {
    load().warnWebUnsupported('ZSBorderBeam');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('ZSBorderBeam');
  });

  it('같은 컴포넌트명으로 재호출하면 추가 경고를 출력하지 않는다', () => {
    const { warnWebUnsupported } = load();
    warnWebUnsupported('ZSBorderBeam');
    warnWebUnsupported('ZSBorderBeam');

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('다른 컴포넌트명은 각각 1회씩 경고한다', () => {
    const { warnWebUnsupported } = load();
    warnWebUnsupported('ZSBorderBeam');
    warnWebUnsupported('ZSSkeleton · ZSSkeletonBox');

    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('__DEV__가 false면 경고를 출력하지 않는다', () => {
    (global as any).__DEV__ = false;
    load().warnWebUnsupported('ZSBorderBeam');

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
