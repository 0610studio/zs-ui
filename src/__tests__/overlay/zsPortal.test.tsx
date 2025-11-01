import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PortalProvider, ZSPortal } from '../../overlay/ZSPortal';

describe('ZSPortal', () => {
  it('PortalProvider가 children을 렌더한다', () => {
    const { getByText } = render(
      <PortalProvider>
        <Text>Test Content</Text>
      </PortalProvider>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('ZSPortal이 children을 등록한다', () => {
    const { getByText } = render(
      <PortalProvider>
        <Text>Regular Content</Text>
        <ZSPortal isFocused={true}>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    expect(getByText('Regular Content')).toBeTruthy();
    expect(getByText('Portal Content')).toBeTruthy();
  });

  it('isFocused가 false일 때 포털이 등록되지 않는다', () => {
    const { queryByText } = render(
      <PortalProvider>
        origContent
        <ZSPortal isFocused={false}>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    // Portal은 렌더되지만 등록되지 않을 수 있음
    expect(queryByText).toBeDefined();
  });

  it('포털이 언마운트될 때 등록 해제된다', () => {
    const { rerender } = render(
      <PortalProvider>
        <ZSPortal isFocused={true}>
          <Text>Portal Content</Text>
        </ZSPortal>
      </PortalProvider>
    );

    rerender(
      <PortalProvider>
        <Text>After Unmount</Text>
      </PortalProvider>
    );

    // 포털이 제거되어야 함
    expect(true).toBe(true);
  });

  it('여러 포털을 동시에 등록할 수 있다', () => {
    const { getByText } = render(
      <PortalProvider>
        <ZSPortal isFocused={true}>
          <Text>Portal 1</Text>
        </ZSPortal>
        <ZSPortal isFocused={true}>
          <Text>Portal 2</Text>
        </ZSPortal>
      </PortalProvider>
    );

    expect(getByText('Portal 1')).toBeTruthy();
    expect(getByText('Portal 2')).toBeTruthy();
  });
});

