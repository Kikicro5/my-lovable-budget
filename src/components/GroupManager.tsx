import { useState } from 'react';
import { useGroup } from '@/hooks/useGroup';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, LogOut, UserMinus, Plus, KeyRound, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';

export const GroupManager = () => {
  const { t } = useLanguage();
  const { group, members, myRole, isLoading, canUseGroups, createGroup, joinGroup, leaveGroup, removeMember } = useGroup();
  const [inviteCode, setInviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  if (!canUseGroups) return null;
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Učitavanje...</span>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    setActionLoading(true);
    const result = await createGroup(groupName || undefined);
    if (result.success) {
      toast.success('Grupa kreirana!');
      setGroupName('');
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setActionLoading(true);
    const result = await joinGroup(inviteCode.trim());
    if (result.success) {
      toast.success('Uspješno ste se pridružili grupi!');
      setInviteCode('');
      setShowJoin(false);
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    setActionLoading(true);
    const result = await leaveGroup();
    if (result.success) {
      toast.success(myRole === 'owner' ? 'Grupa obrisana' : 'Napustili ste grupu');
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(true);
    const result = await removeMember(memberId);
    if (result.success) {
      toast.success('Član uklonjen');
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const copyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success('Kod kopiran!');
    }
  };

  // User is in a group
  if (group) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
        </div>

        {/* Invite code */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-muted/50">
          <KeyRound className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Kod:</span>
          <span className="font-mono font-bold text-sm tracking-widest text-foreground">{group.invite_code}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={copyInviteCode}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Members list */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Članovi ({members.length}/{group.max_members})
          </p>
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background">
              <div className="flex items-center gap-2 min-w-0">
                {member.role === 'owner' && <Crown className="w-3.5 h-3.5 text-primary shrink-0" />}
                <span className="text-sm text-foreground truncate">{member.email}</span>
              </div>
              {myRole === 'owner' && member.role !== 'owner' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" disabled={actionLoading}>
                      <UserMinus className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ukloni člana?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {member.email} će biti uklonjen/a iz grupe.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Odustani</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveMember(member.user_id)} className="bg-destructive hover:bg-destructive/90">
                        Ukloni
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>

        {/* Leave group */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" disabled={actionLoading}>
              <LogOut className="w-4 h-4" />
              {myRole === 'owner' ? 'Obriši grupu' : 'Napusti grupu'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {myRole === 'owner' ? 'Obrisati grupu?' : 'Napustiti grupu?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {myRole === 'owner'
                  ? 'Brisanjem grupe svi članovi će izgubiti pristup dijeljenim podacima.'
                  : 'Nećete više imati pristup dijeljenim podacima.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Odustani</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} className="bg-destructive hover:bg-destructive/90">
                {myRole === 'owner' ? 'Obriši' : 'Napusti'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // User is NOT in a group - show create/join options
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Dijeljenje podataka</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Povežite se s obitelji ili partnerom i dijelite iste financijske podatke u realnom vremenu.
      </p>

      {showJoin ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Unesite kod"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider"
              maxLength={6}
            />
            <Button onClick={handleJoin} disabled={actionLoading || !inviteCode.trim()}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pridruži se'}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowJoin(false)}>
            Natrag
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Naziv grupe (opcionalno)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={actionLoading} className="gap-1.5 shrink-0">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Kreiraj
            </Button>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowJoin(true)}>
            <KeyRound className="w-4 h-4" />
            Imam kod za pridruživanje
          </Button>
        </div>
      )}
    </div>
  );
};
