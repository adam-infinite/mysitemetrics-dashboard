import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Globe, 
  BarChart3,
  ExternalLink
} from 'lucide-react';
import apiService from '@/lib/api';

export default function GA4PropertySelector({ onPropertySelect }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);

  useEffect(() => {
    loadGA4Accounts();
  }, []);

  const loadGA4Accounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/ga4/accounts');
      setAccounts(response.accounts || []);
      
      // Auto-select first account if only one
      if (response.accounts?.length === 1) {
        setSelectedAccount(response.accounts[0]);
        loadAccountProperties(response.accounts[0].id);
      }
    } catch (err) {
      console.error('Failed to load GA4 accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountProperties = async (accountId) => {
    try {
      setLoadingProperties(true);
      const response = await apiService.get(`/ga4/accounts/${accountId}/properties`);
      setProperties(response.properties || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setProperties([]);
    loadAccountProperties(account.id);
  };

  const handlePropertySelect = (property) => {
    onPropertySelect({
      account: selectedAccount,
      property: property
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No GA4 Accounts</h3>
          <p className="text-muted-foreground">
            Please connect a GA4 account first to view analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Selection */}
      {accounts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select GA4 Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {accounts.map((account) => (
                <Button
                  key={account.id}
                  variant={selectedAccount?.id === account.id ? "default" : "outline"}
                  onClick={() => handleAccountSelect(account)}
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {account.email}
                  <Badge variant="secondary" className="ml-auto">
                    {account.properties_count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Selection */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Select GA4 Property</CardTitle>
            <CardDescription>
              Choose which website property to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProperties ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No properties found for this account</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {properties.map((property) => (
                  <Button
                    key={property.id}
                    variant="outline"
                    onClick={() => handlePropertySelect(property)}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Globe className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{property.property_name}</div>
                        {property.website_url && (
                          <div className="text-sm text-muted-foreground">
                            {property.website_url}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Property ID: {property.property_id}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
