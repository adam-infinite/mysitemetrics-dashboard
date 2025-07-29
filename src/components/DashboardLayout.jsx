import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, 
  Globe, 
  Users, 
  Eye, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import apiService from '@/lib/api';

export default function DashboardLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const response = await apiService.getWebsites();
      setWebsites(response.websites || []);
      if (response.websites && response.websites.length > 0) {
        setSelectedWebsite(response.websites[0]);
      }
    } catch (error) {
      console.error('Failed to load websites:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway
    }
  };

  const sidebarItems = [
    { icon: BarChart3, label: 'Overview', id: 'overview', color: 'text-primary' },
    { icon: Users, label: 'Traffic', id: 'traffic', color: 'text-[var(--color-traffic)]' },
    { icon: Globe, label: 'Pages', id: 'pages', color: 'text-[var(--color-pages)]' },
    { icon: Eye, label: 'Engagement', id: 'engagement', color: 'text-[var(--color-engagement)]' },
    { icon: TrendingUp, label: 'Real-time', id: 'realtime', color: 'text-[var(--color-realtime)]' },
  ];

  // Add admin panel for admin users
  const adminItems = user?.role === 'admin' ? [
    { icon: Settings, label: 'Admin Panel', id: 'admin', color: 'text-red-600' },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Analytics</h1>
                  <p className="text-sm text-muted-foreground">Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Website Selector */}
          {selectedWebsite && (
            <div className="p-4 border-b border-border">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Current Website
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="font-medium text-sm truncate">
                  {selectedWebsite.domain}
                </div>
                <div className="text-xs text-muted-foreground">
                  {websites.length} website{websites.length !== 1 ? 's' : ''} total
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start hover:bg-secondary/80"
                >
                  <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                  {item.label}
                </Button>
              ))}
              
              {/* Admin Section */}
              {adminItems.length > 0 && (
                <>
                  <div className="pt-4 pb-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Administration
                    </div>
                  </div>
                  {adminItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50 hover:text-red-700"
                    >
                      <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                      {item.label}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {user?.full_name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedWebsite ? selectedWebsite.domain : 'Dashboard'}
                </h2>
                <p className="text-muted-foreground">
                  Analytics overview and insights
                </p>
              </div>
            </div>
            
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Live data</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children({ selectedWebsite, websites, setSelectedWebsite })}
        </main>
      </div>
    </div>
  );
}

