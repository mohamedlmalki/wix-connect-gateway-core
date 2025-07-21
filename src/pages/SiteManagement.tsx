import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building, CheckCircle, PlusCircle, RefreshCw, Terminal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

// Define the structure of a Log entry
interface LogEntry {
  _id: string;
  _createdDate: string;
  status: 'INFO' | 'SUCCESS' | 'ERROR';
  message: string;
  context: string;
}

const SiteManagement = () => {
  const { toast } = useToast();
  
  // State for the "Add Site" form
  const [siteName, setSiteName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isAddingSite, setIsAddingSite] = useState(false);

  // State for the list of sites
  const [sites, setSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  // State for the logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

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

      toast({ title: "Success!", description: `Site "${siteName}" has been added.` });
      setSiteName(""); setSiteId(""); setApiKey("");
      await loadSites();
      await fetchLogs(); // Refresh logs after adding a site

    } catch (error: any) {
      toast({ title: "Error adding site", description: error.message, variant: "destructive" });
      await fetchLogs(); // Refresh logs even if there is an error
    } finally {
      setIsAddingSite(false);
    }
  };

  const loadSites = async () => {
    setIsLoadingSites(true);
    try {
      const response = await fetch('/_functions/listSites');
      if (!response.ok) throw new Error('Failed to fetch sites.');
      const siteList = await response.json();
      setSites(siteList);
    } catch (error: any) {
      toast({ title: "Error loading sites", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingSites(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
        const response = await fetch('/_functions/logs');
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch logs.');
        };
        const logData = await response.json();
        setLogs(logData);
    } catch (error: any) {
        toast({ title: "Error loading logs", description: error.message, variant: "destructive" });
    } finally {
        setIsLoadingLogs(false);
    }
  };
  
  useEffect(() => {
    loadSites();
    fetchLogs();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'SUCCESS') return 'text-green-500';
    if (status === 'ERROR') return 'text-red-500';
    return 'text-muted-foreground';
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <Building className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Site Management</h1>
              <p className="text-muted-foreground">Add new Wix sites and view backend activity.</p>
            </div>
          </div>

          {/* --- Add New Site Card --- */}
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Add a New Site</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label htmlFor="siteName">Site Name</Label><Input id="siteName" placeholder="e.g., My Awesome Blog" value={siteName} onChange={(e) => setSiteName(e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="siteId">Site ID</Label><Input id="siteId" placeholder="Wix Site ID" value={siteId} onChange={(e) => setSiteId(e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" type="password" placeholder="Secret API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required /></div>
                </div>
                <Button type="submit" disabled={isAddingSite} className="mt-4 gap-2">{isAddingSite ? "Adding..." : "Add Site"}</Button>
              </form>
            </CardContent>
          </Card>
          
          {/* --- Live Log Viewer --- */}
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Backend Activity Log</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={isLoadingLogs}><RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-white font-mono text-xs rounded-lg p-4 h-64 overflow-y-auto">
                {isLoadingLogs ? <p>Loading logs...</p> : (logs.length === 0 ? <p>No log entries yet.</p> : logs.map(log => (
                  <div key={log._id} className="flex gap-4">
                    <span className="text-gray-500">{new Date(log._createdDate).toLocaleTimeString()}</span>
                    <span className={`${getStatusColor(log.status)} w-20`}>[{log.status}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteManagement;