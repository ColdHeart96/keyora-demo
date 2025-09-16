interface NavbarProps {
  title: string;
  children?: React.ReactNode;
  description?: string;
}

export function Navbar({ title, children, description }: NavbarProps) {
  return (
    <div className="sticky top-0 z-40 w-full navbar-modern border-b border-border/50">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground font-medium">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  )
} 