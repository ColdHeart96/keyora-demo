'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalendarPlus, Bell, CalendarCheck, RefreshCcw, PencilIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm, Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRef } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const VISIT_STATUS_OPTIONS = [
  { value: 'prevu', label: 'Prévu' },
  { value: 'realisee', label: 'Réalisée' },
  { value: 'annulee', label: 'Annulée' },
  { value: 'relance', label: 'Relance' },
  { value: 'signature', label: 'Signature' },
  { value: 'technique', label: 'Technique' },
  { value: 'negociation', label: 'Négociation' },
  { value: 'autre', label: 'Autre' },
];

export default function VisitsPage() {
  const { user } = useUser()
  const [visits, setVisits] = useState([])
  const supabase = createClientComponentClient()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [openDialog, setOpenDialog] = useState(false)
  const { register, handleSubmit, reset, control, setValue } = useForm()
  const [properties, setProperties] = useState<any[]>([])
  const [prospects, setProspects] = useState<any[]>([])
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [visitToDelete, setVisitToDelete] = useState<any | null>(null)

  // Déplace loadVisits hors du useEffect
  const loadVisits = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) {
      console.error('Erreur lors du chargement des visites:', error)
      return
    }
    console.log('visites chargées:', data)
    setVisits(data || [])
  }
  useEffect(() => {
    if (user) {
      const loadProperties = async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('status', 'available')
        if (error) {
          console.error('Erreur lors du chargement des propriétés:', error)
          return
        }
        setProperties(data || [])
      }
      const loadProspects = async () => {
        const { data, error } = await supabase
          .from('prospects')
          .select('id, first_name, last_name')
          .eq('user_id', user.id)
          .eq('status', 'active')
        if (error) {
          console.error('Erreur lors du chargement des prospects:', error)
          return
        }
        setProspects(data || [])
      }
      loadVisits()
      loadProperties()
      loadProspects()
    }
  }, [user, supabase])

  // Extraire les dates de visites (en string yyyy-mm-dd, en local)
  const visitDates = visits.map((v: any) => {
    if (!v.date) return null
    const d = new Date(v.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }).filter(Boolean)
  const visitDatesSet = new Set(visitDates)
  console.log('visitDates:', visitDates)

  // Filtrer les visites du jour sélectionné
  const selectedDayStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : ''
  const visitsOfDay = visits.filter((v: any) => {
    if (!v.date) return false
    const d = new Date(v.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return key === selectedDayStr
  })
  console.log('visitsOfDay:', visitsOfDay)

  // Fonction pour surligner les jours avec visites
  const modifiers = {
    hasVisit: (date: Date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      return visitDatesSet.has(key)
    },
  }
  const modifiersClassNames = {
    day_hasVisit: 'bg-blue-600 text-white border-2 border-blue-700 font-bold',
    day_selected: 'bg-primary text-white',
  }

  const onSubmit = async (data: any) => {
    // Ajoute l'id de l'utilisateur courant
    const newVisit = { ...data, user_id: user?.id }
    const { error } = await supabase.from('visits').insert([newVisit])
    if (error) {
      console.error('Erreur lors de la création de la visite:', error)
    } else {
      await loadVisits()
      setOpenDialog(false)
      reset()
    }
  }

  // Permettre la sélection de la date sans ouvrir de popup
  const handleCalendarSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setValue('date', date.toISOString().slice(0, 10))
      // Ne pas ouvrir de popup ici
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 dark:bg-black">
      <div className="flex items-center justify-between space-y-2 pb-10">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Visites</h2>
          <p className="text-muted-foreground dark:text-gray-400">Planifiez vos visites, recevez des rappels et synchronisez avec Google Calendar</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-blue-500 hover:bg-blue-600 dark:text-white flex items-center gap-2" onClick={() => setOpenDialog(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nouvelle visite
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="w-full">
        <CardHeader>
          <CardTitle>Calendrier des visites</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
              className="rounded-md border w-full min-w-[250px] max-w-full mx-auto p-4"
          />
        </CardContent>
      </Card>
        <div className="w-full md:max-h-[70vh] md:overflow-y-auto md:pr-2">
          <h2 className="text-lg font-semibold mb-2"
          style={{
            color:
              typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? '#fff'
                : '#000',
          }}
        >
          Visites du {selectedDate ? format(selectedDate, 'PPP') : ''}
        </h2>
        {visitsOfDay.length === 0 ? (
          <div className="text-gray-400">Aucune visite ce jour.</div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
            {visitsOfDay.map((visit: any) => {
              const property = properties.find((p: any) => p.id === visit.property_id)
              const prospect = prospects.find((p: any) => p.id === visit.prospect_id)
              return (
                <Card
                  key={visit.id}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:shadow-lg transition-shadow"
                >
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                    <CardTitle className="text-base font-semibold text-black dark:text-white truncate">{property?.title || 'Propriété inconnue'}</CardTitle>
                    <div className="text-xs text-black dark:text-white">Prospect : {[
                      prospect?.first_name,
                      prospect?.last_name
                    ].filter(Boolean).join(' ') || 'Prospect inconnu'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-1.5 rounded hover:bg-accent transition-colors"
                          title="Modifier"
                          onClick={() => {
                            setSelectedVisit(visit)
                            setEditForm({ ...visit })
                            setEditMode(true)
                          }}
                        >
                          <PencilIcon className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-accent transition-colors"
                          title="Supprimer"
                          onClick={() => {
                            setVisitToDelete(visit)
                            setOpenDeleteDialog(true)
                          }}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1.5 text-sm">
                    <div className="text-black dark:text-white">Heure : <span className="font-medium text-black dark:text-white">{visit.time}</span></div>
                    <div className="text-black dark:text-white">Statut : <span className="font-medium text-black dark:text-white">{visit.status}</span></div>
                    {visit.notes && (
                      <div className="mt-1 text-xs text-black dark:text-white">Notes : {visit.notes}</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        </div>
      </div>
      {/* Dialog création visite */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle visite</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Date</label>
              <Input type="date" {...register('date', { required: true })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Heure</label>
              <Input type="time" {...register('time', { required: true })} />
            </div>
            <div>
              <label className="block text-sm mb-1">Propriété</label>
              <Controller
                name="property_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une propriété" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Prospect</label>
              <Controller
                name="prospect_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un prospect" />
                      </SelectTrigger>
                      <SelectContent>
                        {prospects.length === 0 && (
                          <div className="px-3 py-2 text-gray-400">Aucun prospect actif</div>
                        )}
                        {prospects.map((prospect: any) => (
                          <SelectItem key={prospect.id} value={String(prospect.id)}>
                            {[
                              prospect.first_name,
                              prospect.last_name
                            ].filter(Boolean).join(' ') || 'Prospect sans nom'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <Textarea placeholder="Notes..." {...register('notes')} />
            </div>
            <div>
              <label className="block text-sm mb-1">Statut</label>
              <Controller
                name="status"
                control={control}
                defaultValue={VISIT_STATUS_OPTIONS[0].value}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Créer la visite</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialog détails visite */}
      <Dialog open={!!selectedVisit} onOpenChange={() => { setSelectedVisit(null); setEditMode(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Modifier la visite' : 'Détails de la visite'}</DialogTitle>
          </DialogHeader>
          {selectedVisit && editMode ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const { id, ...updateData } = editForm
                const { error } = await supabase.from('visits').update(updateData).eq('id', id)
                if (!error) {
                  await loadVisits()
                  setSelectedVisit(null)
                  setEditMode(false)
                } else {
                  alert('Erreur lors de la modification')
                }
              }}
            >
              <div>
                <label className="block text-sm mb-1">Propriété</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editForm.property_id || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, property_id: e.target.value }))}
                >
                  <option value="">Sélectionner</option>
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Prospect</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editForm.prospect_id || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, prospect_id: e.target.value }))}
                >
                  <option value="">Sélectionner</option>
                  {prospects.map((p: any) => (
                    <option key={p.id} value={p.id}>{[p.first_name, p.last_name].filter(Boolean).join(' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1"
                    value={editForm.date ? editForm.date.slice(0, 10) : ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Heure</label>
                  <input
                    type="time"
                    className="w-full border rounded px-2 py-1"
                    value={editForm.time || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Statut</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editForm.status || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))}
                  required
                >
                  <option value="">Sélectionner</option>
                  {VISIT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <textarea
                  className="w-full border rounded px-2 py-1"
                  value={editForm.notes || ''}
                  onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded border" onClick={() => { setEditMode(false) }}>Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Enregistrer</button>
              </div>
            </form>
          ) : selectedVisit && (() => {
            const property = properties.find((p: any) => p.id === selectedVisit.property_id)
            const prospect = prospects.find((p: any) => p.id === selectedVisit.prospect_id)
            return (
              <div className="space-y-2">
                <div><span className="font-semibold">Propriété :</span> {property?.title || 'Propriété inconnue'}</div>
                <div><span className="font-semibold">Prospect :</span> {[
                  prospect?.first_name,
                  prospect?.last_name
                ].filter(Boolean).join(' ') || 'Prospect inconnu'}</div>
                <div><span className="font-semibold">Date :</span> {selectedVisit.date ? new Date(selectedVisit.date).toLocaleDateString() : ''}</div>
                <div><span className="font-semibold">Heure :</span> {selectedVisit.time}</div>
                <div><span className="font-semibold">Statut :</span> {selectedVisit.status}</div>
                {selectedVisit.notes && (
                  <div><span className="font-semibold">Notes :</span> {selectedVisit.notes}</div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          if (visitToDelete) {
            const { error } = await supabase.from('visits').delete().eq('id', visitToDelete.id)
            if (!error) await loadVisits()
            else alert('Erreur lors de la suppression')
            setVisitToDelete(null)
            setOpenDeleteDialog(false)
          }
        }}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ce rendez-vous ?`}
        confirmLabel="Supprimer"
        confirmColor="red"
      />
    </div>
  )
} 