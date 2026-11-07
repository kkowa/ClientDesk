interface TextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TextArea({ label, name, required, rows = 4, cols = 50, placeholder, value, onChange }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea id={name} name={name} required={required} rows={rows} cols={cols} placeholder={placeholder} value={value} onChange={onChange} className="w-full" />
    </div>
  );
}
