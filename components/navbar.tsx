interface NavbarProps {
  title: string;
  children?: React.ReactNode;
}

export function Navbar({ title, children }: NavbarProps) {
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-8">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  )
} 