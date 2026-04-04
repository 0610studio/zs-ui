import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  ArrowUpRight,
  BookOpen,
  Layers3,
  Sparkles,
  TabletSmartphone,
  Type,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './styles.module.css';

type Scene = {
  word: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  accent: string;
  auraLabel: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  principles: string[];
  icon: LucideIcon;
};

const scenes: Scene[] = [
  {
    word: '오버레이 컴포넌트',
    eyebrow: 'Capability 01',
    title: '오버레이 컴포넌트',
    description:
      'Alert, BottomSheet, Snackbar, Loader를 같은 방식으로 다룰 수 있습니다.',
    detail: '화면마다 별도 상태를 반복해서 만들지 않고, 같은 호출 문법으로 피드백과 액션을 연결할 수 있습니다.',
    accent: 'One interaction language for alerts, sheets, snackbars, and loading states.',
    auraLabel: 'Unified overlays',
    stats: [
      { label: 'Alert', value: 'Immediate action' },
      { label: 'BottomSheet', value: 'Layered flow' },
      { label: 'Loader', value: 'Shared feedback' },
    ],
    principles: ['함수 호출 중심의 간결한 제어', '모달 상태 중복 감소', '화면 전반의 피드백 톤 통일'],
    icon: Sparkles,
  },
  {
    word: '타이포그래피 스케일',
    eyebrow: 'Capability 02',
    title: '타이포그래피 스케일',
    description:
      '읽기 좋은 계층을 빠르게 맞출 수 있는 6×6 타이포그래피 스케일을 제공합니다.',
    detail: '헤딩부터 캡션까지 같은 체계 안에서 흐름을 잡아주기 때문에 문서, 설정, 입력 화면 모두 톤을 잃지 않습니다.',
    accent: 'A readable scale that keeps hierarchy sharp without over-designing every screen.',
    auraLabel: 'Readable hierarchy',
    stats: [
      { label: 'Scale', value: '6 × 6' },
      { label: 'Tone', value: 'Consistent rhythm' },
      { label: 'Readability', value: 'Fast alignment' },
    ],
    principles: ['텍스트 계층을 빠르게 정렬', '컴포넌트 전반의 리듬 통일', '가독성과 밀도의 균형 유지'],
    icon: Type,
  },
  {
    word: '폴더블 대응',
    eyebrow: 'Capability 03',
    title: '폴더블 대응',
    description:
      'Android 폴더블의 접힘과 펼침 상태를 감지해 두 화면 레이아웃으로 확장합니다.',
    detail: '기기 형태가 바뀌어도 같은 코드 흐름 안에서 더 넓은 화면 전략을 자연스럽게 연결할 수 있습니다.',
    accent: 'Responsive behavior that expands with the device instead of breaking around it.',
    auraLabel: 'Foldable ready',
    stats: [
      { label: 'Device', value: 'Android foldables' },
      { label: 'Layout', value: 'Dual-screen aware' },
      { label: 'Adaptation', value: 'Continuous' },
    ],
    principles: ['접힘/펼침 상태 감지', '넓은 화면에 맞는 전개', '기기 변화에도 유지되는 경험'],
    icon: TabletSmartphone,
  },
  {
    word: '기본 UI 세트',
    eyebrow: 'Capability 04',
    title: '기본 UI 세트',
    description:
      'Text, View, TextField, Switch, Skeleton 등 기본 UI가 테마와 함께 움직입니다.',
    detail: '자주 쓰는 화면 부품이 같은 규칙 안에 있으면 시각적 일관성과 구현 속도를 동시에 가져갈 수 있습니다.',
    accent: 'Core building blocks that already understand the system they live in.',
    auraLabel: 'System primitives',
    stats: [
      { label: 'Components', value: 'Core essentials' },
      { label: 'Theme', value: 'Shared behavior' },
      { label: 'Speed', value: 'Ready to compose' },
    ],
    principles: ['테마와 함께 움직이는 기본 컴포넌트', '반복 구현을 줄이는 시작점', '제품 전체의 톤을 지키는 기반'],
    icon: BookOpen,
  },
  {
    word: '공통 화면 구조',
    eyebrow: 'Capability 05',
    title: '공통 화면 구조',
    description: 'SafeArea, 스크롤, 상태바, 키보드 대응을 같은 화면 패턴으로 유지합니다.',
    detail: '입력과 스크롤, 상태바와 안전 영역이 한 구조 안에서 정리되기 때문에 화면마다 다른 예외 처리를 줄일 수 있습니다.',
    accent: 'A shared screen foundation for safe areas, keyboard movement, and scrolling rhythm.',
    auraLabel: 'Screen foundation',
    stats: [
      { label: 'SafeArea', value: 'Built in' },
      { label: 'Keyboard', value: 'Tracked flow' },
      { label: 'Scroll', value: 'Consistent pattern' },
    ],
    principles: ['화면 기본 구조를 한 패턴으로 통일', '상태바와 키보드 대응 정리', '반복적인 레이아웃 결정 최소화'],
    icon: Layers3,
  },
];

const LandingPage = () => {
  const { siteConfig } = useDocusaurusContext();
  const [activeScene, setActiveScene] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    let frameId = 0;

    const updateActiveScene = () => {
      frameId = 0;

      const viewportCenter = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((step, index) => {
        if (!step) {
          return;
        }

        const rect = step.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveScene((current) => (current === closestIndex ? current : closestIndex));
    };

    const onScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveScene);
    };

    updateActiveScene();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const scene = scenes[activeScene];
  const SceneIcon = scene.icon;

  return (
    <main className={`${styles.root} ${styles[`theme${activeScene}`]}`}>
      <section className={styles.experience}>
        <div className={styles.stickyViewport}>
          <div className={styles.backdrop} aria-hidden="true">
            <div className={styles.backdropGradient} />
            <div className={styles.backdropMesh} />
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />
            <div className={styles.orbTertiary} />
            <div className={styles.noise} />
          </div>

          <div className={styles.stageFrame}>
            <div className={styles.stageTopRow}>
              <div className={styles.brandChip}>
                <Waves size={15} strokeWidth={2.1} />
                <span>{siteConfig.title}</span>
              </div>

              <div className={styles.sceneChip}>
                <SceneIcon size={15} strokeWidth={2.1} />
                <span>{scene.auraLabel}</span>
              </div>
            </div>

            <div className={styles.centerpiece}>
              <div className={styles.heroWordWrap}>
                <span className={styles.heroEyebrow}>{scene.eyebrow}</span>
                <strong key={scene.word} className={styles.heroWord}>
                  {scene.word}
                </strong>
                <p key={scene.accent} className={styles.heroAccent}>
                  {scene.accent}
                </p>
              </div>

              <div className={styles.centerDock}>
                <div className={styles.centerDockGlow} aria-hidden="true" />
                <div className={styles.centerDockBody}>
                  <p className={styles.centerDockKicker}>Documentation</p>
                  <Link to="/docs/intro" className={styles.centerDockButton}>
                    문서 바로가기
                    <span className={styles.centerDockArrow} aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </span>
                  </Link>
                  <p className={styles.centerDockCaption}>중앙의 액션은 유지하고, 스크롤에는 배경과 철학만 담았습니다.</p>
                </div>
              </div>
            </div>

            <div className={styles.stageFooter}>
              <div className={styles.footerCard}>
                <span className={styles.footerLabel}>Focus</span>
                <strong>{scene.title}</strong>
              </div>
              <div className={styles.footerCard}>
                <span className={styles.footerLabel}>Material</span>
                <strong>Liquid glass surfaces</strong>
              </div>
              <div className={styles.footerCard}>
                <span className={styles.footerLabel}>Action</span>
                <strong>Always ready for docs</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.scrollRail}>
          {scenes.map((item, index) => {
            const ItemIcon = item.icon;
            const isActive = index === activeScene;

            return (
              <section
                key={item.word}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                className={styles.storyStep}
                aria-label={`${item.eyebrow} ${item.title}`}>
                <article className={`${styles.storyCard} ${isActive ? styles.storyCardActive : ''}`}>
                  <div className={styles.storyCardHeader}>
                    <span className={styles.storyIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <div className={styles.storyIcon} aria-hidden="true">
                      <ItemIcon size={18} strokeWidth={2.1} />
                    </div>
                  </div>

                  <div className={styles.storyCopy}>
                    <p className={styles.storyEyebrow}>{item.eyebrow}</p>
                    <h2 className={styles.storyTitle}>{item.title}</h2>
                    <p className={styles.storyDescription}>{item.description}</p>
                    <p className={styles.storyDetail}>{item.detail}</p>
                  </div>

                  <div className={styles.storyMeta}>
                    <div className={styles.storyStats}>
                      {item.stats.map((stat) => (
                        <div key={stat.label} className={styles.statItem}>
                          <span className={styles.statLabel}>{stat.label}</span>
                          <strong className={styles.statValue}>{stat.value}</strong>
                        </div>
                      ))}
                    </div>

                    <ul className={styles.principleList}>
                      {item.principles.map((principle) => (
                        <li key={principle} className={styles.principleItem}>
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
