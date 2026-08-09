/**
 * Multi-platform Thumbnail Frame Extractor Helper
 * Generates 3 frame options for YouTube, Instagram Reels, Google Drive, and MP4 videos.
 * Uses images.weserv.nl CORS proxy for Instagram to bypass Referrer/CORS blocking.
 */

// Helper to extract YouTube ID
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

// Helper to extract Instagram Shortcode / ID
export const extractInstagramId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/);
  return match ? match[1] : null;
};

// Helper to extract Google Drive File ID
export const extractDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  return match ? match[1] : null;
};

// Helper to get CORS-friendly Instagram thumbnail options via weserv.nl proxy
export const getInstagramThumbnail = (url) => {
  const match = url ? url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/) : null;
  if (!match || !match[1]) return null;
  const shortcode = match[1];

  return {
    cover: `https://images.weserv.nl/?url=https://instagram.com/p/${shortcode}/media/?size=l`,
    medium: `https://images.weserv.nl/?url=https://instagram.com/p/${shortcode}/media/?size=m`,
    thumb: `https://images.weserv.nl/?url=https://instagram.com/p/${shortcode}/media/?size=t`
  };
};

/**
 * Returns an array of 3 thumbnail frame options for a given video URL
 * @param {string} videoUrl 
 * @returns {Array<{ id: number, label: string, url: string }>}
 */
export const getThumbnailOptions = (videoUrl) => {
  if (!videoUrl || typeof videoUrl !== 'string') return [];
  const cleanUrl = videoUrl.trim();

  // 1. YouTube Video
  const ytId = extractYouTubeId(cleanUrl);
  if (ytId) {
    return [
      { id: 1, label: 'Frame 1 (Start)', url: `https://img.youtube.com/vi/${ytId}/hq1.jpg` },
      { id: 2, label: 'Frame 2 (Middle)', url: `https://img.youtube.com/vi/${ytId}/hq2.jpg` },
      { id: 3, label: 'Frame 3 (End)', url: `https://img.youtube.com/vi/${ytId}/hq3.jpg` }
    ];
  }

  // 2. Instagram Reel / Post
  const igId = extractInstagramId(cleanUrl);
  if (igId) {
    const igThumbs = getInstagramThumbnail(cleanUrl);
    if (igThumbs) {
      return [
        { id: 1, label: 'High-Res Cover', url: igThumbs.cover },
        { id: 2, label: 'Medium Poster', url: igThumbs.medium },
        { id: 3, label: 'Square Thumbnail', url: igThumbs.thumb }
      ];
    }
  }

  // 3. Google Drive Video
  const gdId = extractDriveId(cleanUrl);
  if (gdId) {
    return [
      { id: 1, label: 'High-Res CDN (1000px)', url: `https://lh3.googleusercontent.com/d/${gdId}=s1000` },
      { id: 2, label: 'CORS Proxy Cover', url: `https://images.weserv.nl/?url=https://drive.google.com/thumbnail?id=${gdId}&sz=w1000` },
      { id: 3, label: 'Direct Preview (w800)', url: `https://drive.google.com/thumbnail?id=${gdId}&sz=w800` }
    ];
  }

  // 4. Local MP4 or generic URL
  if (cleanUrl.endsWith('.mp4') || cleanUrl.includes('/videos/')) {
    const base = cleanUrl.replace(/#t=[\d.]+$/, '');
    return [
      { id: 1, label: 'Frame at 0.5s', url: `${base}#t=0.5` },
      { id: 2, label: 'Frame at 1.5s', url: `${base}#t=1.5` },
      { id: 3, label: 'Frame at 3.0s', url: `${base}#t=3.0` }
    ];
  }

  return [];
};
