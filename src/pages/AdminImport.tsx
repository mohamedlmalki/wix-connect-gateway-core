import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// --- NEW: Added KeyRound icon ---
import { UserPlus, Upload, PlayCircle, Building, CheckCircle, Eye, RefreshCw, Terminal, KeyRound } from "lucide-react"; 
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
// --- NEW: Import faker library ---
import { faker } from "@faker-js/faker"; 

interface LogEntry {
    _id: string;
    _createdDate: string;
    status: 'INFO' | 'SUCCESS' | 'ERROR';
    message: string;
    context: string;
}

interface ManagedSite {
    _id: string,
    siteName: string,
    siteId: string
}

const AdminImport = () => {
    const { toast } = useToast();

    // State for Site Management
    const [sites, setSites] = useState<ManagedSite[]>([]);
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

    // This function is unchanged
    const loadSites = async () => {
        setIsLoadingSites(true);
        try {
            const response = await fetch('/_functions/listSites');
            if (!response.ok) throw new Error('Failed to fetch sites.');
            const siteList = await response.json();
            setSites(siteList);
            if (siteList.length > 0 && !selectedSite) {
                // Set the siteId for the backend, not the database _id
                setSelectedSite(siteList[0].siteId); 
            }
        } catch (error: any) {
            toast({ title: "Error loading sites", description: error.message, variant: "destructive" });
        } finally {
            setIsLoadingSites(false);
        }
    };

    // This function is unchanged
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

    // --- NEW: Function to generate passwords ---
    const handleGeneratePasswords = () => {
        if (!recipientEmails) {
            toast({ title: "No Emails", description: "Please enter at least one email address.", variant: "destructive" });
            return;
        }

        const lines = recipientEmails.split('\n').filter(line => line.trim() !== "");
        
        const processedLines = lines.map(line => {
            const email = line.split(':')[0].trim();
            if (!email.includes('@')) return line; // Leave lines that aren't emails alone

            // Generate a secure 12-character password
            const password = faker.internet.password({ length: 12, memorable: false, pattern: /\w/ });
            return `${email}:${password}`; // Use a colon as a separator
        });

        setRecipientEmails(processedLines.join('\n'));
        toast({ title: "Success", description: "Passwords have been generated for all emails." });
    };

    // --- MODIFIED: The main import function is now updated to handle the new format ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSite || !recipientEmails) {
            toast({ title: "Missing Information", description: "Please select a site and provide user data.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        const usersToImport = recipientEmails.split('\n').filter(line => line.includes(':')).map(line => {
            const parts = line.split(':');
            return {
                email: parts[0].trim(),
                password: parts.slice(1).join(':').trim() // This correctly handles passwords that might contain a colon
            };
        });

        if (usersToImport.length === 0) {
            toast({ title: "Invalid Format", description: "No valid users to import. Please ensure the format is 'email:password'.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/_functions/importUsers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetSiteId: selectedSite,
                    usersToImport
                })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || "An unknown error occurred.");
            }

            toast({ title: "Job Started", description: "The user import job has started. Check the logs for real-time progress." });
            await fetchLogs();
        } catch (error: any) {
            toast({ title: "Import Error", description: error.message, variant: "destructive" });
            await fetchLogs();
        } finally {
            setIsSubmitting(false);
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
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center gap-4 animate-fade-in">
                        <UserPlus className="h-10 w-10 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Bulk User Import</h1>
                            <p className="text-muted-foreground">Import multiple users into your selected Wix site.</p>
                        </div>
                    </div>
                    
                    <Card className="bg-gradient-card shadow-card border-primary/10">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Site Selection</CardTitle><CardDescription>Choose an active Wix site to manage from your list.</CardDescription></CardHeader>
                        <CardContent>
                            {isLoadingSites ? <p>Loading sites...</p> : (
                                <div className="max-w-md">
                                    <Select value={selectedSite} onValueChange={setSelectedSite} disabled={sites.length === 0}>
                                        <SelectTrigger><SelectValue placeholder="No sites added yet..." /></SelectTrigger>
                                        <SelectContent>{sites.map((site) => (<SelectItem key={site._id} value={site.siteId}>{site.siteName}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <Card className="bg-gradient-card shadow-card border-primary/10">
                                <CardHeader><CardTitle>Recipient Emails</CardTitle><CardDescription>Enter one email per line, then generate passwords.</CardDescription></CardHeader>
                                <CardContent>
                                    <Textarea value={recipientEmails} onChange={(e) => setRecipientEmails(e.target.value)} placeholder="user1@example.com&#10;user2@example.com" className="h-48 resize-y font-mono text-sm" required />
                                    
                                    {/* --- NEW: Button to generate passwords --- */}
                                    <Button type="button" variant="outline" size="sm" className="mt-4 gap-2" onClick={handleGeneratePasswords}>
                                        <KeyRound className="h-4 w-4" /> Generate Passwords
                                    </Button>

                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-card shadow-card border-primary/10">
                                <CardHeader><CardTitle>Optional Email Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="send-welcome" checked={sendWelcomeEmail} onCheckedChange={(checked) => setSendWelcomeEmail(Boolean(checked))} />
                                        <Label htmlFor="send-welcome" className="cursor-pointer">Send welcome email to new users</Label>
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