import { Bell, Search, Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { searchApi } from '@/services/api';
import { Project, TeamMember } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';


interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<import('@/types').Activity[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ projects: Project[], members: TeamMember[] }>({ projects: [], members: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const data = await searchApi.search(searchQuery);
          setResults(data);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults({ projects: [], members: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await import('@/services/api').then(m => m.activitiesApi.getRecent(5));
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Global Search */}
        <div className="flex items-center gap-4 flex-1 relative z-[60]">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden md:block max-w-md w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, members..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
            />

            {/* Search Results Dropdown */}
            {showResults && (searchQuery.length > 0) && (
              <div className="absolute top-full left-0 w-full mt-2 bg-popover text-popover-foreground rounded-md border shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : (results.projects.length === 0 && results.members.length === 0) ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    {results.projects.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Projects</div>
                        {results.projects.map(project => (
                          <Link
                            key={project.id || (project as any)._id}
                            to={`/projects/${project.id}`}
                            className="flex items-center px-3 py-2 hover:bg-muted/50 transition-colors"
                            onClick={() => { setShowResults(false); setSearchQuery(''); }}
                          >
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-primary">{project.name.charAt(0)}</span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{project.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}

                    {results.projects.length > 0 && results.members.length > 0 && <div className="h-px bg-border my-2" />}

                    {results.members.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Team</div>
                        {results.members.map(member => (
                          <div
                            key={member.id || (member as any)._id}
                            className="flex items-center px-3 py-2 hover:bg-muted/50 transition-colors cursor-default"
                          >
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-secondary-foreground">{member.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu onOpenChange={(open) => {
            if (open) {
              // Optimistically mark all as read locally
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              // Trigger backend update
              import('@/services/api').then(m => m.activitiesApi.markRead()).catch(err => console.error("Failed to mark read", err));
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id || (notification as any)._id} className={`flex flex-col items-start gap-1 p-3 ${notification.isRead ? 'opacity-50' : ''}`}>
                    <span className="font-medium text-sm capitalize">{notification.type.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{notification.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-primary text-sm cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name || 'User'}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
