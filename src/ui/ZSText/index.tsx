import React, { memo } from 'react';
import { TextProps } from "react-native/types";
import { useTheme } from "../../model/useThemeProvider";
import { TypoOptions, TypoStyle, TextColorOptions, TypoSubStyle } from "../../theme/types";
import TextAtom from "../atoms/TextAtom"

export interface ZSTextProps extends TextProps {
    typo?: TypoOptions;
    color?: TextColorOptions;
}

function ZSText({
  typo = 'body.2',
  color = 'primary',
  ...props
}: ZSTextProps) {
    const { palette, typography } = useTheme();
    const [s01, s02] = typo.split('.') as [TypoStyle, TypoSubStyle];
    return <TextAtom {...props} style={[typography[s01][s02], { color: palette.text[color] }, props.style]}>{props.children}</TextAtom>
}

export default memo(ZSText);
