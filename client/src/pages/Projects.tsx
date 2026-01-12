import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { projectsApi } from '@/services/api';
import { Project } from '@/types';
import { format } from 'date-fns';

import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useToast } from '@/hooks/use-toast';

const Projects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter || (!project.priority && priorityFilter === 'all');

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="glass-card hover-lift cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/20" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Use standard navigation if possible, but window.location is fine for now
                        window.location.href = `/projects/${project.id}`;
                      }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this project?')) {
                          try {
                            await projectsApi.delete(project.id);
                            toast({ title: 'Project deleted', description: 'The project has been removed.' });
                            fetchProjects();
                          } catch (error: any) {
                            console.error('Failed to delete', error);
                            toast({
                              title: 'Delete failed',
                              description: error.message || 'You might not be authorized to delete this project.',
                              variant: 'destructive'
                            });
                          }
                        }
                      }}>
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Project</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={project.status} />
                  {project.priority && (
                    <div className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                      ${project.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                        project.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-slate-500/10 text-slate-500'}`}
                    >
                      {project.priority}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No projects found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
