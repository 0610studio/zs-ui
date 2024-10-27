import { ThemeFonts, TypographyVariantsProps } from "./types";

export default function typography({ themeFonts }: { themeFonts?: ThemeFonts }): TypographyVariantsProps {
    return {
        themeFonts: themeFonts,
        heading: {
            1: {
                fontSize: 64,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            2: {
                fontSize: 48,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            3: {
                fontSize: 32,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            4: {
                fontSize: 24,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            5: {
                fontSize: 20,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            6: {
                fontSize: 18,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            }
        },
        title: {
            1: {
                fontSize: 16,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            },
            2: {
                fontSize: 14,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            },
            3: {
                fontSize: 12,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            },
            4: {
                fontSize: 10,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            },
            5: {
                fontSize: 9,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            },
            6: {
                fontSize: 8,
                fontFamily: themeFonts?.[800],
                letterSpacing: 1
            }
        },
        subTitle: {
            1: {
                fontSize: 16,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            2: {
                fontSize: 14,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            3: {
                fontSize: 12,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            4: {
                fontSize: 10,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            5: {
                fontSize: 9,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            },
            6: {
                fontSize: 8,
                fontFamily: themeFonts?.[700],
                letterSpacing: 1
            }
        },
        label: {
            1: {
                fontSize: 16,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            2: {
                fontSize: 14,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            3: {
                fontSize: 13,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            4: {
                fontSize: 12,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            5: {
                fontSize: 11,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            },
            6: {
                fontSize: 10,
                fontFamily: themeFonts?.[600],
                letterSpacing: 1
            }
        },
        body: {
            1: {
                fontSize: 16,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            2: {
                fontSize: 14,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            3: {
                fontSize: 13,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            4: {
                fontSize: 12,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            5: {
                fontSize: 11,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            6: {
                fontSize: 10,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            }
        },
        caption: {
            1: {
                fontSize: 12,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            2: {
                fontSize: 11,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            3: {
                fontSize: 10,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            4: {
                fontSize: 9,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            5: {
                fontSize: 8,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            },
            6: {
                fontSize: 7,
                fontFamily: themeFonts?.[400],
                letterSpacing: 1
            }
        },
    }
}
