import * as React from 'react';

import { ZsUiViewProps } from './ZsUi.types';

export default function ZsUiView(props: ZsUiViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
