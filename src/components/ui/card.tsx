interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return <div className="rounded-xl border border-border bg-surface p-4">{children}</div>;
}