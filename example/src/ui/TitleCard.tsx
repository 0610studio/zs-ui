import { ViewProps } from "react-native";
import { ZSText, ZSView } from "zs-ui";
import { useTheme } from "zs-ui/model/useThemeProvider";

type Props = ViewProps & {
  title?: string;
  gap?: number;
};

export default function TitleCard({
  title,
  gap = 10,
  children
}: Props) {
  const { palette: { background } } = useTheme();

  return (
    <ZSView style={{ backgroundColor: background.layer2 }}>
      {
        title && <ZSText typo="heading.3" style={{ marginBottom: 15 }}>{title}</ZSText>
      }

      <ZSView style={{ flexWrap: 'wrap', flexDirection: 'row', gap: gap, backgroundColor: background.base, padding: 14, borderRadius: 14 }}>
        {children}
      </ZSView>
    </ZSView>
  )
}