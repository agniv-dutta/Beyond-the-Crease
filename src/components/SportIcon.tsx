import type { SVGProps } from 'react';
import { Circle, CircleDot, CircleDotDashed, Hexagon, Timer } from 'lucide-react';

/**
 * The dataset stores icon names as plain strings so it stays serialisable and
 * transferable to a real API. This is where the name becomes a glyph — no other
 * module should ever render a sport's `icon` field as text.
 */
const ICONS: Record<string, typeof Circle> = {
  'circle-dot': CircleDot,
  circle: Circle,
  'circle-dot-dashed': CircleDotDashed,
  hexagon: Hexagon,
  timer: Timer,
};

export function SportIcon({
  name,
  className,
  ...rest
}: { name: string } & SVGProps<SVGSVGElement>) {
  const Icon = ICONS[name] ?? Circle;
  return <Icon aria-hidden focusable="false" className={className} {...rest} />;
}
