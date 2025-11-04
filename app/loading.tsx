export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40">
        <div className="mx-auto px-6">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
            <div className="h-11 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content skeleton */}
      <div className="mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px] gap-6">
          {/* Left Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </aside>

          {/* Main Feed skeleton */}
          <main className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border rounded-xl p-6"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse" />
                  <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </main>

          {/* Right Sidebar skeleton */}
          <aside className="hidden xl:block">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

