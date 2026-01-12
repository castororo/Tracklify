
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/services/api';
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Project } from '@/types';

interface CreateProjectDialogProps {
    onProjectCreated: () => void;
}

export const CreateProjectDialog = ({ onProjectCreated }: CreateProjectDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        priority: Project['priority'];
        status: Project['status'];
        deadline: string;
        isCalendarOpen?: boolean;
    }>({
        name: '',
        description: '',
        priority: 'medium',
        status: 'active',
        deadline: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await projectsApi.create({
                name: formData.name,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                deadline: formData.deadline,
                progress: 0,
                teamMembers: [], // Initially empty, can add members later
            });

            toast({
                title: "Project created",
                description: "New project has been successfully created.",
            });

            setFormData({
                name: '',
                description: '',
                priority: 'medium',
                status: 'active',
                deadline: '',
            });
            setOpen(false);
            onProjectCreated();
        } catch (error) {
            console.error('Failed to create project:', error);
            toast({
                title: "Error",
                description: "Failed to create project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Website Redesign"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the project..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val: Project['priority']) => setFormData({ ...formData, priority: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Popover open={formData.isCalendarOpen} onOpenChange={(open) => setFormData({ ...formData, isCalendarOpen: open })}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.deadline ? (
                                            format(new Date(formData.deadline), "MMM d, yyyy")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.deadline ? new Date(formData.deadline) : undefined}
                                        onSelect={(date) => setFormData({ ...formData, deadline: date?.toISOString() || '', isCalendarOpen: false })}
                                        disabled={(date) =>
                                            date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
