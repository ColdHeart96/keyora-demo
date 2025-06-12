"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Prospect } from "../../types/prospect";
import { PlusIcon, BadgeCheck, Mail, Phone, Calendar, Info } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { Navbar } from "@/components/navbar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

interface Task {
  id: string;
  prospect_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

const STATUS_LABELS: { [key: string]: string } = {
  new: "Nouveau",
  contacted: "Contacté",
  pending: "En attente",
  follow_up: "À relancer",
  negotiation: "En négociation",
  closed: "Closé",
  rejected: "Refusé",
  active: "Actif",
  inactive: "Inactif",
  converted: "Converti",
};

function DraggableProspect({ prospect, children }: { prospect: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: prospect.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        cursor: 'grab',
      }}
    >
      {children}
    </div>
  );
}

function DroppableColumn({ status, children }: { status: string, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-[320px] max-w-[340px] bg-card rounded-2xl shadow-lg p-4 flex-1 border border-border flex flex-col ${isOver ? 'ring-2 ring-blue-500' : ''}`}
      id={status}
    >
      {children}
    </div>
  );
}

export default function CrmPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [checkingTask, setCheckingTask] = useState<string | null>(null);
  const [draggedProspect, setDraggedProspect] = useState<any | null>(null);
  const supabase = createClientComponentClient();

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // 1. Ajoute un état de pagination par statut
  const [pages, setPages] = useState<Record<string, number>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: prospectsData } = await supabase.from("prospects").select("*");
      const { data: tasksData } = await supabase.from("tasks").select("*");
      setProspects((prospectsData as Prospect[]) || []);
      setTasks((tasksData as Task[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const pipeline = prospects.reduce<Record<string, Prospect[]>>((acc, prospect) => {
    const status = prospect.status || "new";
    if (!acc[status]) acc[status] = [];
    acc[status].push(prospect);
    return acc;
  }, {});

  const getTasksForProspect = (prospectId: string) =>
    tasks.filter((task) => task.prospect_id === prospectId);

  // Drag & drop handlers
  const handleDragStart = (event: any) => {
    const { active } = event;
    const prospectId = active.id;
    const prospect = prospects.find((p) => p.id === prospectId);
    setDraggedProspect(prospect || null);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setDraggedProspect(null);
    if (!over) return;
    const prospectId = active.id;
    const newStatus = over.id;
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect || prospect.status === newStatus) return;
    // Update local state
    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId ? { ...p, status: newStatus } : p
      )
    );
    // Update in Supabase
    const { error } = await supabase
      .from('prospects')
      .update({ status: newStatus })
      .eq('id', prospectId);
    if (!error) {
      toast.success('Statut du prospect mis à jour !');
    } else {
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Ajout d'une tâche
  const handleAddTask = async (prospectId: string) => {
    if (!newTaskTitle.trim()) return;
    const { data, error } = await supabase.from("tasks").insert([
      {
        prospect_id: prospectId,
        title: newTaskTitle,
        description: newTaskDescription || null,
        due_date: newTaskDueDate || null,
        status: "todo"
      }
    ]).select();
    if (!error && data && data[0]) {
      setTasks((prev) => [...prev, data[0]]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setAddingTaskFor(null);
    }
  };

  // Marquer une tâche comme faite
  const handleToggleTask = async (task: Task) => {
    setCheckingTask(task.id);
    const newStatus = task.status === "done" ? "todo" : "done";
    const { data, error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id).select();
    if (!error && data && data[0]) {
      setTasks((prev) => prev.map(t => t.id === task.id ? data[0] : t));
      toast.success(newStatus === 'done' ? 'Tâche marquée comme faite' : 'Tâche à faire');
    } else {
      toast.error('Erreur lors de la mise à jour de la tâche');
    }
    setCheckingTask(null);
  };

  // 2. Fonction pour changer de page
  const handlePageChange = (status: string, direction: 'prev' | 'next', maxPage: number) => {
    setPages(prev => {
      const current = prev[status] || 1;
      let next = direction === 'next' ? current + 1 : current - 1;
      if (next < 1) next = 1;
      if (next > maxPage) next = maxPage;
      return { ...prev, [status]: next };
    });
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <>
      <Navbar title="CRM - Sales Pipeline" />
      <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full px-2 md:px-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-6rem)]">
              {Object.keys(STATUS_LABELS).map((status) => (
                <DroppableColumn key={status} status={status}>
                  <h2 className="font-semibold text-lg mb-4 text-center tracking-wide text-primary flex items-center justify-center gap-2">
                    {STATUS_LABELS[status]}
                    <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">
                      {pipeline[status]?.length || 0}
                    </span>
                  </h2>
                  <SortableContext items={pipeline[status]?.map(p => p.id) || []} strategy={verticalListSortingStrategy}>
                    {pipeline[status]?.length ? (
                      pipeline[status].map((prospect) => (
                        <DraggableProspect key={prospect.id} prospect={prospect}>
                          <div className="bg-background dark:bg-[#23232b] rounded-xl shadow border border-muted mb-5 p-4 flex flex-col gap-2 transition hover:shadow-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-base text-foreground">
                                {prospect.first_name} {prospect.last_name}
                              </span>
                              {prospect.status && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                  {STATUS_LABELS[prospect.status] || prospect.status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" /> {prospect.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" /> {prospect.phone}
                            </div>
                            <div className="mt-2">
                              <span className="font-semibold text-sm text-foreground">Tâches :</span>
                              <ul className="mt-1 space-y-1">
                                {getTasksForProspect(prospect.id).length ? (
                                  getTasksForProspect(prospect.id).map((task) => (
                                    <li key={task.id} className="flex items-start gap-2 text-sm group">
                                      <button
                                        className={`mt-0.5 w-4 h-4 border rounded transition-colors ${task.status === "done" ? "bg-primary/80 border-primary" : "border-muted-foreground"}`}
                                        aria-label="Valider la tâche"
                                        disabled={checkingTask === task.id}
                                        onClick={() => handleToggleTask(task)}
                                        onPointerDown={e => e.stopPropagation()}
                                      >
                                        {task.status === "done" && <BadgeCheck className="w-4 h-4 text-white" />}
                                      </button>
                                      <span className={task.status === "done" ? "line-through text-gray-400" : "text-foreground"}>{task.title}</span>
                                      <div className="flex flex-col ml-2 text-xs text-muted-foreground">
                                        {task.description && <span className="italic"><Info className="inline w-3 h-3 mr-1" />{task.description}</span>}
                                        {task.due_date && (
                                          <span className={isPast(parseISO(task.due_date)) && task.status !== "done" ? "text-red-500 font-semibold" : ""}>
                                            <Calendar className="inline w-3 h-3 mr-1" />Échéance : {format(parseISO(task.due_date), "dd/MM/yyyy")}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-gray-400 text-sm">Aucune tâche</li>
                                )}
                              </ul>
                              {addingTaskFor === prospect.id ? (
                                <div className="flex flex-col gap-2 mt-2 bg-muted/40 p-2 rounded-lg">
                                  <input
                                    type="text"
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                    placeholder="Titre de la tâche"
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    autoFocus
                                    onPointerDown={e => e.stopPropagation()}
                                  />
                                  <textarea
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                    placeholder="Description (optionnel)"
                                    value={newTaskDescription}
                                    onChange={e => setNewTaskDescription(e.target.value)}
                                    rows={2}
                                    onPointerDown={e => e.stopPropagation()}
                                  />
                                  <input
                                    type="date"
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                    value={newTaskDueDate}
                                    onChange={e => setNewTaskDueDate(e.target.value)}
                                    onPointerDown={e => e.stopPropagation()}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium shadow"
                                      onClick={() => handleAddTask(prospect.id)}
                                      type="button"
                                      onPointerDown={e => e.stopPropagation()}
                                    >Ajouter</button>
                                    <button
                                      className="text-gray-400 px-2 py-1 text-sm hover:underline"
                                      onClick={() => { setAddingTaskFor(null); setNewTaskTitle(""); setNewTaskDescription(""); setNewTaskDueDate(""); }}
                                      type="button"
                                      onPointerDown={e => e.stopPropagation()}
                                    >Annuler</button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:underline font-medium"
                                  onClick={() => setAddingTaskFor(prospect.id)}
                                  type="button"
                                  onPointerDown={e => e.stopPropagation()}
                                >
                                  <PlusIcon className="w-4 h-4" /> Ajouter une tâche
                                </button>
                              )}
                            </div>
                          </div>
                        </DraggableProspect>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center mt-8">Aucun prospect</div>
                    )}
                  </SortableContext>
                  <div className="flex justify-center gap-2 mt-2">
                    <button disabled={pages[status] === 1} onClick={() => handlePageChange(status, 'prev', Math.ceil(pipeline[status]?.length / itemsPerPage) || 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Précédent</button>
                    <span className="text-xs">Page {pages[status] || 1} / {Math.ceil(pipeline[status]?.length / itemsPerPage) || 1}</span>
                    <button disabled={pages[status] === Math.ceil(pipeline[status]?.length / itemsPerPage) || Math.ceil(pipeline[status]?.length / itemsPerPage) === 0} onClick={() => handlePageChange(status, 'next', Math.ceil(pipeline[status]?.length / itemsPerPage) || 1)} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Suivant</button>
                  </div>
                </DroppableColumn>
              ))}
            </div>
            <DragOverlay>
              {draggedProspect && (
                <div className="bg-background rounded-xl shadow-lg border border-muted p-4 min-w-[320px] max-w-[340px] opacity-80">
                  <span className="font-bold text-base text-foreground">
                    {draggedProspect.first_name} {draggedProspect.last_name}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
} 