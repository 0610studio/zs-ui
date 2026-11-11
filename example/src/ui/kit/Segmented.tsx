import { ZSSegmentedControl } from '@0610studio/zs-ui';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onValueChange: (value: T) => void;
  testID?: string;
};

export default function Segmented<T extends string>({ options, value, onValueChange, testID }: Props<T>) {
  return (
    <ZSSegmentedControl
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
      onValueChange={onValueChange}
      testID={testID}
    />
  );
}
