import React from "react";
import { TextProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ColorPalette, ThemeTextType, TypoOptions, TypoStyle, TypoColorOptions, TypoSubStyle, TypoColor, SubColorOptions } from "../../theme/types";
import TextAtom from "../atoms/TextAtom"

type SemanticPaletteKey = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'information' | 'grey';
type PaletteShade = Exclude<keyof ColorPalette, 'main'>;

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
    const [c01, c02] = color.split('.') as [TypoColor | keyof ThemeTextType | SemanticPaletteKey, SubColorOptions];
    const textColor = c02
      ? palette[c01 as SemanticPaletteKey][Number(c02) as PaletteShade]
      : palette.text[c01 as keyof ThemeTextType];

    return <TextAtom {...props} style={[typography[s01][s02], { color: textColor }, props.style]}>{props.children}</TextAtom>
}

export default ZSText;
