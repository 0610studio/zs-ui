import React from 'react';

const host = (name: string) => ({ children, ...props }: any) => React.createElement(name, props, children);
const textHost = (name: string) => ({ children, ...props }: any) => React.createElement(name, { ...props, text: children });

const Trigger = Object.assign(host('NativeTabs.Trigger'), {
  Icon: host('NativeTabs.Trigger.Icon'),
  Label: textHost('NativeTabs.Trigger.Label'),
  Badge: textHost('NativeTabs.Trigger.Badge'),
});

export const NativeTabs = Object.assign(host('NativeTabs'), { Trigger, BottomAccessory: host('NativeTabs.BottomAccessory') });
