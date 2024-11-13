import React from 'react';

export default function ExpoSnack({ 
  id, 
  platform = 'web', 
  preview = true, 
  theme = 'light',
  isEmbedded = true,
}) {
  const url = new URL(`https://snack.expo.dev${isEmbedded ? '/embedded' : ''}/${id}`);
  url.searchParams.set('platform', platform);
  url.searchParams.set('preview', String(preview));
  url.searchParams.set('theme', theme);
  
  return (
    <div>
      <iframe
        src={url.toString()}
        style={{
          width: '100%',
          height: 600,
          border: '1px solid #eee',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
        loading="lazy"
      />
    </div>
  );
}
