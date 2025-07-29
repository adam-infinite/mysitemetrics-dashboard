import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import GA4ConnectionCard from './GA4ConnectionCard';
import GA4PropertySelector from './GA4PropertySelector';

export default function GA4Dashboard({ onBack }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handlePropertySelect = (selection) => {
    setSelectedProperty(selection);
  };

  const handleBackToSelection = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={onBack} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Google Analytics 4
          </h2>
          <p className="text-muted-foreground">
            Connect and view your GA4 analytics data
          </p>
        </div>
      </div>

      {/* Content */}
      {!selectedProperty ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Card */}
          <GA4ConnectionCard />
          
          {/* Property Selector */}
          <GA4PropertySelector onPropertySelect={handlePropertySelect} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Property Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {selectedProperty.property.property_name}
                  </CardTitle>
                  <CardDescription>
                    {selectedProperty.property.website_url || 'No URL specified'}
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleBackToSelection}
                  variant="outline"
                  size="sm"
                >
                  Change Property
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Analytics Dashboard - Coming in Phase 5 */}
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
              <p className="text-muted-foreground">
                Real-time GA4 analytics data will be displayed here in Phase 5
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
