import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, User as UserIcon, MessageSquare, Briefcase, Paperclip, Send, Edit, Save, X, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task, Project, Comment, User } from '@/types';
import { commentsApi, tasksApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface TaskDetailsDialogProps {
    task: Task;
    project: Project;
    open: boolean;
    onClose: () => void;
    currentUser: User | null;
    onTaskUpdated?: () => void;
}

export const TaskDetailsDialog = ({ task, project, open, onClose, currentUser, onTaskUpdated }: TaskDetailsDialogProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedTask, setEditedTask] = useState<Partial<Task> & { isCalendarOpen?: boolean }>({});

    const { toast } = useToast();

    // Use User type as TeamMember extends it, and we might get simple users
    const [projectMembers, setProjectMembers] = useState<User[]>([]);

    useEffect(() => {
        if (open && task) {
            setEditedTask({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                assignee: task.assignee ? ((task.assignee as any).id || (task.assignee as any)._id || task.assignee) : undefined,
                assigneeId: task.assignee ? ((task.assignee as any).id || (task.assignee as any)._id) : undefined
            });
            setIsEditing(false); // Reset edit mode when opening new task
        }
    }, [task, open]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (open) {
                try {
                    // Fetch all team members to ensure we see the assignee even if they aren't strictly "on the project" yet
                    // This matches the behavior of CreateTaskDialog
                    const data = await import('@/services/api').then(m => m.teamApi.getAll());
                    setProjectMembers(data as unknown as User[]);
                } catch (err) {
                    console.error("Failed to fetch team members", err);
                }
            }
        };
        fetchTeamMembers();
    }, [open]);

    useEffect(() => {
        const fetchComments = async () => {
            if (!task.id || !open) return;
            setIsLoadingComments(true);
            try {
                const data = await commentsApi.getByTask(task.id);
                setComments(data);
            } catch (error) {
                console.error('Failed to fetch comments', error);
            } finally {
                setIsLoadingComments(false);
            }
        };
        fetchComments();
    }, [task.id, open]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !currentUser) return;
        setIsPosting(true);
        try {
            const comment = await commentsApi.create({
                content: newComment,
                taskId: task.id,
                userId: currentUser.id,
            });
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' });
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setIsSaving(true);
        try {
            await tasksApi.delete(task.id);
            toast({ title: 'Task deleted', description: 'The task has been permanently removed.' });
            onClose();
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTask = async () => {
        setIsSaving(true);
        try {
            // Prepare payload
            // Ensure assignee is sent as ID string or null, not object
            const assigneeValue = editedTask.assignee;
            let finalAssignee: string | null | undefined = null;

            if (typeof assigneeValue === 'string') {
                finalAssignee = assigneeValue;
            } else if (assigneeValue && typeof assigneeValue === 'object') {
                // Handle both id and _id 
                finalAssignee = (assigneeValue as any).id || (assigneeValue as any)._id;
            }

            const payload: any = {
                ...editedTask,
                assignee: finalAssignee
            };

            // Remove internal UI fields if any
            delete payload.assigneeId;

            console.log("Saving task payload:", JSON.stringify(payload, null, 2));

            await tasksApi.update(task.id, payload);
            toast({ title: 'Task updated', description: 'Changes saved successfully.' });
            setIsEditing(false);
            if (onTaskUpdated) onTaskUpdated();
        } catch (error: any) {
            console.error('Failed to update task:', error);
            let errorMsg = 'Failed to save changes.';
            if (error.response) {
                if (error.response.data && typeof error.response.data === 'object') {
                    errorMsg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                } else if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data; // Handle plain text responses (like rate limiter default)
                } else {
                    errorMsg = `Server error: ${error.response.status}`;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setIsEditing(false);
                onClose();
            }
        }}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background" aria-describedby="task-details-description">
                <div className="sr-only">
                    <DialogTitle>{task.title}</DialogTitle>
                    <div id="task-details-description">Task details and discussion for {task.title}</div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: Discussion */}
                    <div className="w-2/3 border-r border-border p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">Task Discussion ({comments.length})</h3>
                        </div>

                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <div className="text-muted-foreground text-sm py-8 text-center">
                                        No comments yet. Be the first!
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <Avatar className="h-8 w-8 mt-1">
                                                <AvatarImage src={comment.user?.avatar} />
                                                <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{comment.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/90 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="relative">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="min-h-[80px] pr-12 resize-none"
                                />
                                <Button
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8"
                                    onClick={handlePostComment}
                                    disabled={isPosting || !newComment.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-1/3 bg-muted/10 p-6 flex flex-col gap-6 overflow-y-auto relative">
                        {/* Edit & Delete Controls */}
                        <div className="absolute top-4 right-16 z-10 flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" onClick={handleSaveTask} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteTask}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Task Header */}
                        <div className="space-y-4 p-4 rounded-xl bg-card border border-border shadow-sm mt-8">
                            <div>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={editedTask.title || ''}
                                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select
                                                    value={editedTask.status}
                                                    onValueChange={(val: any) => setEditedTask({ ...editedTask, status: val })}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="todo">To Do</SelectItem>
                                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                                        <SelectItem value="done">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Priority</Label>
                                                <Select
                                                    value={editedTask.priority}
                                                    onValueChange={(val: any) => setEditedTask({ ...editedTask, priority: val })}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold leading-tight mb-2">{task.title}</h2>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="uppercase text-[10px]">{task.status.replace('-', ' ')}</Badge>
                                            <Badge variant="outline" className="uppercase text-[10px] border-blue-500/50 text-blue-500">{task.type}</Badge>
                                            <Badge variant="outline" className={`uppercase text-[10px] ${task.priority === 'high' ? 'border-red-500/50 text-red-500' :
                                                task.priority === 'medium' ? 'border-orange-500/50 text-orange-500' :
                                                    'border-green-500/50 text-green-500'
                                                }`}>{task.priority}</Badge>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={editedTask.description || ''}
                                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            ) : (
                                task.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {task.description}
                                    </p>
                                )
                            )}

                            <div className="pt-4 border-t border-border space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <UserIcon className="h-4 w-4" />
                                        <span>Assignee</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <Select
                                                value={
                                                    editedTask.assignee
                                                        ? (typeof editedTask.assignee === 'string' ? editedTask.assignee : editedTask.assignee.id)
                                                        : "unassigned"
                                                }
                                                onValueChange={(val) => {
                                                    // Store the ID string or set to undefined if unassigned
                                                    const newVal = val === "unassigned" ? undefined : val;
                                                    // We can't easily turn it back into a full object here without searching projectMembers, 
                                                    // but for the sake of the API call, we just need the ID (or we can store the ID separately).
                                                    // Let's store the ID string as the assignee for consistency in the edit form state.
                                                    setEditedTask({ ...editedTask, assignee: newVal as any });
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[200px]">
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {projectMembers.map((member: any) => (
                                                        <SelectItem key={member.id || member._id} value={member.id || member._id}>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-4 w-4">
                                                                    <AvatarImage src={member.avatar} />
                                                                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{member.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            task.assignee && typeof task.assignee === 'object' ? (
                                                <>
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={(task.assignee as any).avatar} />
                                                        <AvatarFallback>{(task.assignee as any).name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{(task.assignee as any).name}</span>
                                                </>
                                            ) : (
                                                <span>Unassigned</span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Due Date</span>
                                    </div>
                                    {isEditing ? (
                                        <Popover open={editedTask.isCalendarOpen} onOpenChange={(open) => setEditedTask({ ...editedTask, isCalendarOpen: open })}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal h-8",
                                                        !editedTask.dueDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {editedTask.dueDate ? (
                                                        format(new Date(editedTask.dueDate), "MMM d, yyyy")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                                                    onSelect={(date) => setEditedTask({ ...editedTask, dueDate: date?.toISOString(), isCalendarOpen: false })}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">Project Details</h3>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm mb-1">{project.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                    Project Start Date: {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '-'}
                                </p>
                            </div>
                            <div className="text-xs flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                                <span>Status: <span className="uppercase text-foreground">{project.status}</span></span>
                                <span>Priority: <span className="uppercase text-foreground">{project.priority}</span></span>
                                <span>Progress: <span className="text-foreground">{project.progress}%</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
