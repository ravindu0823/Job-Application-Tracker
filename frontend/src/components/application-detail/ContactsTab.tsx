"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users2, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Linkedin
} from 'lucide-react';
import type { Contact } from '@/lib/types';

interface ContactsTabProps {
  contacts: Contact[];
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: number) => void;
}

export function ContactsTab({ 
  contacts, 
  onAddContact, 
  onEditContact, 
  onDeleteContact 
}: ContactsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recruiter & Hiring Contacts</h3>
        <Button onClick={onAddContact}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>
      
      {contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{contact.name}</CardTitle>
                    {contact.isPrimaryContact && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditContact(contact)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.position && (
                  <p className="text-sm text-muted-foreground">{contact.position}</p>
                )}
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.linkedin && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
                {contact.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No contacts added yet</p>
            <Button className="mt-4" onClick={onAddContact}>
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
