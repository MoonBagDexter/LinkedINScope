import { getSettings } from '../hooks/useSettings';

export function forceShareOnX(jobTitle: string, employerName: string, coinPhrase?: string) {
  const settings = getSettings();
  const ca = settings.defaultCA;
  const handle = settings.twitterHandle || '@LinkedInScope';

  // No dashes anywhere
  const cleanTitle = jobTitle.replace(/[-–—]/g, ' ').trim();
  const cleanEmployer = employerName.replace(/[-–—]/g, ' ').trim();
  const cleanPhrase = (coinPhrase || '').replace(/[-–—]/g, ' ').trim();

  let text = `I just applied to ${cleanTitle} at ${cleanEmployer} using $LinkedInScope`;
  if (cleanPhrase) text += ` ${cleanPhrase}`;
  text += `\n\n${handle}`;
  if (ca) text += `\nCA: ${ca}`;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
