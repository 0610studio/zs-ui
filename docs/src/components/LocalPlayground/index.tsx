import { useState, type CSSProperties } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

type LocalExample =
  | 'Alert'
  | 'AnimatedWrapper'
  | 'BottomSheet'
  | 'Catalog'
  | 'ErrorComponent'
  | 'FoldableDevice'
  | 'GlobalOverlay'
  | 'Loader'
  | 'Modality'
  | 'Overlay'
  | 'OverlayProvider'
  | 'PopOver'
  | 'Snackbar'
  | 'TextAtom'
  | 'Theme'
  | 'ThemeProvider'
  | 'WebExample'
  | 'ZSAboveKeyboard'
  | 'ZSBlockButton'
  | 'ZSBorderBeam'
  | 'ZSCalendar'
  | 'ZSCheckBox'
  | 'ZSChip'
  | 'ZSContainer'
  | 'ZSDropdown'
  | 'ZSMessageBar'
  | 'ZSPortal'
  | 'ZSPressable'
  | 'ZSRadioGroup'
  | 'ZSSegmented'
  | 'ZSSkeleton'
  | 'ZSSwitch'
  | 'ZSTab'
  | 'ZSText'
  | 'ZSTextField'
  | 'ZSTooltip'
  | 'ZSView';

type LocalExampleMetadata = {
  route: string;
  sourceFile: string;
};

type LocalPlaygroundProps = {
  example: LocalExample;
  height?: number;
  title?: string;
};

const LOCAL_EXAMPLES: Record<LocalExample, LocalExampleMetadata> = {
  Alert: { route: 'AlertExample', sourceFile: 'AlertExample.tsx' },
  AnimatedWrapper: {
    route: 'PrimitiveExample',
    sourceFile: 'PrimitiveExample.tsx',
  },
  BottomSheet: { route: 'BottomSheetExample', sourceFile: 'BottomSheetExample.tsx' },
  Catalog: { route: '', sourceFile: 'index.tsx' },
  ZSCalendar: { route: 'ZSCalendarExample', sourceFile: 'ZSCalendarExample.tsx' },
  ErrorComponent: {
    route: 'PrimitiveExample',
    sourceFile: 'PrimitiveExample.tsx',
  },
  FoldableDevice: { route: 'FoldableDevice', sourceFile: 'FoldableDevice.tsx' },
  GlobalOverlay: {
    route: 'GlobalOverlayExample',
    sourceFile: 'GlobalOverlayExample.tsx',
  },
  Loader: { route: 'LoaderExample', sourceFile: 'LoaderExample.tsx' },
  Modality: { route: 'ModalityExample', sourceFile: 'ModalityExample.tsx' },
  Overlay: { route: 'OverlayExample', sourceFile: 'OverlayExample.tsx' },
  OverlayProvider: {
    route: 'OverlayExample',
    sourceFile: 'OverlayExample.tsx',
  },
  PopOver: { route: 'PopOverExample', sourceFile: 'PopOverExample.tsx' },
  Snackbar: { route: 'SnackbarExample', sourceFile: 'SnackbarExample.tsx' },
  TextAtom: { route: 'PrimitiveExample', sourceFile: 'PrimitiveExample.tsx' },
  Theme: { route: 'ThemeExample', sourceFile: 'ThemeExample.tsx' },
  ThemeProvider: { route: 'ThemeExample', sourceFile: 'ThemeExample.tsx' },
  WebExample: { route: 'WebExample', sourceFile: 'WebExample.tsx' },
  ZSAboveKeyboard: {
    route: 'ZSContainerExample',
    sourceFile: 'ZSContainerExample.tsx',
  },
  ZSBlockButton: { route: 'ButtonExample', sourceFile: 'ButtonExample.tsx' },
  ZSBorderBeam: {
    route: 'BorderBeamExample',
    sourceFile: 'BorderBeamExample.tsx',
  },
  ZSCheckBox: { route: 'SelectionExample', sourceFile: 'SelectionExample.tsx' },
  ZSChip: { route: 'ZSChipExample', sourceFile: 'ZSChipExample.tsx' },
  ZSContainer: {
    route: 'ZSContainerExample',
    sourceFile: 'ZSContainerExample.tsx',
  },
  ZSDropdown: {
    route: 'ZSDropdownExample',
    sourceFile: 'ZSDropdownExample.tsx',
  },
  ZSMessageBar: {
    route: 'ZSMessageBarExample',
    sourceFile: 'ZSMessageBarExample.tsx',
  },
  ZSPortal: { route: 'ZSPortalExample', sourceFile: 'ZSPortalExample.tsx' },
  ZSPressable: { route: 'ButtonExample', sourceFile: 'ButtonExample.tsx' },
  ZSRadioGroup: {
    route: 'SelectionExample',
    sourceFile: 'SelectionExample.tsx',
  },
  ZSSegmented: {
    route: 'ZSSegmentedExample',
    sourceFile: 'ZSSegmentedExample.tsx',
  },
  ZSSkeleton: {
    route: 'ZSSkeletonExample',
    sourceFile: 'ZSSkeletonExample.tsx',
  },
  ZSSwitch: { route: 'SwitchExample', sourceFile: 'SwitchExample.tsx' },
  ZSTab: { route: 'ZSTabExample', sourceFile: 'ZSTabExample.tsx' },
  ZSText: { route: 'ZSTextExample', sourceFile: 'ZSTextExample.tsx' },
  ZSTextField: {
    route: 'ZSTextFieldExample',
    sourceFile: 'ZSTextFieldExample.tsx',
  },
  ZSTooltip: { route: 'TooltipExample', sourceFile: 'TooltipExample.tsx' },
  ZSView: { route: 'PrimitiveExample', sourceFile: 'PrimitiveExample.tsx' },
};

const SOURCE_BASE_URL = 'https://github.com/0610studio/zs-ui/blob/main/example/app';

export default function LocalPlayground({ example, height = 640, title }: LocalPlaygroundProps) {
  const { siteConfig } = useDocusaurusContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const metadata = LOCAL_EXAMPLES[example];
  const previewUrl = useBaseUrl(metadata.route ? `playground/${metadata.route}/` : 'playground/');
  const configuredVersion = siteConfig.customFields?.zsUiVersion;
  const version = typeof configuredVersion === 'string' ? configuredVersion : '개발 버전';
  const previewTitle = title ?? `${example} 로컬 웹 예제`;
  const sourceUrl = `${SOURCE_BASE_URL}/${metadata.sourceFile}`;
  const frameStyle = { '--playground-height': `${height}px` } as CSSProperties;

  return (
    <section className={styles.container} data-testid={`local-playground-${example}`}>
      <div className={styles.toolbar}>
        <div className={styles.identity}>
          <span className={styles.status} aria-hidden="true" />
          <strong>앱 예제 Playground</strong>
          <span className={styles.version}>v{version}</span>
        </div>
        <div className={styles.links}>
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            소스 보기
          </a>
          <a href={previewUrl} target="_blank" rel="noreferrer">
            새 창에서 열기
          </a>
        </div>
      </div>
      <div className={styles.previewArea} style={frameStyle}>
        {isLoaded ? (
          <iframe
            className={styles.frame}
            src={previewUrl}
            title={previewTitle}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderEyebrow}>Interactive example</span>
            <strong>{previewTitle}</strong>
            <p>예제를 선택하면 현재 저장소 소스로 만든 Expo Web 화면을 불러옵니다.</p>
            <button type="button" onClick={() => setIsLoaded(true)}>
              예제 불러오기
            </button>
          </div>
        )}
      </div>
      <p className={styles.caption}>웹 미지원 또는 플랫폼 종속 기능은 실제 iOS·Android 앱에서 확인하세요.</p>
    </section>
  );
}
