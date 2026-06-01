import React from "react";
import { TextProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ColorPalette, ThemeTextType, TypoOptions, TypoStyle, TypoColorOptions, TypoSubStyle, ThemeBackground } from "../../theme/types";
import TextAtom from "../atoms/TextAtom"

type SemanticPaletteKey = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'information' | 'grey';
type PaletteShade = keyof ColorPalette;

function isColorMap(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null;
}

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
    const [c01, c02] = color.split('.') as [string, string | undefined];
    const textColor = (() => {
      if (!c02) return palette.text[c01 as keyof ThemeTextType];
      if (c01 === 'text') return palette.text[c02 as keyof ThemeTextType];
      if (c01 === 'background') return palette.background[c02 as keyof ThemeBackground];

      const semanticPalette = palette[c01 as SemanticPaletteKey];
      return isColorMap(semanticPalette) ? semanticPalette[c02 as PaletteShade] : undefined;
    })();

    return <TextAtom {...props} style={[typography[s01][s02], { color: textColor }, props.style]}>{props.children}</TextAtom>
}

export default ZSText;
