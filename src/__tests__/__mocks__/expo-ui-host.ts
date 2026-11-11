import React from 'react';

export function host(name: string) {
  const Host = (props: Record<string, unknown> & { children?: React.ReactNode }) => React.createElement(name, props, props.children);
  Host.displayName = name;
  return Host;
}

export function compound<S extends string>(name: string, slots: readonly S[]) {
  const slotComponents = Object.fromEntries(slots.map((slot) => [slot, host(`${name}.${slot}`)])) as Record<S, ReturnType<typeof host>>;
  return Object.assign(host(name), slotComponents);
}
