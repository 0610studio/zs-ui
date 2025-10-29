import { TextProps } from "react-native/types";
import { useTheme } from "../../context/ThemeContext";
import { TypoOptions, TypoStyle, TypoColorOptions, TypoSubStyle, TypoColor, SubColorOptions } from "../../theme/types";
import TextAtom from "../atoms/TextAtom"

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
    const [c01, c02] = color.split('.') as [TypoColor, SubColorOptions];
    return <TextAtom {...props} style={[typography[s01][s02], { color: c02 ? palette[c01][c02] : palette.text[c01] }, props.style]}>{props.children}</TextAtom>
}

export default ZSText;
