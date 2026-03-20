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
          <span className="text-sm text-muted-foreground">...</span>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    setActionLoading(true);
    const result = await createGroup(groupName || undefined);
    if (result.success) {
      toast.success(t('group.created'));
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
      toast.success(t('group.joined'));
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
      toast.success(myRole === 'owner' ? t('group.deleted') : t('group.left'));
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(true);
    const result = await removeMember(memberId);
    if (result.success) {
      toast.success(t('group.memberRemoved'));
    } else {
      toast.error(result.error);
    }
    setActionLoading(false);
  };

  const copyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success(t('group.codeCopied'));
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
          <span className="text-sm text-muted-foreground">{t('group.code')}:</span>
          <span className="font-mono font-bold text-sm tracking-widest text-foreground">{group.invite_code}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={copyInviteCode}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Members list */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('group.members')} ({members.length}/{group.max_members})
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
                      <AlertDialogTitle>{t('group.removeMember')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {member.email} {t('group.removeMemberWarning')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('group.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveMember(member.user_id)} className="bg-destructive hover:bg-destructive/90">
                        {t('group.remove')}
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
              {myRole === 'owner' ? t('group.deleteGroup') : t('group.leaveGroup')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {myRole === 'owner' ? t('group.deleteConfirm') : t('group.leaveConfirm')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {myRole === 'owner' ? t('group.deleteWarning') : t('group.leaveWarning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('group.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} className="bg-destructive hover:bg-destructive/90">
                {myRole === 'owner' ? t('group.remove') : t('group.leaveGroup')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // User is NOT in a group
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{t('group.title')}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t('group.description')}
      </p>

      {showJoin ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder={t('group.joinCodePlaceholder')}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider"
              maxLength={6}
            />
            <Button onClick={handleJoin} disabled={actionLoading || !inviteCode.trim()}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('group.join')}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowJoin(false)}>
            {t('group.back')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={t('group.namePlaceholder')}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={actionLoading} className="gap-1.5 shrink-0">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('group.create')}
            </Button>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowJoin(true)}>
            <KeyRound className="w-4 h-4" />
            {t('group.joinButton')}
          </Button>
        </div>
      )}
    </div>
  );
};
