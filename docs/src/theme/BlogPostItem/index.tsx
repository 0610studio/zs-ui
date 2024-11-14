import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type { WrapperProps } from '@docusaurus/types';
import { useColorMode } from '@docusaurus/theme-common';
import { useLocation } from '@docusaurus/router';
import Giscus from '@giscus/react';

type Props = WrapperProps<typeof BlogPostItemType>;

export default function BlogPostItemWrapper(props: Props): JSX.Element {
  const { colorMode } = useColorMode();
  const { pathname } = useLocation();

  return (
    <>
      <BlogPostItem {...props} />
      {pathname.includes('/blog/') && (
        <Giscus
          repo="0610studio/zs-ui"
          repoId="R_kgDONGZoiw"
          category="Announcements"
          categoryId="DIC_kwDONGZoi84CkQHK"
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="bottom"
          theme={colorMode === 'dark' ? 'dark' : 'light'}
          data-theme="preferred_color_scheme"
          lang="ko"
          loading="lazy"
        />
      )}
    </>
  );
}