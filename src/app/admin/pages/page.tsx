'use client';

import { useState } from 'react';
import {
  FileEdit,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Clock,
  CheckCircle2,
  Archive,
  ExternalLink,
  Copy,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Types
interface Page {
  id: string;
  slug: string;
  path: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  template: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockPages: Page[] = [
  {
    id: '1',
    slug: 'about',
    path: '/about',
    title: 'O projekte Scamnemesis',
    content: '<h1>O nás</h1><p>Scamnemesis je projekt zameraný na ochranu ľudí pred podvodníkmi...</p>',
    excerpt: 'Dozveďte sa viac o projekte Scamnemesis a našej misii chrániť ľudí pred podvodmi.',
    status: 'PUBLISHED',
    publishedAt: '2024-12-01T10:00:00Z',
    template: 'default',
    authorName: 'Admin',
    createdAt: '2024-11-15T08:00:00Z',
    updatedAt: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    slug: 'faq',
    path: '/faq',
    title: 'Často kladené otázky',
    content: '<h1>FAQ</h1><p>Tu nájdete odpovede na najčastejšie otázky...</p>',
    excerpt: 'Odpovede na najčastejšie otázky o Scamnemesis.',
    status: 'PUBLISHED',
    publishedAt: '2024-12-05T14:00:00Z',
    template: 'faq',
    authorName: 'Admin',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-12-09T14:20:00Z',
  },
  {
    id: '3',
    slug: 'how-it-works',
    path: '/how-it-works',
    title: 'Ako to funguje',
    content: '<h1>Ako to funguje</h1><p>Náš systém funguje v niekoľkých krokoch...</p>',
    excerpt: 'Pochopte ako funguje náš systém ochrany.',
    status: 'DRAFT',
    publishedAt: null,
    template: 'default',
    authorName: 'Admin',
    createdAt: '2024-12-08T11:00:00Z',
    updatedAt: '2024-12-08T11:00:00Z',
  },
  {
    id: '4',
    slug: 'partners',
    path: '/partners',
    title: 'Partneri',
    content: '<h1>Naši partneri</h1><p>Spolupracujeme s...</p>',
    excerpt: 'Zoznam našich partnerov a spolupracovníkov.',
    status: 'ARCHIVED',
    publishedAt: '2024-10-01T10:00:00Z',
    template: 'default',
    authorName: 'Admin',
    createdAt: '2024-09-15T08:00:00Z',
    updatedAt: '2024-11-01T09:15:00Z',
  },
];

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get status icon and color
function getStatusBadge(status: Page['status']) {
  switch (status) {
    case 'PUBLISHED':
      return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Publikované</Badge>;
    case 'DRAFT':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Koncept</Badge>;
    case 'ARCHIVED':
      return <Badge variant="outline"><Archive className="h-3 w-3 mr-1" />Archivované</Badge>;
    default:
      return null;
  }
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showNewPage, setShowNewPage] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formTemplate, setFormTemplate] = useState('default');
  const [formStatus, setFormStatus] = useState<Page['status']>('DRAFT');

  // Filter pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Start editing page
  const startEditing = (page: Page) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormContent(page.content);
    setFormExcerpt(page.excerpt || '');
    setFormTemplate(page.template);
    setFormStatus(page.status);
  };

  // Start new page
  const startNewPage = () => {
    setShowNewPage(true);
    setFormTitle('');
    setFormSlug('');
    setFormContent('');
    setFormExcerpt('');
    setFormTemplate('default');
    setFormStatus('DRAFT');
  };

  // Save page
  const savePage = () => {
    if (!formTitle || !formSlug) {
      toast.error('Vyplňte názov a URL slug');
      return;
    }

    if (editingPage) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? {
                ...p,
                title: formTitle,
                slug: formSlug,
                path: `/${formSlug}`,
                content: formContent,
                excerpt: formExcerpt || null,
                template: formTemplate,
                status: formStatus,
                publishedAt: formStatus === 'PUBLISHED' && !p.publishedAt ? new Date().toISOString() : p.publishedAt,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      toast.success('Stránka bola uložená');
      setEditingPage(null);
    } else if (showNewPage) {
      const newPage: Page = {
        id: crypto.randomUUID(),
        slug: formSlug,
        path: `/${formSlug}`,
        title: formTitle,
        content: formContent,
        excerpt: formExcerpt || null,
        status: formStatus,
        publishedAt: formStatus === 'PUBLISHED' ? new Date().toISOString() : null,
        template: formTemplate,
        authorName: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPages((prev) => [newPage, ...prev]);
      toast.success('Stránka bola vytvorená');
      setShowNewPage(false);
    }
  };

  // Delete page
  const deletePage = () => {
    if (!pageToDelete) return;
    setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
    toast.success('Stránka bola vymazaná');
    setShowDeleteDialog(false);
    setPageToDelete(null);
  };

  // Duplicate page
  const duplicatePage = (page: Page) => {
    const newPage: Page = {
      ...page,
      id: crypto.randomUUID(),
      slug: `${page.slug}-copy`,
      path: `/${page.slug}-copy`,
      title: `${page.title} (kópia)`,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPages((prev) => [newPage, ...prev]);
    toast.success('Stránka bola skopírovaná');
  };

  // Toggle page status
  const toggleStatus = (page: Page) => {
    const newStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setPages((prev) =>
      prev.map((p) =>
        p.id === page.id
          ? {
              ...p,
              status: newStatus,
              publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : p.publishedAt,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    toast.success(newStatus === 'PUBLISHED' ? 'Stránka bola publikovaná' : 'Stránka bola odložená');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Správa stránok</h2>
          <p className="text-muted-foreground">
            Vytvárajte a upravujte statické stránky
          </p>
        </div>
        <Button onClick={startNewPage}>
          <Plus className="h-4 w-4 mr-2" />
          Nová stránka
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať stránky..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">Všetky stavy</option>
          <option value="PUBLISHED">Publikované</option>
          <option value="DRAFT">Koncepty</option>
          <option value="ARCHIVED">Archivované</option>
        </select>
        <div className="text-sm text-muted-foreground">
          {filteredPages.length} stránok
        </div>
      </div>

      {/* Pages List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileEdit className="h-10 w-10 text-muted-foreground p-2 bg-muted rounded-lg flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{page.title}</span>
                      {getStatusBadge(page.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{page.path}</span>
                      <span>•</span>
                      <span>{page.authorName}</span>
                      <span>•</span>
                      <span>Upravené: {formatDate(page.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {page.status === 'PUBLISHED' && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={page.path} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStatus(page)}
                  >
                    {page.status === 'PUBLISHED' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(page)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => duplicatePage(page)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplikovať
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setPageToDelete(page);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vymazať
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filteredPages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Žiadne stránky
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit/New Page Dialog */}
      <Dialog
        open={!!editingPage || showNewPage}
        onOpenChange={() => {
          setEditingPage(null);
          setShowNewPage(false);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Upraviť stránku' : 'Nová stránka'}
            </DialogTitle>
            <DialogDescription>
              {editingPage ? 'Upravte obsah stránky' : 'Vytvorte novú stránku'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Názov stránky</label>
                <Input
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingPage) {
                      setFormSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Názov stránky..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                    /
                  </span>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="url-slug"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Krátky popis (excerpt)</label>
              <Input
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="Krátky popis stránky..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Obsah (HTML)</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="<h1>Nadpis</h1><p>Obsah stránky...</p>"
                className="w-full h-64 px-3 py-2 border rounded-md text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Použite HTML značky pre formátovanie. V budúcnosti bude dostupný vizuálny editor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Šablóna</label>
                <select
                  value={formTemplate}
                  onChange={(e) => setFormTemplate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="default">Predvolená</option>
                  <option value="full-width">Celá šírka</option>
                  <option value="sidebar">S bočným panelom</option>
                  <option value="faq">FAQ</option>
                  <option value="landing">Landing page</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stav</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as Page['status'])}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="DRAFT">Koncept</option>
                  <option value="PUBLISHED">Publikované</option>
                  <option value="ARCHIVED">Archivované</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingPage(null);
                setShowNewPage(false);
              }}
            >
              Zrušiť
            </Button>
            <Button onClick={savePage}>
              <Save className="h-4 w-4 mr-2" />
              {editingPage ? 'Uložiť zmeny' : 'Vytvoriť stránku'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vymazať stránku?</DialogTitle>
            <DialogDescription>
              Naozaj chcete vymazať stránku &quot;{pageToDelete?.title}&quot;?
              Táto akcia sa nedá vrátiť späť.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Zrušiť
            </Button>
            <Button variant="destructive" onClick={deletePage}>
              <Trash2 className="h-4 w-4 mr-2" />
              Vymazať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
