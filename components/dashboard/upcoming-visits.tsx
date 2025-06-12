import { CalendarDays } from "lucide-react"

export function UpcomingVisits() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <CalendarDays className="h-9 w-9 text-blue-500 dark:text-blue-400" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Aujourd'hui 14:00</p>
          <p className="text-sm text-muted-foreground">
            Appartement - Paris 15ème
          </p>
          <p className="text-sm text-muted-foreground">
            Client: M. Martin
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <CalendarDays className="h-9 w-9 text-blue-500 dark:text-blue-400" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Demain 10:30</p>
          <p className="text-sm text-muted-foreground">
            Maison - Bordeaux
          </p>
          <p className="text-sm text-muted-foreground">
            Client: Mme Dubois
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <CalendarDays className="h-9 w-9 text-blue-500 dark:text-blue-400" />
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jeudi 15:45</p>
          <p className="text-sm text-muted-foreground">
            Studio - Lyon
          </p>
          <p className="text-sm text-muted-foreground">
            Client: M. Bernard
          </p>
        </div>
      </div>
    </div>
  )
} 