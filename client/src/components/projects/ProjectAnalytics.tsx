
import { useMemo } from 'react';
import { Task, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

interface ProjectAnalyticsProps {
    project: Project;
    tasks: Task[];
}

export const ProjectAnalytics = ({ project, tasks }: ProjectAnalyticsProps) => {

    // 1. Status Distribution Data
    const statusData = useMemo(() => {
        const counts = { todo: 0, 'in-progress': 0, done: 0 };
        tasks.forEach(t => {
            if (t.status in counts) counts[t.status as keyof typeof counts]++;
        });
        return [
            { name: 'To Do', value: counts.todo, color: '#3b82f6' }, // Blue
            { name: 'In Progress', value: counts['in-progress'], color: '#f97316' }, // Orange
            { name: 'Done', value: counts.done, color: '#22c55e' }, // Green
        ].filter(d => d.value > 0);
    }, [tasks]);

    // 2. Priority Breakdown Data
    const priorityData = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        tasks.forEach(t => {
            if (t.priority in counts) counts[t.priority as keyof typeof counts]++;
        });
        return [
            { name: 'High', count: counts.high },
            { name: 'Medium', count: counts.medium },
            { name: 'Low', count: counts.low },
        ];
    }, [tasks]);

    // 3. Assignee Workload Data
    const assigneeData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            const name = t.assignee ? t.assignee.name : 'Unassigned';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [tasks]);

    const completionRate = useMemo(() => {
        if (tasks.length === 0) return 0;
        return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
    }, [tasks]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <Card className="bg-card/50 border-input/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-baseline gap-2">
                            {completionRate}%
                            <span className="text-xs font-normal text-muted-foreground">of total tasks</span>
                        </div>
                        <div className="w-full bg-secondary/50 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-input/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all statuses</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-input/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Team Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{assigneeData.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active contributors</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Distribution Chart */}
                <Card className="bg-card border-input/50">
                    <CardHeader>
                        <CardTitle>Task Status</CardTitle>
                        <CardDescription>Distribution of tasks by current status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Priority Breakdown Chart */}
                <Card className="bg-card border-input/50">
                    <CardHeader>
                        <CardTitle>Task Priorities</CardTitle>
                        <CardDescription>Breakdown of tasks by priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'High' ? '#ef4444' :
                                                entry.name === 'Medium' ? '#eab308' :
                                                    '#3b82f6'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Assignee Workload Chart (Full Width) */}
            <Card className="bg-card border-input/50">
                <CardHeader>
                    <CardTitle>Team Workload</CardTitle>
                    <CardDescription>Number of tasks assigned per team member</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assigneeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Bar dataKey="count" name="Tasks Assigned" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
