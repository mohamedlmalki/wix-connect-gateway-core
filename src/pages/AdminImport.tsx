import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, CheckCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const AdminImport = () => {
  const { toast } = useToast();
  
  // State for the "Add Site" form
  const [siteName, setSiteName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isAddingSite, setIsAddingSite] = useState(false);

  // State for the list of sites
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  // --- THIS FUNCTION IS NOW CONNECTED TO THE BACKEND ---
  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingSite(true);
    try {
      const response = await fetch('/_functions/addSite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, siteId, apiKey }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to add site');
      }

      toast({
        title: "Success!",
        description: `Site "${siteName}" has been added.`,
      });

      // Clear the form and reload the site list
      setSiteName("");
      setSiteId("");
      setApiKey("");
      loadSites(); // Reload the list to include the new site

    } catch (error) {
      toast({
        title: "Error adding site",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingSite(false);
    }
  };

  // --- THIS FUNCTION IS NOW CONNECTED TO THE BACKEND ---
  const loadSites = async () => {
    setIsLoadingSites(true);
    try {
      const response = await fetch('/_functions/listSites');
      if (!response.ok) {
        throw new Error('Failed to fetch sites.');
      }
      const siteList = await response.json();
      setSites(siteList);

      // If there are sites, select the first one by default
      if (siteList.length > 0) {
        setSelectedSite(siteList[0]._id);
      }
    } catch (error) {
      toast({
        title: "Error loading sites",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSites(false);
    }
  };
  
  // Load sites when the component first mounts
  useEffect(() => {
    loadSites();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* --- Site Selection Card --- */}
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Site Selection</CardTitle>
              <CardDescription>Choose an active Wix site to manage from your list.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSites ? (
                <p className="text-muted-foreground">Loading sites...</p>
              ) : (
                <div className="max-w-md">
                  <Select value={selectedSite} onValueChange={setSelectedSite} disabled={sites.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="No sites added yet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="mt-4 rounded-lg border bg-background p-4">
                <p className="font-semibold text-sm">Active Site</p>
                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-2">
                  <CheckCircle className={`h-4 w-4 ${sites.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                  {sites.length > 0 ? 'Connected' : 'No site selected'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* --- Add New Site Card --- */}
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Add a New Site</CardTitle>
              <CardDescription>Add a new Wix site by providing its details and API key.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" placeholder="e.g., My Awesome Blog" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteId">Site ID</Label>
                  <Input id="siteId" placeholder="Enter the Wix Site ID" value={siteId} onChange={(e) => setSiteId(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" type="password" placeholder="Enter the secret API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isAddingSite} className="mt-4 gap-2">
                  {isAddingSite ? "Adding..." : "Add Site"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminImport;
