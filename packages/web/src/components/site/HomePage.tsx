export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[var(--ui-text)]">
          欢迎使用
        </h1>
        <p className="text-[var(--ui-text-muted)]">
          这是一个脚手架项目，首页占位符。
        </p>
        <a
          href="/login"
          className="inline-block rounded-md bg-[var(--ui-btn-primary-bg)] hover:bg-[var(--ui-btn-primary-bg-hover)] px-6 py-2.5 text-sm font-semibold text-[var(--ui-btn-primary-text)] transition-colors"
        >
          开始使用
        </a>
      </div>
    </div>
  );
}
