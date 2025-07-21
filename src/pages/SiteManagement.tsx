import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
// ADDED: Zap icon for the test button
import { Building, PlusCircle, RefreshCw, Terminal, Trash2, Zap } from "lucide-react"; 
import Navbar from "@/components/Navbar";

interface LogEntry {
    _id: string;
    _createdDate: string;
    message: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
    context: string;
}

interface ManagedSite {
    _id: string;
    siteName: string;
    siteId: string;
}

const SiteManagement = () => {
    // NEW: State for the form inputs to make them "controlled"
    const [siteName, setSiteName] = useState("");
    const [siteId, setSiteId] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [isTesting, setIsTesting] = useState(false);

    // Existing state
    const [sites, setSites] = useState<ManagedSite[]>([]);
    const [isLoadingSites, setIsLoadingSites] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [isClearingLogs, setIsClearingLogs] = useState(false);

    // NEW: Function to handle the test connection button click
    const handleTestConnection = async () => {
        if (!siteId || !apiKey) {
            toast.warning("Please enter a Site ID and API Key to test.");
            return;
        }
        setIsTesting(true);
        try {
            const response = await fetch('/_functions/testConnection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId, apiKey }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Connection test failed.');
            }
            
            toast.success(result.message);
            await fetchLogs();
        } catch (error) {
            if (error instanceof Error) toast.error(`Test failed: ${error.message}`);
            await fetchLogs();
        } finally {
            setIsTesting(false);
        }
    };

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const response = await fetch('/_functions/logs');
            if (!response.ok) throw new Error('Failed to fetch logs.');
            const logData = await response.json();
            setLogs(logData);
        } catch (error) {
            console.error(error);
            toast.error("Could not load backend activity logs.");
        } finally {
            setIsLoadingLogs(false);
        }
    };
    
    const handleClearLogs = async () => {
        setIsClearingLogs(true);
        try {
            const response = await fetch('/_functions/clearLogs', {
                method: 'POST'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to clear logs.');
            }
            const result = await response.json();
            toast.success(`Successfully cleared ${result.itemsRemoved} log entries.`);
            await fetchLogs();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsClearingLogs(false);
        }
    };

    const loadSites = async () => {
        setIsLoadingSites(true);
        try {
            const response = await fetch('/_functions/listSites');
            if (!response.ok) throw new Error('Failed to fetch sites.');
            const data = await response.json();
            setSites(data);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching managed sites.");
        } finally {
            setIsLoadingSites(false);
        }
    };

    useEffect(() => {
        loadSites();
        fetchLogs();
    }, []);

    const handleAddSite = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (isSubmitting || isTesting) return;

        setIsSubmitting(true);
        const currentSiteName = new FormData(form).get('siteName') as string;

        try {
            const response = await fetch('/_functions/addSite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }
            toast.success(`Site "${currentSiteName}" added successfully!`);
            form.reset();
            setSiteName("");
            setSiteId("");
            setApiKey("");
            await Promise.all([loadSites(), fetchLogs()]);
        } catch (error) {
            if (error instanceof Error) toast.error(`Failed to add site: ${error.message}`);
            await fetchLogs();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSite = async (itemId: string, siteName: string) => {
        try {
            const response = await fetch('/_functions/deleteSite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete site.');
            }
            toast.success(`Site "${siteName}" was deleted successfully.`);
            await Promise.all([loadSites(), fetchLogs()]);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            await fetchLogs();
        }
    };

    const getStatusColor = (status: LogEntry['status']) => {
        switch (status) {
            case 'SUCCESS': return 'text-green-400';
            case 'ERROR': return 'text-red-400';
            case 'INFO': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-4 animate-fade-in">
                        <Building className="h-10 w-10 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Site Management</h1>
                            <p className="text-muted-foreground">Add, view, and remove your managed Wix sites.</p>
                        </div>
                    </div>

                    <Card className="bg-gradient-card shadow-card border-primary/10">
                        <form onSubmit={handleAddSite}>
                            <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Add a New Site</CardTitle></CardHeader>
                            <CardContent>
                                {/* NEW: Replaced the grid layout with a controlled form layout */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="siteName">Site Name</Label>
                                        <Input id="siteName" name="siteName" placeholder="e.g., My Awesome Blog" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="siteId">Site ID</Label>
                                        <Input id="siteId" name="siteId" placeholder="Enter the Wix Site ID" value={siteId} onChange={(e) => setSiteId(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apiKey">API Key</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="apiKey" name="apiKey" type="password" placeholder="Enter the Wix API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required className="flex-grow" />
                                            <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                                                <Zap className={`mr-2 h-4 w-4 ${isTesting ? 'animate-pulse' : ''}`} />
                                                {isTesting ? 'Testing...' : 'Test'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSubmitting || isTesting} className="gap-2">
                                    {isSubmitting ? 'Adding...' : 'Add Site'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <Card className="bg-gradient-card shadow-card border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Managed Sites</CardTitle>
                                <CardDescription>List of all sites currently managed by this application.</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" onClick={loadSites} disabled={isLoadingSites}>
                                <RefreshCw className={`h-4 w-4 ${isLoadingSites ? 'animate-spin' : ''}`} />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Site Name</TableHead>
                                        <TableHead>Site ID</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingSites ? (
                                        <TableRow><TableCell colSpan={3} className="text-center">Loading sites...</TableCell></TableRow>
                                    ) : sites.length > 0 ? (
                                        sites.map((site) => (
                                            <TableRow key={site._id}>
                                                <TableCell className="font-medium">{site.siteName}</TableCell>
                                                <TableCell>{site.siteId}</TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the <strong>{site.siteName}</strong> and its API key.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteSite(site._id, site.siteName)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, delete it</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="text-center">No managed sites found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card shadow-card border-primary/10">
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
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete all log entries from the database.</AlertDialogDescription>
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
                            <div className="bg-gray-900 text-white font-mono text-sm p-4 rounded-md h-64 overflow-y-auto">
                                {isLoadingLogs ? ( <p>Loading logs...</p> ) : 
                                 logs.length > 0 ? (
                                    logs.map(log => (
                                        <div key={log._id} className="whitespace-pre-wrap">
                                            <span>{new Date(log._createdDate).toLocaleTimeString()}&nbsp;</span>
                                            <span className={getStatusColor(log.status)}>[{log.status}]</span>
                                            <span>&nbsp;{log.message}</span>
                                        </div>
                                    ))
                                ) : ( <p>No log entries found.</p> )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SiteManagement;