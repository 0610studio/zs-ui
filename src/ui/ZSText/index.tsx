import React from "react";
import { TextProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { TypoColorOptions, TypoOptions, TypoStyle, TypoSubStyle } from "../../theme/types";
import { resolveTextColor } from "../../theme/resolveColor";
import TextAtom from "../atoms/TextAtom";

export interface ZSTextProps extends TextProps {
  typo?: TypoOptions;
  color?: TypoColorOptions;
}

function ZSText({
  typo = 'body.2',
  color = 'base',
  ...props
}: ZSTextProps) {
  const { palette, typography } = useTheme();
  const [s01, s02] = typo.split('.') as [TypoStyle, TypoSubStyle];
  const textColor = resolveTextColor(palette, color);

  return (
    <TextAtom {...props} style={[typography[s01][s02], { color: textColor }, props.style]}>
      {props.children}
    </TextAtom>
  );
}

export default React.memo(ZSText);
