import { useState, lazy, Suspense } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, ArrowLeft, Key, Users, DollarSign } from 'lucide-react';

const AdminCodes = lazy(() => import('@/components/admin/AdminCodes'));
const AdminUsers = lazy(() => import('@/components/admin/AdminUsers'));
const AdminPricing = lazy(() => import('@/components/admin/AdminPricing'));

const TabLoader = () => (
  <div className="flex justify-center py-8">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('codes');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">{t('admin.accessDenied')}</h2>
          <p className="text-muted-foreground">{t('admin.noPrivileges')}</p>
          <Button asChild><Link to="/">{t('admin.goHome')}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {t('admin.title')}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="codes" className="gap-1.5 text-xs">
              <Key className="w-3.5 h-3.5" />
              {t('admin.tabCodes')}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              {t('admin.tabUsers')}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" />
              {t('admin.tabPricing')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="codes">
            {activeTab === 'codes' && (
              <Suspense fallback={<TabLoader />}>
                <AdminCodes />
              </Suspense>
            )}
          </TabsContent>
          <TabsContent value="users">
            {activeTab === 'users' && (
              <Suspense fallback={<TabLoader />}>
                <AdminUsers />
              </Suspense>
            )}
          </TabsContent>
          <TabsContent value="pricing">
            {activeTab === 'pricing' && (
              <Suspense fallback={<TabLoader />}>
                <AdminPricing />
              </Suspense>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
