import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { teamApi } from '@/services/api';
import { TeamMember } from '@/types';
import { cn } from '@/lib/utils';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { MoreVertical, Trash2, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeam = async () => {
    try {
      const data = await teamApi.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch team', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await teamApi.remove(id);
      toast({ title: 'Member removed', description: 'User has been removed from the team.' });
      fetchTeam();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const handleUpdateRole = async (id: string, newRole: 'admin' | 'member') => {
    try {
      await teamApi.updateRole(id, newRole);
      toast({ title: 'Role updated', description: `User role updated to ${newRole}` });
      fetchTeam();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage your team members and their workload</p>
        </div>
        <InviteMemberDialog onInviteSent={fetchTeam} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="glass-card hover-lift relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}>
                    {member.role === 'admin' ? <User className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                    {member.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(member.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">{member.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                {member.workload && (
                  <Badge variant="outline" className={cn(
                    member.workload === 'high' ? 'status-on-hold' :
                      member.workload === 'medium' ? 'status-active' : 'status-pending'
                  )}>{member.workload} workload</Badge>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">{member.tasksAssigned || 0}</p>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">{member.tasksCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;
