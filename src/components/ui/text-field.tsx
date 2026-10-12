interface TextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  required?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function TextField({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
