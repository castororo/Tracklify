
import { useState } from 'react';
import { Project, TeamMember } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectSettingsProps {
    project: Project;
    members: TeamMember[];
    onUpdate: (id: string, updates: Partial<Project>) => Promise<void>;
}

export const ProjectSettings = ({ project, members, onUpdate }: ProjectSettingsProps) => {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const [status, setStatus] = useState<Project['status']>(project.status);
    const [priority, setPriority] = useState<Project['priority']>(project.priority);
    const [progress, setProgress] = useState([project.progress]);
    const [startDate, setStartDate] = useState<Date | undefined>(project.startDate ? new Date(project.startDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(project.deadline ? new Date(project.deadline) : undefined);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(project.id, {
                name,
                description,
                status,
                priority,
                progress: progress[0],
                startDate: startDate?.toISOString(),
                deadline: endDate?.toISOString(),
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Project Details */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/50 border-input/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input
                                id="projectName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background/50 border-input/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px] bg-background/50 border-input/50 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                    <SelectTrigger className="bg-background/50 border-input/50">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on-hold">On Hold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                    <SelectTrigger className="bg-background/50 border-input/50">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 flex flex-col">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background/50 border-input/50",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background/50 border-input/50",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>Progress: {progress[0]}%</Label>
                            </div>
                            <Slider
                                value={progress}
                                onValueChange={setProgress}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Team Members */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-card/50 border-input/50 backdrop-blur-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Team Members ({members.length})</CardTitle>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-input/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="truncate">
                                        <p className="text-sm font-medium truncate" title={member.email}>{member.email}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{member.role === 'admin' ? 'Team Lead' : 'Member'}</Badge>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-4">
                                No members assigned
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
