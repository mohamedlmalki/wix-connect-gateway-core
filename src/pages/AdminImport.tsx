import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Upload, PlayCircle, Building, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const AdminImport = () => {
  // State for the form fields
  const [selectedSite, setSelectedSite] = useState("site-1");
  const [recipientEmails, setRecipientEmails] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [emailSubject, setEmailSubject] = useState("Welcome to Our Community!");
  const [emailBody, setEmailBody] = useState("<h1>Welcome!</h1>\n<p>Hi there,</p>\n<p>We've created an account for you. Your temporary password will be provided upon successful registration.</p>\n<p>Best,<br>The Team</p>");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast({ title: "Starting Job", description: "This is a UI demo. No users will be imported yet." });
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <UserPlus className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Bulk User Import</h1>
              <p className="text-muted-foreground">Import multiple users into your selected Wix site.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Site Selection --- */}
            <Card className="bg-gradient-card shadow-card border-primary/10 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Site Selection</CardTitle>
                <CardDescription>Choose which Wix site you want to import users into.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger><SelectValue placeholder="Select a site..." /></SelectTrigger>
                    <SelectContent>
                      {/* This will be populated from the backend later */}
                      <SelectItem value="site-1">My E-commerce Site</SelectItem>
                      <SelectItem value="site-2">My Blog</SelectItem>
                      <SelectItem value="site-3">Client Project A</SelectItem>
                      <SelectItem value="site-4">Client Project B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 rounded-lg border bg-background p-4">
                  <p className="font-semibold text-sm">Active Site</p>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 mt-2"><CheckCircle className="h-4 w-4 text-green-500" />Connected</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Emails and Settings */}
              <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Card className="bg-gradient-card shadow-card border-primary/10">
                  <CardHeader>
                    <CardTitle>Recipient Emails</CardTitle>
                    <CardDescription>Enter one email per line or import from a file.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={recipientEmails} onChange={(e) => setRecipientEmails(e.target.value)} placeholder="user1@example.com&#10;user2@example.com" className="h-40 resize-y font-mono text-sm" required />
                    <Button type="button" variant="outline" size="sm" className="mt-4 gap-2"><Upload className="h-4 w-4" /> Import from File</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Email Actions */}
              <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Card className="bg-gradient-card shadow-card border-primary/10">
                  <CardHeader>
                    <CardTitle>Optional Email Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="send-welcome" checked={sendWelcomeEmail} onCheckedChange={(checked) => setSendWelcomeEmail(Boolean(checked))} />
                      <Label htmlFor="send-welcome" className="cursor-pointer">Send welcome email to new users</Label>
                    </div>
                    {sendWelcomeEmail && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Email Subject</Label>
                          <Input id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Welcome aboard!" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="body">Email Body (HTML supported)</Label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="gap-2 text-xs"><Eye className="h-4 w-4" />Preview</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                  <DialogTitle>Email Preview</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 border rounded-md min-h-[300px]">
                                  <div dangerouslySetInnerHTML={{ __html: emailBody }} />
                                </div>
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
            </div>

            {/* --- Start Job --- */}
            <Card className="bg-gradient-primary text-primary-foreground shadow-glow animate-glow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Ready to Go?</h3>
                  <p className="text-primary-foreground/80">Start the import job for the selected site.</p>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-48 bg-white text-primary hover:bg-white/90" size="lg">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Processing..." : "Start Job"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminImport;