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
      label: '테마',
      collapsed: false,
      items: [
        'Provider/ThemeProvider',
        'Theme/colors',
        'Theme/typography',
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
            'UiComponent/ZSBox',
            'UiComponent/ZSCard',
            'UiComponent/ZSPressable',
            'UiComponent/ZSButton',
          ],
        },
        {
          type: 'category',
          label: '입력과 선택',
          collapsed: true,
          items: [
            'UiComponent/ZSTextField',
            'UiComponent/ZSSelect',
            'UiComponent/ZSCheckbox',
            'UiComponent/ZSRadioGroup',
            'UiComponent/ZSSwitch',
            'UiComponent/ZSSegmentedControl',
            'UiComponent/ZSSegmentedPages',
          ],
        },
        {
          type: 'category',
          label: '탐색과 피드백',
          collapsed: true,
          items: [
            'UiComponent/ZSChip',
            'UiComponent/ZSMenu',
            'UiComponent/ZSBanner',
            'UiComponent/ZSTooltip',
          ],
        },
        {
          type: 'category',
          label: '화면과 효과',
          collapsed: true,
          items: [
            'UiComponent/ZSScreen',
            'UiComponent/ZSKeyboardStickyView',
            'UiComponent/ZSSkeleton',
            'UiComponent/ZSBorderBeam',
            'UiComponent/ZSCalendar',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '오버레이',
      collapsed: true,
      items: [
        'OverlayComponent/start',
        'OverlayComponent/Alert',
        'OverlayComponent/BottomSheet',
        'OverlayComponent/Snackbar',
        'OverlayComponent/Loader',
        'OverlayComponent/ZSPortal',
      ],
    },
    {
      type: 'category',
      label: '레이아웃',
      collapsed: true,
      items: [
        'Layout/LayoutProvider',
        'Layout/useWindowLayout',
        'Layout/useDisplayFeatures',
        'Layout/ZSPaneLayout',
        'Layout/ZSTopBar',
      ],
    },
    {
      type: 'category',
      label: '내비게이션',
      collapsed: true,
      items: ['Navigation/ZSTabNavigator', 'Navigation/Stack'],
    },
  ],
};

export default sidebars;
