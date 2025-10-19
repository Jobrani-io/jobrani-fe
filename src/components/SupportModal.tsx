import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [issueCategory, setIssueCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const submitSupportTicket = async () => {
    if (!issueCategory || !priority || !subject || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmittingTicket(true);

    try {
      // Here you would typically send the ticket data to your backend
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
      
      // Clear form and close modal
      setIssueCategory('');
      setPriority('');
      setSubject('');
      setDescription('');
      onClose();
    } catch (error) {
      toast.error('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issue Category */}
            <div className="space-y-2">
              <Label htmlFor="issue-category" className="text-sm font-medium">Issue Category *</Label>
              <Select value={issueCategory} onValueChange={setIssueCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="account">Account Problem</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority Level *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                  <SelectItem value="medium">Medium - Affecting usage</SelectItem>
                  <SelectItem value="high">High - Cannot use service</SelectItem>
                  <SelectItem value="critical">Critical - Service down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">Subject Line *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your issue in detail. Include steps to reproduce if applicable."
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={submitSupportTicket}
            disabled={isSubmittingTicket || !issueCategory || !priority || !subject || !description}
            className="w-full"
          >
            {isSubmittingTicket ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Response time: Within 24 hours during business days</p>
            <p>• For urgent issues, please include detailed steps to reproduce</p>
            <p>• Check our documentation for common questions and solutions</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;