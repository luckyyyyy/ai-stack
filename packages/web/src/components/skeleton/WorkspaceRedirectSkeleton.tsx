export default function WorkspaceRedirectSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="animate-pulse space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
