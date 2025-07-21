import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Upload, PlayCircle, Building, CheckCircle, Eye, RefreshCw, Terminal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

interface LogEntry {
  _id: string;
  _createdDate: string;
  status: 'INFO' | 'SUCCESS' | 'ERROR';
  message: string;
  context: string;
}

const AdminImport = () => {
  const { toast } = useToast();
  
  // State for Site Management
  const [siteName, setSiteName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  
  // State for Importer
  const [recipientEmails, setRecipientEmails] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [emailSubject, setEmailSubject] = useState("Welcome to Our Community!");
  const [emailBody, setEmailBody] = useState("<h1>Welcome!</h1>\n<p>Your account has been created.</p>");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // --- Site Management Functions ---
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
      await fetchLogs();
    } catch (error: any) {
      toast({ title: "Error adding site", description: error.message, variant: "destructive" });
      await fetchLogs();
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
      if (siteList.length > 0 && !selectedSite) {
        setSelectedSite(siteList[0]._id);
      }
    } catch (error: any) {
      toast({ title: "Error loading sites", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingSites(false);
    }
  };
  
  // --- Log Fetching Function ---
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
  
  // --- Main handleSubmit for Import Job ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast({ title: "Starting Job", description: "This is a UI demo. No users will be imported yet." });
    // TODO: Add the real import logic here
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <UserPlus className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Bulk User Import</h1>
              <p className="text-muted-foreground">Import multiple users into your selected Wix site.</p>
            </div>
          </div>
          
          {/* --- Site Management UI --- */}
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Site Selection</CardTitle><CardDescription>Choose an active Wix site to manage from your list.</CardDescription></CardHeader>
            <CardContent>
              {isLoadingSites ? <p>Loading sites...</p> : (
                <div className="max-w-md">
                  <Select value={selectedSite} onValueChange={setSelectedSite} disabled={sites.length === 0}><SelectTrigger><SelectValue placeholder="No sites added yet..." /></SelectTrigger><SelectContent>{sites.map((site) => (<SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>))}</SelectContent></Select>
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Emails */}
              <Card className="bg-gradient-card shadow-card border-primary/10">
                <CardHeader><CardTitle>Recipient Emails</CardTitle><CardDescription>Enter one email per line or import from a file.</CardDescription></CardHeader>
                <CardContent>
                  <Textarea value={recipientEmails} onChange={(e) => setRecipientEmails(e.target.value)} placeholder="user1@example.com&#10;user2@example.com" className="h-48 resize-y font-mono text-sm" required />
                  <Button type="button" variant="outline" size="sm" className="mt-4 gap-2"><Upload className="h-4 w-4" /> Import from File</Button>
                </CardContent>
              </Card>

              {/* Right Column: Email Actions */}
              <Card className="bg-gradient-card shadow-card border-primary/10">
                <CardHeader><CardTitle>Optional Email Actions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="send-welcome" checked={sendWelcomeEmail} onCheckedChange={(checked) => setSendWelcomeEmail(Boolean(checked))} /><Label htmlFor="send-welcome" className="cursor-pointer">Send welcome email to new users</Label>
                  </div>
                  {sendWelcomeEmail && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2"><Label htmlFor="subject">Email Subject</Label><Input id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Welcome aboard!" /></div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="body">Email Body (HTML supported)</Label>
                          <Dialog>
                            <DialogTrigger asChild><Button type="button" variant="ghost" size="sm" className="gap-2 text-xs"><Eye className="h-4 w-4" />Preview</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                              <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
                              <div className="p-4 border rounded-md min-h-[300px]"><div dangerouslySetInnerHTML={{ __html: emailBody }} /></div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Textarea id="body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Your message here..." className="h-28 resize-y" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-primary text-primary-foreground shadow-glow mt-8">
              <CardContent className="p-6 flex items-center justify-between">
                <div><h3 className="text-xl font-bold">Ready to Go?</h3><p className="text-primary-foreground/80">Start the import job for the selected site.</p></div>
                <Button type="submit" disabled={isSubmitting} className="w-48 bg-white text-primary hover:bg-white/90" size="lg"><PlayCircle className="mr-2 h-5 w-5" />{isSubmitting ? "Processing..." : "Start Job"}</Button>
              </CardContent>
            </Card>
          </form>
          
          <Card className="bg-gradient-card shadow-card border-primary/10">
            <CardHeader><div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Backend Activity Log</CardTitle><Button variant="ghost" size="sm" onClick={fetchLogs} disabled={isLoadingLogs}><RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} /></Button></div></CardHeader>
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

export default AdminImport;