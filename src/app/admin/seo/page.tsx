'use client';

import { useState } from 'react';
import {
  Globe,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Types
interface SeoMeta {
  id: string;
  entityType: 'page' | 'report' | 'home';
  entityId: string | null;
  entityName?: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  canonicalUrl: string | null;
  updatedAt: string;
}

interface SeoRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  hitCount: number;
  lastHitAt: string | null;
}

// Mock data
const mockSeoMeta: SeoMeta[] = [
  {
    id: '1',
    entityType: 'home',
    entityId: null,
    entityName: 'Domovská stránka',
    title: 'Scamnemesis - Ochrana pred podvodníkmi',
    description: 'Najväčšia databáza podvodníkov na Slovensku. Overte si či s vami nekomunikuje podvodník.',
    keywords: ['podvod', 'scam', 'podvodník', 'ochrana'],
    ogTitle: 'Scamnemesis',
    ogDescription: 'Chráňte sa pred podvodníkmi',
    ogImage: '/og-image.jpg',
    noIndex: false,
    noFollow: false,
    canonicalUrl: 'https://scamnemesis.com',
    updatedAt: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    entityType: 'page',
    entityId: 'about',
    entityName: 'O nás',
    title: 'O projekte Scamnemesis',
    description: 'Dozveďte sa viac o projekte Scamnemesis a našej misii.',
    keywords: ['o nás', 'misia', 'tím'],
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    noIndex: false,
    noFollow: false,
    canonicalUrl: null,
    updatedAt: '2024-12-09T14:20:00Z',
  },
  {
    id: '3',
    entityType: 'page',
    entityId: 'terms',
    entityName: 'Podmienky používania',
    title: 'Podmienky používania | Scamnemesis',
    description: 'Prečítajte si podmienky používania služby Scamnemesis.',
    keywords: ['podmienky', 'pravidlá'],
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    noIndex: true,
    noFollow: false,
    canonicalUrl: null,
    updatedAt: '2024-12-08T09:15:00Z',
  },
];

const mockRedirects: SeoRedirect[] = [
  {
    id: '1',
    fromPath: '/old-page',
    toPath: '/new-page',
    statusCode: 301,
    isActive: true,
    hitCount: 156,
    lastHitAt: '2024-12-10T08:45:00Z',
  },
  {
    id: '2',
    fromPath: '/blog',
    toPath: 'https://blog.scamnemesis.com',
    statusCode: 302,
    isActive: true,
    hitCount: 42,
    lastHitAt: '2024-12-09T22:30:00Z',
  },
  {
    id: '3',
    fromPath: '/report',
    toPath: '/report/new',
    statusCode: 301,
    isActive: false,
    hitCount: 0,
    lastHitAt: null,
  },
];

export default function AdminSeoPage() {
  const [seoMeta, setSeoMeta] = useState<SeoMeta[]>(mockSeoMeta);
  const [redirects, setRedirects] = useState<SeoRedirect[]>(mockRedirects);
  const [editingMeta, setEditingMeta] = useState<SeoMeta | null>(null);
  const [editingRedirect, setEditingRedirect] = useState<SeoRedirect | null>(null);
  const [showNewRedirect, setShowNewRedirect] = useState(false);

  // Form states for editing
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formNoIndex, setFormNoIndex] = useState(false);
  const [formNoFollow, setFormNoFollow] = useState(false);
  const [formCanonical, setFormCanonical] = useState('');

  // Redirect form states
  const [redirectFrom, setRedirectFrom] = useState('');
  const [redirectTo, setRedirectTo] = useState('');
  const [redirectStatus, setRedirectStatus] = useState('301');

  // Start editing SEO meta
  const startEditingMeta = (meta: SeoMeta) => {
    setEditingMeta(meta);
    setFormTitle(meta.title || '');
    setFormDescription(meta.description || '');
    setFormKeywords(meta.keywords.join(', '));
    setFormNoIndex(meta.noIndex);
    setFormNoFollow(meta.noFollow);
    setFormCanonical(meta.canonicalUrl || '');
  };

  // Save SEO meta
  const saveMeta = () => {
    if (!editingMeta) return;

    setSeoMeta((prev) =>
      prev.map((m) =>
        m.id === editingMeta.id
          ? {
              ...m,
              title: formTitle,
              description: formDescription,
              keywords: formKeywords.split(',').map((k) => k.trim()).filter(Boolean),
              noIndex: formNoIndex,
              noFollow: formNoFollow,
              canonicalUrl: formCanonical || null,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
    toast.success('SEO nastavenia boli uložené');
    setEditingMeta(null);
  };

  // Start editing redirect
  const startEditingRedirect = (redirect: SeoRedirect) => {
    setEditingRedirect(redirect);
    setRedirectFrom(redirect.fromPath);
    setRedirectTo(redirect.toPath);
    setRedirectStatus(redirect.statusCode.toString());
  };

  // Save redirect
  const saveRedirect = () => {
    if (editingRedirect) {
      setRedirects((prev) =>
        prev.map((r) =>
          r.id === editingRedirect.id
            ? {
                ...r,
                fromPath: redirectFrom,
                toPath: redirectTo,
                statusCode: parseInt(redirectStatus),
              }
            : r
        )
      );
      toast.success('Presmerovanie bolo uložené');
      setEditingRedirect(null);
    } else if (showNewRedirect) {
      const newRedirect: SeoRedirect = {
        id: crypto.randomUUID(),
        fromPath: redirectFrom,
        toPath: redirectTo,
        statusCode: parseInt(redirectStatus),
        isActive: true,
        hitCount: 0,
        lastHitAt: null,
      };
      setRedirects((prev) => [newRedirect, ...prev]);
      toast.success('Presmerovanie bolo vytvorené');
      setShowNewRedirect(false);
    }
    setRedirectFrom('');
    setRedirectTo('');
    setRedirectStatus('301');
  };

  // Toggle redirect active
  const toggleRedirect = (id: string) => {
    setRedirects((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      )
    );
    toast.success('Presmerovanie bolo aktualizované');
  };

  // Delete redirect
  const deleteRedirect = (id: string) => {
    setRedirects((prev) => prev.filter((r) => r.id !== id));
    toast.success('Presmerovanie bolo vymazané');
  };

  // Generate sitemap
  const generateSitemap = () => {
    toast.success('Sitemap bola vygenerovaná');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Nastavenia</h2>
          <p className="text-muted-foreground">
            Správa meta tagov, presmerovaní a sitemapy
          </p>
        </div>
        <Button onClick={generateSitemap}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generovať Sitemap
        </Button>
      </div>

      <Tabs defaultValue="meta" className="space-y-6">
        <TabsList>
          <TabsTrigger value="meta">Meta Tagy</TabsTrigger>
          <TabsTrigger value="redirects">Presmerovania</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
        </TabsList>

        {/* Meta Tags Tab */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Meta Tagy</CardTitle>
              <CardDescription>
                Nastavenia pre vyhľadávače a sociálne siete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {seoMeta.map((meta) => (
                  <div
                    key={meta.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{meta.entityName}</span>
                        <Badge variant="outline">{meta.entityType}</Badge>
                        {meta.noIndex && (
                          <Badge variant="secondary">noindex</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {meta.title || 'Bez titulku'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {meta.description || 'Bez popisu'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditingMeta(meta)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Upraviť
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redirects Tab */}
        <TabsContent value="redirects" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewRedirect(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nové presmerovanie
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">URL Presmerovania</CardTitle>
              <CardDescription>
                301/302 presmerovania pre staré URL adresy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {redirects.map((redirect) => (
                  <div
                    key={redirect.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span>{redirect.fromPath}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-primary">{redirect.toPath}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{redirect.statusCode}</Badge>
                          <span>{redirect.hitCount} presmerovaní</span>
                          {redirect.lastHitAt && (
                            <span>
                              Posledné: {new Date(redirect.lastHitAt).toLocaleDateString('sk-SK')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRedirect(redirect.id)}
                      >
                        {redirect.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingRedirect(redirect)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRedirect(redirect.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {redirects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Žiadne presmerovania
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Robots.txt Tab */}
        <TabsContent value="robots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Robots.txt</CardTitle>
              <CardDescription>
                Nastavenia pre vyhľadávacích robotov
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  className="w-full h-64 font-mono text-sm p-4 border rounded-lg bg-muted"
                  defaultValue={`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: https://scamnemesis.com/sitemap.xml`}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Zobraziť robots.txt
                  </Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Uložiť
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Meta Dialog */}
      <Dialog open={!!editingMeta} onOpenChange={() => setEditingMeta(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upraviť SEO - {editingMeta?.entityName}</DialogTitle>
            <DialogDescription>
              Nastavenia pre vyhľadávače a sociálne siete
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (max 70 znakov)</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titulok stránky..."
                maxLength={70}
              />
              <p className="text-xs text-muted-foreground">{formTitle.length}/70</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (max 160 znakov)</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Popis stránky..."
                maxLength={160}
                className="w-full h-20 px-3 py-2 border rounded-md text-sm"
              />
              <p className="text-xs text-muted-foreground">{formDescription.length}/160</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords (oddelené čiarkou)</label>
              <Input
                value={formKeywords}
                onChange={(e) => setFormKeywords(e.target.value)}
                placeholder="kľúčové, slová, tu..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Canonical URL</label>
              <Input
                value={formCanonical}
                onChange={(e) => setFormCanonical(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formNoIndex}
                  onChange={(e) => setFormNoIndex(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">noindex</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formNoFollow}
                  onChange={(e) => setFormNoFollow(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">nofollow</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMeta(null)}>
              Zrušiť
            </Button>
            <Button onClick={saveMeta}>
              <Save className="h-4 w-4 mr-2" />
              Uložiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/New Redirect Dialog */}
      <Dialog
        open={!!editingRedirect || showNewRedirect}
        onOpenChange={() => {
          setEditingRedirect(null);
          setShowNewRedirect(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRedirect ? 'Upraviť presmerovanie' : 'Nové presmerovanie'}
            </DialogTitle>
            <DialogDescription>
              Nastavte URL presmerovanie
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Z URL (from)</label>
              <Input
                value={redirectFrom}
                onChange={(e) => setRedirectFrom(e.target.value)}
                placeholder="/stara-stranka"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Na URL (to)</label>
              <Input
                value={redirectTo}
                onChange={(e) => setRedirectTo(e.target.value)}
                placeholder="/nova-stranka"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status kód</label>
              <select
                value={redirectStatus}
                onChange={(e) => setRedirectStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="301">301 - Permanent Redirect</option>
                <option value="302">302 - Temporary Redirect</option>
                <option value="307">307 - Temporary Redirect (preserve method)</option>
                <option value="308">308 - Permanent Redirect (preserve method)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingRedirect(null);
                setShowNewRedirect(false);
              }}
            >
              Zrušiť
            </Button>
            <Button onClick={saveRedirect}>
              <Save className="h-4 w-4 mr-2" />
              {editingRedirect ? 'Uložiť' : 'Vytvoriť'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
