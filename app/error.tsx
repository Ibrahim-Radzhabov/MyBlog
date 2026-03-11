"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-semibold">Что-то пошло не так</h1>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Во время отображения страницы произошла непредвиденная ошибка.
          </p>
          <Button type="button" onClick={() => reset()}>
            Попробовать снова
          </Button>
        </main>
      </body>
    </html>
  );
}
