/**
 * Utility functions for parsing YouTube, Instagram, Google Drive, and MP4 video URLs.
 * Handles automatic first-frame thumbnail extraction and embed URL cleaning.
 */

// 1. Extract YouTube Video ID from watch, shorts, or youtu.be links
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

// 2. Extract Instagram Reel or Post ID
export const extractInstagramId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/);
  return match ? match[1] : null;
};

// 3. Extract Google Drive File ID
export const extractDriveId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)|docs\.google\.com\/.*[?&]id=)([\w-]+)/);
  return match ? match[1] : null;
};

// 4. Get Google Drive High-Res Thumbnail URL
export const getDriveThumbnail = (driveId) => {
  if (!driveId) return null;
  return `https://lh3.googleusercontent.com/d/${driveId}=s1000`;
};

// 5. Get YouTube High-Res Thumbnail URL
export const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// 6. Get Instagram High-Res Poster Image URL
export const getInstagramThumbnail = (igId) => {
  if (!igId) return null;
  return `https://www.instagram.com/p/${igId}/media/?size=l`;
};

// 7. Format MP4 URL with First-Frame Seek (#t=0.5)
export const formatMp4FrameUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('#t=')) return url;
  return `${url}#t=0.5`;
};

// 8. Format any custom thumbnail URL (Google Drive, Instagram, direct URL) into a valid direct image link
export const formatThumbnailUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();

  // A. Google Drive Link (file/d/..., open?id=..., etc.)
  const gdId = extractDriveId(clean);
  if (gdId && !clean.includes('lh3.googleusercontent.com')) {
    return `https://lh3.googleusercontent.com/d/${gdId}=s1000`;
  }

  // B. Instagram link
  if (clean.includes('instagram.com') && !clean.includes('weserv.nl')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
  }

  return clean;
};

// 8. Get Comprehensive Video Embed and Thumbnail Information
export const getVideoEmbedInfo = (url, fallbackPath = '') => {
  const cleanUrl = (url || fallbackPath || '').trim();

  // A. YouTube Video
  const ytId = extractYouTubeId(cleanUrl);
  if (ytId) {
    const isShorts = cleanUrl.includes('/shorts/');
    return {
      type: 'youtube',
      id: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
      backgroundEmbedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&autohide=1&modestbranding=1&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      defaultAspect: isShorts ? '9:16' : '16:9'
    };
  }

  // B. Instagram Reel / Post
  const igId = extractInstagramId(cleanUrl);
  if (igId) {
    return {
      type: 'instagram',
      id: igId,
      embedUrl: `https://www.instagram.com/p/${igId}/embed/?utm_source=ig_embed`,
      backgroundEmbedUrl: `https://www.instagram.com/p/${igId}/embed/?utm_source=ig_embed`,
      thumbnailUrl: getInstagramThumbnail(igId),
      defaultAspect: '9:16'
    };
  }

  // C. Google Drive Video
  const gdId = extractDriveId(cleanUrl);
  if (gdId) {
    return {
      type: 'gdrive',
      id: gdId,
      embedUrl: `https://drive.google.com/file/d/${gdId}/preview`,
      backgroundEmbedUrl: `https://drive.google.com/file/d/${gdId}/preview`,
      thumbnailUrl: getDriveThumbnail(gdId),
      defaultAspect: '9:16'
    };
  }

  // D. Direct MP4 or local video asset
  const framedMp4Url = formatMp4FrameUrl(cleanUrl);
  return {
    type: 'mp4',
    id: null,
    embedUrl: cleanUrl,
    backgroundEmbedUrl: cleanUrl,
    framedUrl: framedMp4Url,
    thumbnailUrl: cleanUrl.endsWith('.mp4') ? framedMp4Url : cleanUrl,
    defaultAspect: '9:16'
  };
};
