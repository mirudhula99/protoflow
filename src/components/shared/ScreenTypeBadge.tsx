import { Badge } from '@/components/ui/badge';
import { getScreenTypeConfig } from '@/lib/constants';
import type { ScreenType } from '@/types/project';

interface ScreenTypeBadgeProps {
  type: ScreenType;
  className?: string;
}

export function ScreenTypeBadge({ type, className }: ScreenTypeBadgeProps) {
  const config = getScreenTypeConfig(type);
  return (
    <Badge
      variant="outline"
      className={className}
      style={{ borderColor: config.color, color: config.color }}
    >
      {config.label}
    </Badge>
  );
}
