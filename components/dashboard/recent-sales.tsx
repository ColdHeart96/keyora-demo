import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jean Dupont</p>
          <p className="text-sm text-muted-foreground">
            Appartement - Paris 15ème
          </p>
        </div>
        <div className="ml-auto font-medium">+450,000€</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Marie Lambert</p>
          <p className="text-sm text-muted-foreground">
            Maison - Bordeaux
          </p>
        </div>
        <div className="ml-auto font-medium">+320,000€</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback>PB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Pierre Bernard</p>
          <p className="text-sm text-muted-foreground">
            Villa - Nice
          </p>
        </div>
        <div className="ml-auto font-medium">+680,000€</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Sophie Martin</p>
          <p className="text-sm text-muted-foreground">
            Loft - Lyon
          </p>
        </div>
        <div className="ml-auto font-medium">+280,000€</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/05.png" alt="Avatar" />
          <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Antoine Rousseau</p>
          <p className="text-sm text-muted-foreground">
            Duplex - Toulouse
          </p>
        </div>
        <div className="ml-auto font-medium">+425,000€</div>
      </div>
    </div>
  )
} 