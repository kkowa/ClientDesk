interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ type = "button", onClick, disabled, children }: ButtonProps) {
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


// use LinkButton for navigation purposes instead of a regular button
interface LinkButtonProps {
  children: React.ReactNode;
}

export function LinkButton({ children }: LinkButtonProps) {
  return (
    <div
      className="px-4 py-2 bg-background text-foreground border border-foreground rounded-lg w-fit hover:scale-105 transition-transform"
    >
      {children}
    </div>
  );
}
