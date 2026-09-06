/**
 * Cache buster key generated once per session load.
 * This ensures the image is fetched fresh from the server on page refresh,
 * but avoids redundant reloading/flickering during component re-renders.
 */
const sessionCacheBuster = Date.now();

/**
 * Normalizes and formats the avatar URL, adding a cache-busting parameter for local assets.
 */
export const getAvatarSrc = (avatarUrl: string): string => {
  if (!avatarUrl) return '';
  if (
    avatarUrl.startsWith('data:') || 
    avatarUrl.startsWith('http://') || 
    avatarUrl.startsWith('https://')
  ) {
    return avatarUrl;
  }
  // Local path: append cache buster
  const separator = avatarUrl.includes('?') ? '&' : '?';
  return `${avatarUrl}${separator}t=${sessionCacheBuster}`;
};
