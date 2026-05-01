type Props = {
  label?: string;
};

export default function LoadingState({ label = "불러오는 중..." }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
      {label}
    </div>
  );
}
