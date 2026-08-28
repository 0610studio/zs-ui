import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'doc',
      id: 'Provider/start',
      label: '시작하기',
    },
    {
      type: 'category',
      label: '설정과 테마',
      collapsed: false,
      items: [
        'Provider/ThemeProvider',
        'Provider/OverlayProvider',
        'Theme/start',
        'Theme/palette',
        'Theme/typography',
        'Theme/themefactory',
        'Theme/tokens',
      ],
    },
    {
      type: 'category',
      label: 'UI 컴포넌트',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: '기본 요소',
          collapsed: false,
          items: [
            'UiComponent/ZSText',
            'UiComponent/ZSView',
            'UiComponent/ZSPressable',
            'UiComponent/ZSBlockButton',
            'UiComponent/TextAtom',
            'UiComponent/AnimatedWrapper',
          ],
        },
        {
          type: 'category',
          label: '입력과 선택',
          collapsed: true,
          items: [
            'UiComponent/ZSTextField',
            'UiComponent/ZSDropdown',
            'UiComponent/ZSCheckBox',
            'UiComponent/ZSRadioGroup',
            'UiComponent/ZSSwitch',
            'UiComponent/ZSSegmented',
          ],
        },
        {
          type: 'category',
          label: '탐색과 피드백',
          collapsed: true,
          items: [
            'UiComponent/ZSTab',
            'UiComponent/ZSChip',
            'UiComponent/ZSMessageBar',
            'UiComponent/ZSTooltip',
            'UiComponent/ErrorComponent',
          ],
        },
        {
          type: 'category',
          label: '화면과 효과',
          collapsed: true,
          items: [
            'UiComponent/ZSContainer',
            'UiComponent/ZSAboveKeyboard',
            'UiComponent/ZSSkeleton',
            'UiComponent/ZSBorderBeam',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Overlay',
      collapsed: true,
      items: [
        'OverlayComponent/start',
        'OverlayComponent/Alert',
        'OverlayComponent/BottomSheet',
        'OverlayComponent/Snackbar',
        'OverlayComponent/Loader',
        'OverlayComponent/PopOver',
        'OverlayComponent/Modality',
        'OverlayComponent/ZSPortal',
        'OverlayComponent/GlobalOverlay',
      ],
    },
    {
      type: 'category',
      label: '고급 기능',
      collapsed: true,
      items: ['FoldableDevice'],
    },
    {
      type: 'doc',
      id: 'Playground',
      label: 'Playground',
    },
  ],
};

export default sidebars;
