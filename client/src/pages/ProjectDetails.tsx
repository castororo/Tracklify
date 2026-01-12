
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, tasksApi, teamApi } from '@/services/api';
import { Project, Task, TeamMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ArrowLeft, Calendar as CalendarIcon, Filter, Layers, CheckCircle2, Clock, Users, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { ProjectSettings } from '@/components/projects/ProjectSettings';
import { ProjectAnalytics } from '@/components/projects/ProjectAnalytics';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    // Filter States
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterAssignee, setFilterAssignee] = useState('all');

    const fetchData = async () => {
        if (!id) return;
        try {
            const [projectData, tasksData, teamData] = await Promise.all([
                projectsApi.getById(id),
                tasksApi.getByProject(id),
                teamApi.getAll()
            ]);

            if (!projectData) {
                toast({ title: 'Error', description: 'Project not found', variant: 'destructive' });
                navigate('/projects');
                return;
            }

            setProject(projectData);
            setTasks(tasksData);
            setTeamMembers(teamData.filter(m => projectData.teamMembers.includes(m.id)));
        } catch (error) {
            console.error('Failed to fetch project details:', error);
            toast({ title: 'Error', description: 'Failed to load project details', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, navigate, toast]);

    const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
        try {
            const updatedProject = await projectsApi.update(projectId, updates);
            setProject(updatedProject);
            toast({ title: 'Success', description: 'Project updated successfully' });
        } catch (error) {
            console.error('Failed to update project:', error);
            toast({ title: 'Error', description: 'Failed to update project', variant: 'destructive' });
        }
    };

    const handleTaskStatusUpdate = async (taskId: string, status: Task['status']) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
            setTasks(updatedTasks);

            await tasksApi.update(taskId, { status });
            toast({ title: 'Task updated', description: `Task moved to ${status.replace('-', ' ')}` });
        } catch (error) {
            console.error('Failed to update task status:', error);
            fetchData(); // Revert on error
            toast({ title: 'Error', description: 'Failed to update task status', variant: 'destructive' });
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            const matchesAssignee = filterAssignee === 'all' || (task.assignee?.id === filterAssignee);

            return matchesStatus && matchesPriority && matchesAssignee;
        });
    }, [tasks, filterStatus, filterPriority, filterAssignee]);

    if (loading) return <LoadingPage />;
    if (!project || !id) return null;

    const stats = [
        { label: 'Total Tasks', value: tasks.length, icon: Layers, color: 'text-white' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-green-500' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: Clock, color: 'text-orange-500' },
        { label: 'Team Members', value: project.teamMembers.length, icon: Users, color: 'text-blue-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
                        <StatusBadge status={project.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <Card key={i} className="bg-card/50 border-input/50 backdrop-blur-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="tasks" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <TabsList className="bg-background/50 border border-input/50">
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                            <Layers className="h-4 w-4 mr-2" /> Tasks
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
                        </TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <CreateTaskDialog projectId={id} onTaskCreated={fetchData} />
                </div>

                <TabsContent value="tasks" className="space-y-6">
                    {/* Filters and View Toggle */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-wrap gap-3 p-1 bg-card/30 rounded-lg w-fit">
                            {/* Status Filter */}
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[130px] h-9 bg-background/50 border-input/50">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Completed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger className="w-[130px] h-9 bg-background/50 border-input/50">
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Assignee Filter */}
                            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                                <SelectTrigger className="w-[140px] h-9 bg-background/50 border-input/50">
                                    <SelectValue placeholder="All Assignees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Assignees</SelectItem>
                                    {teamMembers.map(member => (
                                        <SelectItem key={member.id || (member as any)._id} value={member.id || (member as any)._id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-card/30 p-1 rounded-lg border border-input/20">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8"
                            >
                                <List className="h-4 w-4 mr-2" /> List
                            </Button>
                            <Button
                                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('board')}
                                className="h-8"
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" /> Board
                            </Button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="rounded-md border bg-card/50 backdrop-blur-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Assignee</TableHead>
                                        <TableHead>Due Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks.map((task) => (
                                        <TableRow key={task.id || (task as any)._id} className="cursor-pointer hover:bg-white/5" onClick={() => setSelectedTask(task)}>
                                            <TableCell className="font-medium text-white">{task.title}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={task.status} />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    task.priority === 'high' ? 'text-red-500 border-red-500/50' :
                                                        task.priority === 'medium' ? 'text-yellow-500 border-yellow-500/50' :
                                                            'text-blue-500 border-blue-500/50'
                                                }>
                                                    {task.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {task.assignee && typeof task.assignee !== 'string' && task.assignee.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={task.assignee.avatar} />
                                                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-muted-foreground">{task.assignee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredTasks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No tasks found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="h-[600px]">
                            <KanbanBoard
                                tasks={filteredTasks}
                                onTaskUpdate={handleTaskStatusUpdate}
                                onTaskClick={(task) => setSelectedTask(task)}
                                projectId={id}
                                onTaskCreated={fetchData}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="calendar" className="py-12 flex items-center justify-center text-muted-foreground">
                    Calendar View Coming Soon
                </TabsContent>

                <TabsContent value="analytics" className="!mt-0">
                    <ProjectAnalytics project={project} tasks={tasks} />
                </TabsContent>

                <TabsContent value="settings" className="!mt-0 p-0">
                    <ProjectSettings
                        project={project}
                        members={teamMembers}
                        onUpdate={handleUpdateProject}
                    />
                </TabsContent>
            </Tabs >

            {/* Task Details Dialog */}
            {
                selectedTask && (
                    <TaskDetailsDialog
                        task={selectedTask}
                        project={project}
                        open={!!selectedTask}
                        onClose={() => setSelectedTask(null)}
                        currentUser={{ id: '1', name: 'Jason Joshua', email: 'jason@example.com', role: 'admin', createdAt: '' }} // Mock current user for now
                        onTaskUpdated={fetchData}
                    />
                )
            }
        </div >
    );
};

export default ProjectDetails;
