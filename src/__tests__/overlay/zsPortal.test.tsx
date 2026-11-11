import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import { PortalProvider, ZSPortal } from '../../overlay/ZSPortal';
import { springConfig, timingConfig } from '../../theme/motion';
import { SPACE } from '../../theme/spacing';

describe('ZSPortal', () => {
  it('PortalProvider가 children을 렌더한다', async () => {
    const { getByText } = await render(
      <PortalProvider>
        <Text>Test Content</Text>
      </PortalProvider>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('ZSPortal이 children을 등록한다', async () => {
    const { getByText } = await render(
      <PortalProvider>
        <Text>Regular Content</Text>
        <ZSPortal isFocused>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    expect(getByText('Regular Content')).toBeTruthy();
    expect(getByText('Portal Content')).toBeTruthy();
  });

  it('isFocused가 false일 때 포털이 등록되지 않는다', async () => {
    const { queryByText } = await render(
      <PortalProvider>
        <Text>origContent</Text>
        <ZSPortal isFocused={false}>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    expect(queryByText('Portal Content')).toBeNull();
  });

  it('포털이 언마운트될 때 등록 해제된다', async () => {
    const { rerender } = await render(
      <PortalProvider>
        <ZSPortal isFocused>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    await rerender(
      <PortalProvider>
        <Text>After Unmount</Text>
      </PortalProvider>
    );

    expect(screen.queryByText('Portal Content')).toBeNull();
    expect(screen.getByText('After Unmount')).toBeTruthy();
  });

  it('포털 층은 motion 토큰으로 들고 난다 — 위에서 16 내려오며 나타나고(move·fade spring), 아래로 비켜 가며 짧게 사라진다(timing fast)', async () => {
    await render(
      <PortalProvider>
        <ZSPortal isFocused>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );
    const layer = screen.getByText('Portal Content').parent!;
    const spring = jest.spyOn(Reanimated, 'withSpring');
    const timing = jest.spyOn(Reanimated, 'withTiming');

    const entering = (layer.props.entering as () => Reanimated.LayoutAnimation)();
    expect(entering.initialValues).toEqual({ opacity: 0, transform: [{ translateY: -SPACE.lg }] });
    expect(spring).toHaveBeenCalledWith(0, springConfig('move', 'normal'));
    expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'normal'));

    const exiting = (layer.props.exiting as () => Reanimated.LayoutAnimation)();
    expect(exiting.animations).toEqual({ opacity: 0, transform: [{ translateY: SPACE.lg }] });
    expect(timing).toHaveBeenCalledWith(0, timingConfig('fast'));
    jest.restoreAllMocks();
  });

  it('여러 포털을 동시에 등록할 수 있다', async () => {
    const { getByText } = await render(
      <PortalProvider>
        <ZSPortal isFocused>
          <Text>Portal 1</Text>
        </ZSPortal>
        <ZSPortal isFocused>
          <Text>Portal 2</Text>
        </ZSPortal>
      </PortalProvider>
    );

    expect(getByText('Portal 1')).toBeTruthy();
    expect(getByText('Portal 2')).toBeTruthy();
  });
});

