import {
  Building2,
  Snowflake,
  Zap,
  WashingMachine,
  Cog,
  DoorClosed,
} from 'lucide-react';
import {
  isBuiltInServiceIcon,
  type BuiltInServiceIconId,
  type ServiceIconId,
} from '../data/services';

const map: Record<BuiltInServiceIconId, typeof Snowflake> = {
  ac: Snowflake,
  electrical: Zap,
  lift: DoorClosed,
  appliances: WashingMachine,
  motor: Cog,
  commercial: Building2,
};

type Props = {
  type: ServiceIconId;
  size?: number;
  className?: string;
};

export function ServiceIcon({ type, size = 28, className }: Props) {
  if (!isBuiltInServiceIcon(type)) {
    return (
      <img
        src={type}
        alt=""
        width={size}
        height={size}
        className={className ? `service-icon-img ${className}` : 'service-icon-img'}
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const Icon = map[type];
  return <Icon size={size} className={className} strokeWidth={2} />;
}
