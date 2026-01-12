import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { tasksApi, teamApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TeamMember } from '@/types';


interface CreateTaskDialogProps {
    projectId: string;
    onTaskCreated: () => void;
    defaultStatus?: 'todo' | 'in-progress' | 'done';
    trigger?: React.ReactNode;
}

export const CreateTaskDialog = ({ projectId, onTaskCreated, defaultStatus, trigger }: CreateTaskDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        status: defaultStatus || 'todo',
        assigneeId: '',
        dueDate: '',
    });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await teamApi.getAll();
                setTeamMembers(data);
            } catch (error) {
                console.error("Failed to fetch team members", error);
            }
        };
        if (open) {
            fetchTeam();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await tasksApi.create({
                title: formData.title,
                description: formData.description,
                type: formData.type as any,
                priority: formData.priority as any,
                status: formData.status as any,
                assignee: formData.assigneeId || undefined,
                projectId,
                dueDate: formData.dueDate || undefined,
            });

            toast({ title: 'Task created', description: 'New task added to project.' });

            setFormData({
                title: '', description: '', type: 'task', priority: 'medium',
                status: 'todo', assigneeId: '', dueDate: ''
            });
            setOpen(false);
            onTaskCreated();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create task.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button><Plus className="h-4 w-4 mr-2" /> New Task</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to track progress.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the task"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="task">Task</SelectItem>
                                    <SelectItem value="bug">Bug</SelectItem>
                                    <SelectItem value="feature">Feature</SelectItem>
                                    <SelectItem value="improvement">Improvement</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Assignee</Label>
                            <Select value={formData.assigneeId} onValueChange={(val) => setFormData({ ...formData, assigneeId: val })}>
                                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {teamMembers.map(member => (
                                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as any })}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !formData.dueDate && "text-muted-foreground"
                                    )}
                                >
                                    {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                                    onSelect={(date) => date && setFormData({ ...formData, dueDate: date.toISOString() })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Task'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
