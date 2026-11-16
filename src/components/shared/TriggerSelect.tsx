import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRIGGER_TYPES } from '@/lib/constants';
import type { TriggerType } from '@/types/project';

interface TriggerSelectProps {
  value: TriggerType;
  onValueChange: (value: TriggerType) => void;
}

export function TriggerSelect({ value, onValueChange }: TriggerSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as TriggerType)}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue placeholder="Select trigger type" />
      </SelectTrigger>
      <SelectContent>
        {TRIGGER_TYPES.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
