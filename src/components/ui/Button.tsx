interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function Button({ type = "button", onClick, disabled, children }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-background text-foreground border border-foreground rounded-lg w-fit hover:scale-105 transition-transform"
    >
      {children}
    </button>
  );
}
