
import { useState, useMemo } from 'react';
import { Task } from '@/types';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, status: Task['status']) => Promise<void>;
    onTaskClick: (task: Task) => void;
    projectId: string;
    onTaskCreated: () => void;
}

type TaskStatus = 'todo' | 'in-progress' | 'done';

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

export const KanbanBoard = ({ tasks, onTaskUpdate, onTaskClick, projectId, onTaskCreated }: KanbanBoardProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const columns = useMemo(() => {
        const cols: Record<TaskStatus, Task[]> = {
            todo: [],
            'in-progress': [],
            done: [],
        };
        tasks.forEach(task => {
            if (task.status in cols) {
                cols[task.status as TaskStatus].push(task);
            } else {
                cols['todo'].push(task);
            }
        });
        return cols;
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // If dropped on the same item, do nothing
        if (activeId === overId) return;

        const task = tasks.find(t => t.id === activeId);
        if (!task) return;

        let newStatus: TaskStatus | undefined;

        // Check if dropped on a column container
        if (COLUMNS.some(c => c.id === overId)) {
            newStatus = overId as TaskStatus;
        } else {
            // Check if dropped on another task
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status as TaskStatus;
            }
        }

        if (newStatus && newStatus !== task.status) {
            await onTaskUpdate(task.id, newStatus);
        }
    };

    const activeTask = tasks.find(t => t.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <div key={col.id} className="w-[350px] flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg text-white">{col.title}</h3>
                                <Badge variant="secondary">{columns[col.id].length}</Badge>
                            </div>
                            <CreateTaskDialog
                                projectId={projectId}
                                onTaskCreated={onTaskCreated}
                                defaultStatus={col.id}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>

                        <div className="bg-muted/10 rounded-xl min-h-[500px] border border-dashed border-muted/20">
                            <KanbanColumn
                                id={col.id}
                                items={columns[col.id]}
                            >
                                <div className="flex flex-col gap-3">
                                    {columns[col.id].map(task => (
                                        <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                                    ))}
                                </div>
                            </KanbanColumn>
                        </div>
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

// Separated Column Component to handle useDroppable
const KanbanColumn = ({ id, items, children }: { id: string, items: Task[], children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <SortableContext
            items={items.map(t => t.id)}
            strategy={verticalListSortingStrategy}
            id={id}
        >
            <div ref={setNodeRef} className="h-full p-4 w-full">
                {children}
            </div>
        </SortableContext>
    );
};

const SortableTaskCard = ({ task, onClick }: { task: Task, onClick?: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <TaskCard task={task} />
        </div>
    );
};

const TaskCard = ({ task, isOverlay }: { task: Task, isOverlay?: boolean }) => {
    return (
        <Card className={cn("bg-card border-input/50 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group", isOverlay && "shadow-xl border-primary scale-105")}>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm leading-tight text-white line-clamp-2 group-hover:text-primary transition-colors">{task.title}</h4>
                </div>

                <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-5",
                        task.priority === 'high' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                            task.priority === 'medium' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                                'text-blue-500 border-blue-500/30 bg-blue-500/10'
                    )}>
                        {task.priority}
                    </Badge>

                    {task.assignee && (
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-[10px]">{task.assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
                {task.dueDate && (
                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        Due {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
