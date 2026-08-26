import React from 'react';
import { render } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { act } from '@testing-library/react-native';
import { BackHandlerProvider, BackPriority, useBackHandler } from '../../context/BackHandlerContext';

const pressBack = () => (BackHandler as any).mockPressBack() as boolean;

function Handler({
  onBack,
  priority,
  enabled = true,
}: {
  onBack: () => boolean;
  priority?: number;
  enabled?: boolean;
}) {
  useBackHandler(onBack, { priority, enabled });
  return null;
}

describe('BackHandlerContext', () => {
  it('우선순위가 높은 핸들러가 먼저 처리하고, true를 반환하면 아래로 전파되지 않는다', () => {
    const sheet = jest.fn(() => true);
    const overlay = jest.fn(() => true);

    render(
      <BackHandlerProvider>
        <Handler onBack={sheet} priority={BackPriority.SHEET} />
        <Handler onBack={overlay} priority={BackPriority.OVERLAY} />
      </BackHandlerProvider>
    );

    let consumed = false;
    act(() => {
      consumed = pressBack();
    });

    expect(consumed).toBe(true);
    expect(overlay).toHaveBeenCalledTimes(1);
    expect(sheet).not.toHaveBeenCalled();
  });

  it('상위 핸들러가 false를 반환하면 다음 우선순위로 전달된다', () => {
    const sheet = jest.fn(() => true);
    const overlay = jest.fn(() => false);

    render(
      <BackHandlerProvider>
        <Handler onBack={sheet} priority={BackPriority.SHEET} />
        <Handler onBack={overlay} priority={BackPriority.OVERLAY} />
      </BackHandlerProvider>
    );

    act(() => {
      pressBack();
    });

    expect(overlay).toHaveBeenCalledTimes(1);
    expect(sheet).toHaveBeenCalledTimes(1);
  });

  it('같은 우선순위면 나중에 등록된 핸들러(LIFO)가 먼저 처리한다', () => {
    const first = jest.fn(() => true);
    const second = jest.fn(() => true);

    render(
      <BackHandlerProvider>
        <Handler onBack={first} priority={BackPriority.OVERLAY} />
        <Handler onBack={second} priority={BackPriority.OVERLAY} />
      </BackHandlerProvider>
    );

    act(() => {
      pressBack();
    });

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it('enabled=false면 등록되지 않는다', () => {
    const handler = jest.fn(() => true);

    render(
      <BackHandlerProvider>
        <Handler onBack={handler} enabled={false} />
      </BackHandlerProvider>
    );

    let consumed = true;
    act(() => {
      consumed = pressBack();
    });

    expect(consumed).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('언마운트되면 핸들러가 해제된다', () => {
    const handler = jest.fn(() => true);

    const { rerender } = render(
      <BackHandlerProvider>
        <Handler onBack={handler} />
      </BackHandlerProvider>
    );

    rerender(<BackHandlerProvider>{null}</BackHandlerProvider>);

    let consumed = true;
    act(() => {
      consumed = pressBack();
    });

    expect(consumed).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('모든 핸들러가 false를 반환하면 소비하지 않는다 (시스템 back으로 전파)', () => {
    render(
      <BackHandlerProvider>
        <Handler onBack={() => false} priority={BackPriority.SCREEN} />
      </BackHandlerProvider>
    );

    let consumed = true;
    act(() => {
      consumed = pressBack();
    });

    expect(consumed).toBe(false);
  });
});
