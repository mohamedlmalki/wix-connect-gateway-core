import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserPlus, PlayCircle, Building, Terminal, RefreshCw, Trash2 } from "lucide-react"; 
import Navbar from "@/components/Navbar";

// ★★★ THE FIX IS HERE ★★★
// This now points to your Velo backend functions
const API_BASE_URL = "/_functions";

interface LogEntry {
    _id: string;
    _createdDate: string;
    status: 'INFO' | 'SUCCESS' | 'ERROR';
    message: string;
    context: string;
}

interface ManagedSite {
    _id: string;
    siteName: string;
    siteId: string;
}

const AdminImport = () => {
    const [sites, setSites] = useState<ManagedSite[]>([]);
    const [selectedSite, setSelectedSite] = useState("");
    const [isLoadingSites, setIsLoadingSites] = useState(true);
    const [recipientEmails, setRecipientEmails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [customSubject, setCustomSubject] = useState("Welcome to Our Community!");
    const [customMessage, setCustomMessage] = useState("Your account has been created.");

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [isClearingLogs, setIsClearingLogs] = useState(false); // Added for clear logs button

    const loadSites = async () => {
        setIsLoadingSites(true);
        try {
            const response = await fetch(`${API_BASE_URL}/listSites`); // Correct Velo endpoint
            if (!response.ok) throw new Error('Failed to fetch sites.');
            const siteList = await response.json();
            setSites(siteList);
            if (siteList.length > 0 && !selectedSite) {
                setSelectedSite(siteList[0].siteId); 
            }
        } catch (error: any) {
            toast.error("Error loading sites", { description: error.message });
        } finally {
            setIsLoadingSites(false);
        }
    };

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/logs`); // Correct Velo endpoint
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch logs.');
            };
            const logData = await response.json();
            setLogs(logData);
        } catch (error: any) {
            toast.error("Error loading logs", { description: error.message });
        } finally {
            setIsLoadingLogs(false);
        }
    };
    
    // ★★★ NEW FUNCTION to handle clearing logs ★★★
    const handleClearLogs = async () => {
        setIsClearingLogs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/clearLogs`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to clear logs.');
            }
            toast.success(`Successfully cleared log entries.`);
            await fetchLogs();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsClearingLogs(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSite || !recipientEmails) {
            toast.warning("Missing Information", { description: "Please select a site and provide at least one email." });
            return;
        }
        setIsSubmitting(true);

        const usersToImport = recipientEmails
            .split('\n')
            .map(email => email.trim())
            .filter(email => email.includes('@'))
            .map(email => ({ email }));

        if (usersToImport.length === 0) {
            toast.warning("No Valid Emails", { description: "No valid email addresses found to import." });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/importUsers`, { // Correct Velo endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetSiteId: selectedSite,
                    usersToImport,
                    customSubject: customSubject,
                    customMessage: customMessage
                })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || "An unknown error occurred.");
            }

            toast.success("Job Started", { description: "The user import job has started. Check the logs for progress." });
            await fetchLogs();
        } catch (error: any) {
            toast.error("Import Error", { description: error.message });
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
        if (status === 'SUCCESS') return 'text-green-400';
        if (status === 'ERROR') return 'text-red-400';
        return 'text-blue-400';
    }

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* (Your UI code is the same...) */}
                    <div className="flex items-center gap-4 animate-fade-in"><UserPlus className="h-10 w-10 text-primary" /><div><h1 className="text-3xl font-bold">Bulk User Import</h1><p className="text-muted-foreground">Import users and send custom welcome emails.</p></div></div>
                    <Card className="bg-gradient-card shadow-card border-primary/10"><CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Site Selection</CardTitle><CardDescription>Choose an active Wix site to import users into.</CardDescription></CardHeader><CardContent>{isLoadingSites ? <p>Loading sites...</p> : (<div className="max-w-md"><Select value={selectedSite} onValueChange={setSelectedSite} disabled={sites.length === 0}><SelectTrigger><SelectValue placeholder="No sites added yet..." /></SelectTrigger><SelectContent>{sites.map((site) => (site && <SelectItem key={site._id} value={site.siteId}>{site.siteName}</SelectItem>))}</SelectContent></Select></div>)}</CardContent></Card>
                    <form onSubmit={handleSubmit}><div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"><Card className="bg-gradient-card shadow-card border-primary/10"><CardHeader><CardTitle>Recipient Emails</CardTitle><CardDescription>Enter one email address per line.</CardDescription></CardHeader><CardContent><Textarea value={recipientEmails} onChange={(e) => setRecipientEmails(e.target.value)} placeholder="user1@example.com&#10;user2@example.com" className="h-48 resize-y font-mono text-sm" required /></CardContent></Card><Card className="bg-gradient-card shadow-card border-primary/10"><CardHeader><CardTitle>Custom Welcome Email</CardTitle><CardDescription>This content will be sent using your Triggered Email template.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="subject">Email Subject</Label><Input id="subject" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Welcome aboard!" /></div><div className="space-y-2"><Label htmlFor="body">Email Message</Label><Textarea id="body" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Your custom message here..." className="h-28 resize-y" /></div></CardContent></Card></div><Card className="bg-gradient-primary text-primary-foreground shadow-glow mt-8"><CardContent className="p-6 flex items-center justify-between"><div><h3 className="text-xl font-bold">Ready to Go?</h3><p className="text-primary-foreground/80">Start the import job for the selected site.</p></div><Button type="submit" disabled={isSubmitting} className="w-48 bg-white text-primary hover:bg-white/90" size="lg"><PlayCircle className="mr-2 h-5 w-5" />{isSubmitting ? "Processing..." : "Start Job"}</Button></CardContent></Card></form>
                    
                    <Card className="bg-gradient-card shadow-card border-primary/10">
                        {/* ★★★ THE FIX IS HERE: The header now includes the Clear Logs button ★★★ */}
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Backend Activity Log</CardTitle>
                                <CardDescription>Recent events from the backend functions.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" disabled={isClearingLogs}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Clear All Logs?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                {isClearingLogs ? 'Clearing...' : 'Yes, Clear Logs'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button variant="outline" size="icon" onClick={fetchLogs} disabled={isLoadingLogs}>
                                    <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-900 text-white font-mono text-xs rounded-lg p-4 h-64 overflow-y-auto">
                                {isLoadingLogs ? <p>Loading logs...</p> : (logs.length === 0 ? <p>No log entries yet.</p> : 
                                    logs.filter(log => log).map(log => (
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