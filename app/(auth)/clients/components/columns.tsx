import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  type: "acheteur" | "vendeur" | "les deux"
  status: "actif" | "inactif" | "en_pause"
  created_at: string
  first_name: string
  last_name: string
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const client = row.original
      return (
        <span>{client.first_name} {client.last_name}</span>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="outline" className="capitalize">
          {type.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={
            status === "actif" 
              ? "default"
              : status === "inactif"
              ? "destructive"
              : "secondary"
          }
          className="capitalize"
        >
          {status.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original
      const router = useRouter()
      const supabase = createClientComponentClient()
      const [open, setOpen] = useState(false)

      const handleDelete = async () => {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', client.id)
        if (!error) {
          router.refresh()
        } else {
          alert("Erreur lors de la suppression du client")
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}/edit`)}>Modifier</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => setOpen(true)}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
          <ConfirmDialog
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={handleDelete}
            title="Confirmer la suppression"
            message={`Êtes-vous sûr de vouloir supprimer le client "${client.first_name} ${client.last_name}" ? Cette action est irréversible.`}
            confirmLabel="Supprimer"
            cancelLabel="Annuler"
          />
        </DropdownMenu>
      )
    },
  },
] 