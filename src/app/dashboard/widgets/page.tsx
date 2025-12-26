'use client';

/**
 * Widget Generator Dashboard
 *
 * Allows authenticated users to:
 * - View their widgets
 * - Create new widgets with customization
 * - Copy embed code
 * - Delete widgets
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Settings,
  Code,
  Palette,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';

interface Widget {
  id: string;
  name: string;
  locale: string;
  theme: 'LIGHT' | 'DARK';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  showReportButton: boolean;
  showAdvancedByDefault: boolean;
  defaultSearchMode: 'AUTO' | 'FUZZY' | 'EXACT';
  isActive: boolean;
  embedUrl: string;
  createdAt: string;
}

interface NewWidgetForm {
  name: string;
  locale: string;
  theme: 'LIGHT' | 'DARK';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  showReportButton: boolean;
  showAdvancedByDefault: boolean;
  defaultSearchMode: 'AUTO' | 'FUZZY' | 'EXACT';
}

const defaultWidget: NewWidgetForm = {
  name: '',
  locale: 'en',
  theme: 'LIGHT',
  primaryColor: '#4f46e5',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: 8,
  showReportButton: true,
  showAdvancedByDefault: false,
  defaultSearchMode: 'AUTO',
};

export default function WidgetsDashboardPage() {
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWidget, setNewWidget] = useState<NewWidgetForm>(defaultWidget);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/widgets', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (response.status === 404) {
          // Feature not enabled
          setError('Widget feature is not enabled');
          return;
        }
        throw new Error('Failed to fetch widgets');
      }

      const data = await response.json();
      setWidgets(data.widgets || []);
    } catch (err) {
      console.error('Fetch widgets error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const handleCreateWidget = async () => {
    if (!newWidget.name.trim()) {
      toast.error('Please enter a widget name');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/v1/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newWidget),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create widget');
      }

      const created = await response.json();
      setWidgets((prev) => [created, ...prev]);
      setShowCreateDialog(false);
      setNewWidget(defaultWidget);
      toast.success('Widget created successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create widget');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/v1/widgets/${widgetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete widget');
      }

      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      toast.success('Widget deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete widget');
    }
  };

  const handleToggleActive = async (widget: Widget) => {
    try {
      const response = await fetch(`/api/v1/widgets/${widget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !widget.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update widget');
      }

      const updated = await response.json();
      setWidgets((prev) =>
        prev.map((w) => (w.id === widget.id ? { ...w, isActive: updated.isActive } : w))
      );
      toast.success(updated.isActive ? 'Widget activated' : 'Widget deactivated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update widget');
    }
  };

  const getEmbedCode = (widget: Widget) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://scamnemesis.com';
    return `<iframe
  src="${baseUrl}${widget.embedUrl}"
  width="100%"
  height="400"
  style="border: none; border-radius: ${widget.borderRadius}px;"
  title="ScamNemesis Fraud Checker"
></iframe>
<script src="${baseUrl}/embed/widget-resize.js"></script>`;
  };

  const copyEmbedCode = (widget: Widget) => {
    navigator.clipboard.writeText(getEmbedCode(widget));
    toast.success('Embed code copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Widgets</h1>
              <p className="text-slate-500">Create embeddable search widgets for your website</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Widget</DialogTitle>
                <DialogDescription>
                  Configure your embeddable search widget
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">
                    <Settings className="h-4 w-4 mr-2" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="appearance">
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger value="behavior">
                    <Code className="h-4 w-4 mr-2" />
                    Behavior
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Widget Name *</Label>
                    <Input
                      id="name"
                      placeholder="My Website Widget"
                      value={newWidget.name}
                      onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locale">Language</Label>
                    <Select
                      value={newWidget.locale}
                      onValueChange={(value) => setNewWidget({ ...newWidget, locale: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sk">Slovak</SelectItem>
                        <SelectItem value="cs">Czech</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={newWidget.theme}
                      onValueChange={(value: 'LIGHT' | 'DARK') =>
                        setNewWidget({ ...newWidget, theme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LIGHT">Light</SelectItem>
                        <SelectItem value="DARK">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={newWidget.primaryColor}
                          onChange={(e) => setNewWidget({ ...newWidget, primaryColor: e.target.value })}
                          className="h-10 w-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newWidget.primaryColor}
                          onChange={(e) => setNewWidget({ ...newWidget, primaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="backgroundColor"
                          value={newWidget.backgroundColor}
                          onChange={(e) => setNewWidget({ ...newWidget, backgroundColor: e.target.value })}
                          className="h-10 w-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newWidget.backgroundColor}
                          onChange={(e) => setNewWidget({ ...newWidget, backgroundColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="textColor"
                          value={newWidget.textColor}
                          onChange={(e) => setNewWidget({ ...newWidget, textColor: e.target.value })}
                          className="h-10 w-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={newWidget.textColor}
                          onChange={(e) => setNewWidget({ ...newWidget, textColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Radius: {newWidget.borderRadius}px</Label>
                    <Slider
                      value={[newWidget.borderRadius]}
                      min={0}
                      max={32}
                      step={1}
                      onValueChange={(values: number[]) => setNewWidget({ ...newWidget, borderRadius: values[0] })}
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div
                      className="p-4 border rounded-lg"
                      style={{
                        backgroundColor: newWidget.backgroundColor,
                        borderRadius: `${newWidget.borderRadius}px`,
                      }}
                    >
                      <div className="flex gap-2">
                        <div
                          className="flex-1 h-10 rounded px-3 flex items-center"
                          style={{
                            backgroundColor: newWidget.theme === 'DARK' ? '#1e293b' : '#f1f5f9',
                            borderRadius: `${newWidget.borderRadius}px`,
                            color: newWidget.textColor,
                          }}
                        >
                          Search placeholder...
                        </div>
                        <button
                          className="h-10 px-4 rounded font-medium text-white"
                          style={{
                            backgroundColor: newWidget.primaryColor,
                            borderRadius: `${newWidget.borderRadius}px`,
                          }}
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchMode">Default Search Mode</Label>
                    <Select
                      value={newWidget.defaultSearchMode}
                      onValueChange={(value: 'AUTO' | 'FUZZY' | 'EXACT') =>
                        setNewWidget({ ...newWidget, defaultSearchMode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTO">Auto (Recommended)</SelectItem>
                        <SelectItem value="FUZZY">Fuzzy Search</SelectItem>
                        <SelectItem value="EXACT">Exact Match</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <Label>Show Report Button</Label>
                      <p className="text-sm text-slate-500">
                        Display &quot;Report a Scam&quot; link in widget
                      </p>
                    </div>
                    <Switch
                      checked={newWidget.showReportButton}
                      onCheckedChange={(checked: boolean) =>
                        setNewWidget({ ...newWidget, showReportButton: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <Label>Show Advanced Filters by Default</Label>
                      <p className="text-sm text-slate-500">
                        Expand filter panel on load
                      </p>
                    </div>
                    <Switch
                      checked={newWidget.showAdvancedByDefault}
                      onCheckedChange={(checked: boolean) =>
                        setNewWidget({ ...newWidget, showAdvancedByDefault: checked })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWidget}
                  disabled={isCreating || !newWidget.name.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isCreating ? 'Creating...' : 'Create Widget'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Widgets Grid */}
        {widgets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
              <p className="text-slate-500 text-center mb-4">
                Create your first embeddable search widget for your website
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: widget.primaryColor }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{widget.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                          {widget.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs uppercase">{widget.locale}</span>
                        <span className="text-xs">{widget.theme.toLowerCase()}</span>
                      </CardDescription>
                    </div>
                    <Switch
                      checked={widget.isActive}
                      onCheckedChange={() => handleToggleActive(widget)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: widget.primaryColor }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: widget.backgroundColor }}
                      title="Background"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: widget.textColor }}
                      title="Text"
                    />
                    <span className="text-xs text-slate-400 ml-2">
                      {widget.borderRadius}px radius
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedWidget(widget)}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Embed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={widget.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Widget?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the widget &quot;{widget.name}&quot;.
                            Any embedded instances will stop working.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWidget(widget.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Embed Code Dialog */}
        <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Embed Widget: {selectedWidget?.name}</DialogTitle>
              <DialogDescription>
                Copy and paste this code into your website
              </DialogDescription>
            </DialogHeader>

            {selectedWidget && (
              <div className="space-y-4">
                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto">
                    <code>{getEmbedCode(selectedWidget)}</code>
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyEmbedCode(selectedWidget)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    The widget auto-resizes to fit content. Include the resize script for best results.
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Preview URL</h4>
                  <div className="flex gap-2">
                    <Input
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedWidget.embedUrl}`}
                      readOnly
                    />
                    <Button variant="outline" asChild>
                      <a
                        href={selectedWidget.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWidget(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documentation Link */}
        <div className="mt-8 p-4 bg-slate-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Need help?</h3>
              <p className="text-sm text-slate-500">
                Check our documentation for widget customization and advanced integration options.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/partners/widgets">
                View Documentation
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
