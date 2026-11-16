import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TemplateId } from '@/types/project';

interface TemplateConfiguratorProps {
  templateId: TemplateId;
  props: Record<string, string | boolean | string[]>;
  onChange: (props: Record<string, string | boolean | string[]>) => void;
}

export function TemplateConfigurator({ templateId, props, onChange }: TemplateConfiguratorProps) {
  const setProp = (key: string, value: string | boolean | string[]) => {
    onChange({ ...props, [key]: value });
  };

  switch (templateId) {
    case 'filter_dropdown':
      return <FilterDropdownConfig props={props} setProp={setProp} />;
    case 'success_toast':
    case 'error_toast':
      return <ToastConfig props={props} setProp={setProp} />;
    case 'confirmation_modal':
      return <ConfirmModalConfig props={props} setProp={setProp} />;
    case 'info_dialog':
      return <InfoDialogConfig props={props} setProp={setProp} />;
    default:
      return null;
  }
}

function FilterDropdownConfig({ props, setProp }: { props: Record<string, string | boolean | string[]>; setProp: (k: string, v: string | boolean | string[]) => void }) {
  const title = (typeof props.title === 'string' ? props.title : 'Filter');
  const options = (Array.isArray(props.options) ? props.options : ['Option 1', 'Option 2', 'Option 3']);
  const multiSelect = (typeof props.multiSelect === 'boolean' ? props.multiSelect : false);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Title</Label>
        <Input value={title} onChange={(e) => setProp('title', e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Options (one per line)</Label>
        <textarea
          className="w-full h-20 text-xs rounded-md border border-border bg-background px-3 py-2 font-mono resize-y"
          value={options.join('\n')}
          onChange={(e) => setProp('options', e.target.value.split('\n').filter(Boolean))}
        />
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={multiSelect} onChange={(e) => setProp('multiSelect', e.target.checked)} className="accent-green-600" />
        Multi-select
      </label>
    </div>
  );
}

function ToastConfig({ props, setProp }: { props: Record<string, string | boolean | string[]>; setProp: (k: string, v: string | boolean | string[]) => void }) {
  const message = (typeof props.message === 'string' ? props.message : '');
  const showIcon = (typeof props.showIcon === 'boolean' ? props.showIcon : true);
  const autoDismissMs = (typeof props.autoDismissMs === 'string' ? props.autoDismissMs : '3000');

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Message</Label>
        <Input value={message} onChange={(e) => setProp('message', e.target.value)} className="h-7 text-xs" />
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={showIcon} onChange={(e) => setProp('showIcon', e.target.checked)} className="accent-green-600" />
        Show icon
      </label>
      <div className="space-y-1">
        <Label className="text-[11px]">Auto-dismiss (ms)</Label>
        <Input type="number" value={autoDismissMs} onChange={(e) => setProp('autoDismissMs', e.target.value)} className="h-7 text-xs" min={0} step={500} />
      </div>
    </div>
  );
}

function ConfirmModalConfig({ props, setProp }: { props: Record<string, string | boolean | string[]>; setProp: (k: string, v: string | boolean | string[]) => void }) {
  const title = (typeof props.title === 'string' ? props.title : 'Confirm Action');
  const message = (typeof props.message === 'string' ? props.message : '');
  const confirmLabel = (typeof props.confirmLabel === 'string' ? props.confirmLabel : 'Confirm');
  const cancelLabel = (typeof props.cancelLabel === 'string' ? props.cancelLabel : 'Cancel');
  const destructive = (typeof props.destructive === 'boolean' ? props.destructive : false);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Title</Label>
        <Input value={title} onChange={(e) => setProp('title', e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Message</Label>
        <Input value={message} onChange={(e) => setProp('message', e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Confirm Label</Label>
          <Input value={confirmLabel} onChange={(e) => setProp('confirmLabel', e.target.value)} className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Cancel Label</Label>
          <Input value={cancelLabel} onChange={(e) => setProp('cancelLabel', e.target.value)} className="h-7 text-xs" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={destructive} onChange={(e) => setProp('destructive', e.target.checked)} className="accent-red-600" />
        Destructive (red confirm button)
      </label>
    </div>
  );
}

function InfoDialogConfig({ props, setProp }: { props: Record<string, string | boolean | string[]>; setProp: (k: string, v: string | boolean | string[]) => void }) {
  const title = (typeof props.title === 'string' ? props.title : 'Information');
  const message = (typeof props.message === 'string' ? props.message : '');
  const closeLabel = (typeof props.closeLabel === 'string' ? props.closeLabel : 'OK');

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Title</Label>
        <Input value={title} onChange={(e) => setProp('title', e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Message</Label>
        <Input value={message} onChange={(e) => setProp('message', e.target.value)} className="h-7 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Close Label</Label>
        <Input value={closeLabel} onChange={(e) => setProp('closeLabel', e.target.value)} className="h-7 text-xs" />
      </div>
    </div>
  );
}
