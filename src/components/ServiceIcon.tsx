import {
  Building2,
  Snowflake,
  Zap,
  WashingMachine,
  Cog,
  DoorClosed,
} from 'lucide-react';

const map = {
  ac: Snowflake,
  electrical: Zap,
  lift: DoorClosed,
  appliances: WashingMachine,
  motor: Cog,
  commercial: Building2,
} as const;

type Props = {
  type: keyof typeof map;
  size?: number;
  className?: string;
};

export function ServiceIcon({ type, size = 28, className }: Props) {
  const Icon = map[type];
  return <Icon size={size} className={className} strokeWidth={2} />;
}
