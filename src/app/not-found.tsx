"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html>
      <head>
        <title>404 | AI Image Studio</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="The requested page could not be found." />
      </head>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Error 404</p>
              <h1 className="mt-3 text-5xl font-extrabold text-slate-900 md:text-6xl">Page Not Found</h1>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                The page may have moved or no longer exists. You will be redirected to home in a few seconds.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">Try this</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>Check the URL for typing errors.</li>
                <li>Use the navigation menu to continue browsing.</li>
                <li>Go back to the homepage and start from there.</li>
              </ul>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/"
                className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-slate-800"
              >
                Return Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
