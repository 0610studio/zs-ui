import React from 'react';

export function requireNativeView(_module: string, name: string) {
  const NativeView = (props: Record<string, unknown> & { children?: React.ReactNode }) =>
    React.createElement(name, props, props.children);
  NativeView.displayName = name;
  return NativeView;
}

export function requireOptionalNativeModule() {
  return null;
}

export function requireNativeModule(name: string) {
  return new Proxy({}, { get: () => jest.fn() }) as Record<string, jest.Mock> & { __name?: string; name?: string } & { toString(): string };
}
