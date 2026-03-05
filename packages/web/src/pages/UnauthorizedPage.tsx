import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ui-bg-subtle)] px-4 text-[var(--ui-text)]">
      <div className="relative max-w-lg text-center">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[var(--ui-btn-danger-bg)] blur-3xl opacity-10" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[var(--ui-btn-danger-bg)] blur-3xl opacity-10" />

        {/* Main content */}
        <div className="relative">
          {/* 403 illustration */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <span className="text-[180px] font-black leading-none text-[var(--ui-bg-element)] select-none">
                403
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--ui-btn-danger-bg)] shadow-lg">
                  <svg
                    aria-hidden="true"
                    className="h-12 w-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[var(--ui-text)]">访问受限</h1>
          <p className="mt-3 text-[var(--ui-text-muted)]">
            抱歉，您没有权限访问此页面
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-[var(--ui-btn-danger-bg)] hover:bg-[var(--ui-btn-danger-bg-hover)] px-5 py-2.5 font-medium text-[var(--ui-btn-danger-text)] transition-colors"
              to="/"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              返回首页
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border bg-[var(--ui-btn-secondary-bg)] hover:bg-[var(--ui-btn-secondary-bg-hover)] border-[var(--ui-btn-secondary-border)] px-5 py-2.5 font-medium text-[var(--ui-btn-secondary-text)] transition-colors"
              to="/login"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              重新登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
