import { screen } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';

export function nth<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) {
    throw new Error(`${index}번째 요소가 없다 — ${list.length}개다`);
  }
  return item;
}

export function queryAllByHostType(type: string, root: TestInstance = screen.container): TestInstance[] {
  return root.queryAll((node) => node.type === type);
}

export function getByHostType(type: string, root: TestInstance = screen.container): TestInstance {
  const found = queryAllByHostType(type, root);
  if (found.length !== 1) {
    throw new Error(`host 요소 '${type}' 가 ${found.length}개다 — 1개여야 한다`);
  }
  return nth(found, 0);
}

export function queryAllByHostProps(props: Record<string, unknown>, root: TestInstance = screen.container): TestInstance[] {
  return root.queryAll((node) => Object.entries(props).every(([key, value]) => node.props[key] === value));
}

export function getByHostProps(props: Record<string, unknown>, root: TestInstance = screen.container): TestInstance {
  const found = queryAllByHostProps(props, root);
  if (found.length !== 1) {
    throw new Error(`props ${JSON.stringify(props)} 인 host 요소가 ${found.length}개다 — 1개여야 한다`);
  }
  return nth(found, 0);
}
