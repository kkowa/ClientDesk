import Link from "next/link";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
}

export function Button({
  type = "button",
  onClick,
  disabled,
  href,
  children,
}: ButtonProps) {
  const className =
    "px-4 py-2 bg-background text-foreground border border-foreground rounded-lg w-fit hover:scale-105 transition-transform";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
