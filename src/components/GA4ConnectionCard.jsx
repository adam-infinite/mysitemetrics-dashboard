import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import apiService from '@/lib/api';

export default function GA4ConnectionCard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGA4Accounts();
  }, []);

  const loadGA4Accounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/ga4/accounts');
      setAccounts(response.accounts || []);
    } catch (err) {
      setError('Failed to load GA4 accounts');
      console.error('GA4 accounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGA4 = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // Start OAuth flow
      const response = await apiService.post('/ga4/auth/google/start');
      
      // Redirect to Google OAuth
      window.location.href = response.authorization_url;
      
    } catch (err) {
      setError('Failed to start Google authentication');
      setConnecting(false);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this GA4 account?')) {
      return;
    }

    try {
      await apiService.delete(`/ga4/accounts/${accountId}/disconnect`);
      await loadGA4Accounts(); // Reload accounts
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics 4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Google Analytics 4
        </CardTitle>
        <CardDescription>
          Connect your GA4 accounts to view analytics data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No GA4 Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Google Analytics 4 account to start viewing your website analytics
            </p>
            <Button 
              onClick={handleConnectGA4} 
              disabled={connecting}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect GA4 Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Connected Accounts</h4>
              <Button 
                onClick={handleConnectGA4} 
                disabled={connecting}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>

            {accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{account.email}</span>
                    <Badge variant="secondary">
                      {account.properties_count} {account.properties_count === 1 ? 'Property' : 'Properties'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleDisconnectAccount(account.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connected on {new Date(account.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

