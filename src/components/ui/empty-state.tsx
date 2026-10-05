interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-8 text-center">
      <p className="font-medium">{title}</p>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}