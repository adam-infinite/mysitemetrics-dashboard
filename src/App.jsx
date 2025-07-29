import { useState, useEffect } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import GA4Dashboard from './components/GA4Dashboard';
import GA4CallbackHandler from './components/GA4CallbackHandler';
import apiService from './lib/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check for GA4 callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') || urlParams.get('error')) {
      setCurrentPage('ga4-callback');
      return;
    }
    
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await apiService.getProfile();
        setUser(profile.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (response) => {
    setUser(response.user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle GA4 callback page
  if (currentPage === 'ga4-callback') {
    return <GA4CallbackHandler />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {({ selectedWebsite, websites, setSelectedWebsite }) => {
        if (currentPage === 'ga4') {
          return (
            <GA4Dashboard onBack={() => setCurrentPage('dashboard')} />
          );
        }
        
        return (
          <DashboardOverview 
            website={selectedWebsite} 
            onNavigateToGA4={() => setCurrentPage('ga4')}
          />
        );
      }}
    </DashboardLayout>
  );
}

export default App;
