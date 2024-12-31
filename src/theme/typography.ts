import { ThemeFonts, TypographyVariantsProps } from "./types";

const baseSize = 1;

export default function typography({ themeFonts }: { themeFonts?: ThemeFonts }): TypographyVariantsProps {
    return {
        themeFonts: themeFonts,
        heading: {
            1: {
                fontSize: baseSize + 36,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 32,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 28,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 24,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 20,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 18,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            }
        },
        title: {
            1: {
                fontSize: baseSize + 16,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 14,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 13,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 12,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 11,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 10,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            }
        },
        subTitle: {
            1: {
                fontSize: baseSize + 16,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 14,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 13,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 12,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 11,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 10,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            }
        },
        label: {
            1: {
                fontSize: baseSize + 16,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 14,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 13,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 12,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 11,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 10,
                fontFamily: themeFonts?.[500],
                letterSpacing: 1
            }
        },
        body: {
            1: {
                fontSize: baseSize + 16,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 14,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 13,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 12,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 11,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 10,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            }
        },
        caption: {
            1: {
                fontSize: baseSize + 12,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            2: {
                fontSize: baseSize + 11,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            3: {
                fontSize: baseSize + 10,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            4: {
                fontSize: baseSize + 9,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            5: {
                fontSize: baseSize + 8,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            6: {
                fontSize: baseSize + 7,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            }
        },
    }
}
