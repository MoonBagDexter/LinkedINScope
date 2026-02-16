const SETTINGS_KEY = 'linkedinscope_settings';

export interface GlobalSettings {
  siteUrl: string;
  twitterHandle: string;
  defaultCA: string;
}

const defaults: GlobalSettings = { siteUrl: '', twitterHandle: '@LinkedInScope', defaultCA: '' };

export function getSettings(): GlobalSettings {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return defaults; }
}

export function saveSettings(s: GlobalSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event('settings-updated'));
}
