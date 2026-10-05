interface TextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  required?: boolean;
}

export function TextField({ label, name, type = "text", required }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} className="w-full" />
    </div>
  );
}
