export function stringToColor(
  str: string,
  brightness: number = 255,
  saturation: number = 255,
  baseColor: string = '#814BD0',
): string {
  const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const match = baseColor.match(hexRegex);
  if (!match) {
    throw new Error('Invalid color format');
  }

  if (!str?.length) str = '';

  const [, r, g, b] = match.map((component) => parseInt(component, 16));

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    value += (brightness / 256) * (Math.random() - 0.5);
    value = Math.max(Math.min(value, 255), 0);
    const component = value * (saturation / 256);
    const base = [r, g, b][i];
    const result = Math.round((component + base) / 2);
    color += ('00' + result.toString(16)).substr(-2);
  }

  return color;
}
