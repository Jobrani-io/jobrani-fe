import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Linkedin, Search, User } from 'lucide-react';
import { JobOpportunity, JobContact } from '@/data/jobOpportunities';

interface ContactEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobOpportunity | null;
  onSaveContact: (jobId: string, contact: JobContact) => void;
}

const ContactEditModal: React.FC<ContactEditModalProps> = ({
  isOpen,
  onClose,
  job,
  onSaveContact
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'manual' | 'linkedin'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualContact, setManualContact] = useState({
    name: '',
    title: '',
    linkedinUrl: '',
    mutualConnections: 0
  });

  const handleSaveManualContact = () => {
    if (!job || !manualContact.name || !manualContact.title) return;
    
    const newContact: JobContact = {
      id: `manual-${Date.now()}`,
      name: manualContact.name,
      title: manualContact.title,
      linkedinUrl: manualContact.linkedinUrl,
      mutualConnections: manualContact.mutualConnections,
      matchScore: 95 // High score for manually added contacts
    };

    onSaveContact(job.id, newContact);
    handleClose();
  };

  const handleSelectExistingContact = (contact: JobContact) => {
    if (!job) return;
    onSaveContact(job.id, contact);
    handleClose();
  };

  const handleClose = () => {
    setManualContact({
      name: '',
      title: '',
      linkedinUrl: '',
      mutualConnections: 0
    });
    setSearchQuery('');
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contact for {job.company}</DialogTitle>
          <DialogDescription>
            {job.jobTitle} • Current status: {job.matchStatus === 'multiple-matches' ? 'Multiple matches found' : 'No matches found'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'search' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Search className="h-4 w-4" />
              Search Existing
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'manual' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <User className="h-4 w-4" />
              Add Manually
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'linkedin' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Import
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {job.matchStatus === 'multiple-matches' && job.potentialContacts.length > 0 && (
                <div className="space-y-3">
                  <Label>Select from existing matches:</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {job.potentialContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelectExistingContact(contact)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {contact.mutualConnections} mutual connections
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {contact.matchScore}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {job.matchStatus === 'no-match' && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No existing contacts found for this job.</p>
                  <p className="text-sm">Try adding a contact manually or importing from LinkedIn.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={manualContact.name}
                    onChange={(e) => setManualContact({ ...manualContact, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={manualContact.title}
                    onChange={(e) => setManualContact({ ...manualContact, title: e.target.value })}
                    placeholder="Hiring Manager"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={manualContact.linkedinUrl}
                    onChange={(e) => setManualContact({ ...manualContact, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/johnsmith"
                  />
                </div>
                <div>
                  <Label htmlFor="connections">Mutual Connections</Label>
                  <Input
                    id="connections"
                    type="number"
                    min="0"
                    value={manualContact.mutualConnections}
                    onChange={(e) => setManualContact({ ...manualContact, mutualConnections: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveManualContact}
                  disabled={!manualContact.name || !manualContact.title}
                >
                  Save Contact
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Linkedin className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-medium mb-2">Import from LinkedIn</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste a LinkedIn profile URL or use our browser extension to import contact details.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Paste LinkedIn profile URL..."
                    className="max-w-md mx-auto"
                  />
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm">
                      Import from URL
                    </Button>
                    <Button variant="outline" size="sm">
                      Use Extension
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactEditModal;