import type { ReactNode } from "react";

interface CreateRequestLayoutProps {
  title: string;
  subtitle: string;
  stepper: ReactNode;
  children: ReactNode;
  navigation: ReactNode;
}

export function CreateRequestLayout({
  title,
  subtitle,
  stepper,
  children,
  navigation,
}: CreateRequestLayoutProps) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col px-4 py-8 lg:px-8">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {stepper}
      </header>

      <main className="mt-6 flex-1">{children}</main>

      <footer className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-background/95 px-4 py-4 backdrop-blur lg:-mx-8 lg:px-8">
        {navigation}
      </footer>
    </div>
  );
}
