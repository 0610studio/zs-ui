import React from 'react';
import { host } from './expo-ui-host';

export const BlurView = host('BlurView');
export const BlurTargetView = React.forwardRef((props: any, ref: any) =>
  React.createElement('BlurTargetView', { ...props, ref, forwardedRef: ref }, props.children),
);
