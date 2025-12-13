'use client';

import { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Globe,
  Key,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingSection[] = [
  { id: 'general', title: 'Všeobecné', description: 'Základné nastavenia aplikácie', icon: Settings },
  { id: 'notifications', title: 'Notifikácie', description: 'Nastavenia emailov a upozornení', icon: Bell },
  { id: 'security', title: 'Bezpečnosť', description: 'Autentifikácia a prístupové práva', icon: Shield },
  { id: 'database', title: 'Databáza', description: 'Synchronizácia a zálohovanie', icon: Database },
  { id: 'api', title: 'API', description: 'API kľúče a limity', icon: Key },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General settings
  const [siteName, setSiteName] = useState('ScamNemesis');
  const [siteUrl, setSiteUrl] = useState('https://scamnemesis.com');
  const [defaultLanguage, setDefaultLanguage] = useState('sk');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@scamnemesis.com');
  const [newReportNotify, setNewReportNotify] = useState(true);
  const [newCommentNotify, setNewCommentNotify] = useState(true);

  // Security settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Database settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [typesenseSync, setTypesenseSync] = useState(true);

  // API settings
  const [rateLimitBasic, setRateLimitBasic] = useState('100');
  const [rateLimitStandard, setRateLimitStandard] = useState('500');
  const [rateLimitGold, setRateLimitGold] = useState('2000');

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Názov stránky</label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL stránky</label>
                <Input
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Predvolený jazyk</label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sk">Slovenčina</SelectItem>
                    <SelectItem value="cs">Čeština</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Režim údržby</label>
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant={maintenanceMode ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                  >
                    {maintenanceMode ? 'Aktívny' : 'Neaktívny'}
                  </Button>
                  {maintenanceMode && (
                    <Badge variant="warning">Stránka je v režime údržby</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Emailové notifikácie</p>
                  <p className="text-sm text-muted-foreground">Povoliť odosielanie emailov</p>
                </div>
                <Button
                  variant={emailNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                >
                  {emailNotifications ? 'Zapnuté' : 'Vypnuté'}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin email</label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Nové hlásenia</p>
                  <p className="text-sm text-muted-foreground">Notifikácia pri novom hlásení</p>
                </div>
                <Button
                  variant={newReportNotify ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewReportNotify(!newReportNotify)}
                >
                  {newReportNotify ? 'Zapnuté' : 'Vypnuté'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Nové komentáre</p>
                  <p className="text-sm text-muted-foreground">Notifikácia pri novom komentári</p>
                </div>
                <Button
                  variant={newCommentNotify ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewCommentNotify(!newCommentNotify)}
                >
                  {newCommentNotify ? 'Zapnuté' : 'Vypnuté'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Overenie emailu</p>
                <p className="text-sm text-muted-foreground">Vyžadovať overenie emailu pri registrácii</p>
              </div>
              <Button
                variant={requireEmailVerification ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequireEmailVerification(!requireEmailVerification)}
              >
                {requireEmailVerification ? 'Zapnuté' : 'Vypnuté'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max. pokusov o prihlásenie</label>
                <Input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout relácie (hodiny)</label>
                <Input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Dvojfaktorová autentifikácia</p>
                <p className="text-sm text-muted-foreground">Vyžadovať 2FA pre admin účty</p>
              </div>
              <Button
                variant={twoFactorEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? 'Zapnuté' : 'Vypnuté'}
              </Button>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stav databázy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">12,543</p>
                    <p className="text-sm text-muted-foreground">Hlásení</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">3,241</p>
                    <p className="text-sm text-muted-foreground">Používateľov</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">45,678</p>
                    <p className="text-sm text-muted-foreground">Komentárov</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Automatické zálohy</p>
                <p className="text-sm text-muted-foreground">Pravidelné zálohovanie databázy</p>
              </div>
              <Button
                variant={autoBackup ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoBackup(!autoBackup)}
              >
                {autoBackup ? 'Zapnuté' : 'Vypnuté'}
              </Button>
            </div>

            {autoBackup && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Frekvencia záloh</label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Každú hodinu</SelectItem>
                    <SelectItem value="daily">Denne</SelectItem>
                    <SelectItem value="weekly">Týždenne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Typesense synchronizácia</p>
                <p className="text-sm text-muted-foreground">Synchronizácia s full-text search indexom</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Synchronizované</Badge>
                <Button
                  variant={typesenseSync ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypesenseSync(!typesenseSync)}
                >
                  {typesenseSync ? 'Aktívne' : 'Neaktívne'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resync Typesense
              </Button>
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Vytvoriť zálohu teraz
              </Button>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Štatistiky</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Aktívnych API kľúčov</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">1.2M</p>
                    <p className="text-sm text-muted-foreground">Requestov tento mesiac</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-medium">Rate Limits (requestov/hodina)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Basic</label>
                  <Input
                    type="number"
                    value={rateLimitBasic}
                    onChange={(e) => setRateLimitBasic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Standard</label>
                  <Input
                    type="number"
                    value={rateLimitStandard}
                    onChange={(e) => setRateLimitStandard(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gold</label>
                  <Input
                    type="number"
                    value={rateLimitGold}
                    onChange={(e) => setRateLimitGold(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Dokumentácia</CardTitle>
                <CardDescription>Swagger/OpenAPI dokumentácia pre vývojárov</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <a href="/api-docs" target="_blank">
                    <Globe className="h-4 w-4 mr-2" />
                    Otvoriť API Docs
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nastavenia</h1>
          <p className="text-muted-foreground">Spravujte nastavenia aplikácie</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Ukladám...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Uložiť zmeny
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">{section.title}</p>
                    <p className={`text-xs ${
                      activeSection === section.id
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{sections.find(s => s.id === activeSection)?.title}</CardTitle>
              <CardDescription>
                {sections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
