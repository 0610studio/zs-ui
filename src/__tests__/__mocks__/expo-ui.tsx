import { compound, host } from './expo-ui-host';

export const Host = host('Host');
export const Switch = host('Switch');
export const Checkbox = host('Checkbox');
export const Picker = Object.assign(host('Picker'), { Item: host('Picker.Item') });

export default { Host, Switch, Checkbox, Picker, compound };
