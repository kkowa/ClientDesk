interface TextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  required?: boolean;
}

export function TextArea({ label, name, required, rows = 4, cols = 50, placeholder }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea id={name} name={name} required={required} rows={rows} cols={cols} placeholder={placeholder} className="w-full" />
    </div>
  );
}
