const COLORS = [
  '#E53E3E', // red
  '#DD6B20', // orange
  '#D69E2E', // gold
  '#38A169', // green
  '#319795', // teal
  '#3182CE', // blue
  '#5A67D8', // indigo
  '#805AD5', // purple
  '#D53F8C', // rose
  '#6B7C3F', // olive
];

export function getCompanyColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function getCompanyInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
