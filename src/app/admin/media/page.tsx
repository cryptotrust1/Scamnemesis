'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Image,
  Upload,
  Trash2,
  Search,
  Grid,
  List,
  Filter,
  Download,
  Eye,
  Edit2,
  X,
  Check,
  Loader2,
  FileText,
  Video,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER';
  status: 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED';
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string | null;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  title: string | null;
  altText: string | null;
  createdAt: string;
}

// Mock data
const mockMedia: MediaItem[] = [
  {
    id: '1',
    type: 'IMAGE',
    status: 'READY',
    filename: 'report-evidence-1.jpg',
    originalName: 'screenshot_2024.jpg',
    mimeType: 'image/jpeg',
    fileSize: 245000,
    url: 'https://via.placeholder.com/800x600',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    width: 800,
    height: 600,
    title: 'Dôkaz k hláseniu #123',
    altText: 'Screenshot podvodnej správy',
    createdAt: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    type: 'IMAGE',
    status: 'READY',
    filename: 'report-evidence-2.png',
    originalName: 'bank_statement.png',
    mimeType: 'image/png',
    fileSize: 512000,
    url: 'https://via.placeholder.com/1024x768',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    width: 1024,
    height: 768,
    title: 'Bankový výpis',
    altText: 'Výpis z účtu',
    createdAt: '2024-12-09T14:20:00Z',
  },
  {
    id: '3',
    type: 'DOCUMENT',
    status: 'READY',
    filename: 'contract.pdf',
    originalName: 'zmluva_podvodnik.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024000,
    url: null,
    thumbnailUrl: null,
    width: null,
    height: null,
    title: 'Falošná zmluva',
    altText: null,
    createdAt: '2024-12-08T09:15:00Z',
  },
  {
    id: '4',
    type: 'VIDEO',
    status: 'PROCESSING',
    filename: 'video-evidence.mp4',
    originalName: 'nahravka_hovoru.mp4',
    mimeType: 'video/mp4',
    fileSize: 15000000,
    url: null,
    thumbnailUrl: null,
    width: null,
    height: null,
    title: 'Nahrávka hovoru',
    altText: null,
    createdAt: '2024-12-07T16:45:00Z',
  },
];

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

// Get icon for media type
function getMediaIcon(type: string) {
  switch (type) {
    case 'IMAGE':
      return Image;
    case 'VIDEO':
      return Video;
    case 'AUDIO':
      return Music;
    case 'DOCUMENT':
      return FileText;
    default:
      return FileText;
  }
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');

  // File upload dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (const file of acceptedFiles) {
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress(i);
        }

        // In real implementation, would call API:
        // const response = await fetch('/api/v1/media', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     filename: file.name,
        //     mimeType: file.type,
        //     fileSize: file.size,
        //   }),
        // });
        // const { uploadUrl, mediaId } = await response.json();
        // await fetch(uploadUrl, { method: 'PUT', body: file });
        // await fetch(`/api/v1/media/${mediaId}/confirm`, { method: 'POST' });

        // Add mock media item
        const newMedia: MediaItem = {
          id: crypto.randomUUID(),
          type: file.type.startsWith('image/') ? 'IMAGE' :
                file.type.startsWith('video/') ? 'VIDEO' :
                file.type.startsWith('audio/') ? 'AUDIO' : 'DOCUMENT',
          status: 'READY',
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          url: URL.createObjectURL(file),
          thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          width: null,
          height: null,
          title: file.name.replace(/\.[^/.]+$/, ''),
          altText: null,
          createdAt: new Date().toISOString(),
        };

        setMedia((prev) => [newMedia, ...prev]);
        toast.success(`Súbor "${file.name}" bol nahratý`);
      } catch (error) {
        toast.error(`Chyba pri nahrávaní "${file.name}"`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Filter media
  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle delete
  const handleDelete = async () => {
    if (!mediaToDelete) return;

    // In real implementation, would call API
    setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
    toast.success('Súbor bol vymazaný');
    setShowDeleteDialog(false);
    setMediaToDelete(null);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editingMedia) return;

    // In real implementation, would call API
    setMedia((prev) =>
      prev.map((m) =>
        m.id === editingMedia.id
          ? { ...m, title: editTitle, altText: editAltText }
          : m
      )
    );
    toast.success('Zmeny boli uložené');
    setEditingMedia(null);
  };

  // Start editing
  const startEditing = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title || '');
    setEditAltText(item.altText || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Galéria médií</h2>
          <p className="text-muted-foreground">
            Správa obrázkov, dokumentov a videí
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <div className="w-64 mx-auto bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nahráva sa... {uploadProgress}%
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive
                    ? 'Pustite súbory sem...'
                    : 'Pretiahnite súbory sem alebo kliknite pre výber'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Podporované formáty: JPG, PNG, GIF, WEBP, MP4, PDF (max. 50MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať súbory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky typy</SelectItem>
            <SelectItem value="IMAGE">Obrázky</SelectItem>
            <SelectItem value="VIDEO">Videá</SelectItem>
            <SelectItem value="DOCUMENT">Dokumenty</SelectItem>
            <SelectItem value="AUDIO">Audio</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredMedia.length} súborov
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const Icon = getMediaIcon(item.type);
            return (
              <Card
                key={item.id}
                className="group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square relative bg-muted rounded-t-lg overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.altText || item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {item.status === 'PROCESSING' && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(item);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:text-red-400 hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaToDelete(item);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {item.title || item.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredMedia.map((item) => {
              const Icon = getMediaIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.altText || item.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.title || item.originalName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.originalName}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </div>
                  <Badge variant={item.status === 'READY' ? 'default' : 'secondary'}>
                    {item.status === 'READY' ? 'Aktívne' : 'Spracováva sa'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaToDelete(item);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.title || selectedMedia?.originalName}</DialogTitle>
            <DialogDescription>
              {selectedMedia?.mimeType} • {selectedMedia && formatFileSize(selectedMedia.fileSize)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMedia?.type === 'IMAGE' && selectedMedia.url && (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.altText || selectedMedia.originalName}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
            )}
            {selectedMedia?.type !== 'IMAGE' && (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                {(() => {
                  const Icon = getMediaIcon(selectedMedia?.type || 'OTHER');
                  return <Icon className="h-16 w-16 text-muted-foreground" />;
                })()}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Názov súboru:</span>
                <p>{selectedMedia?.originalName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Veľkosť:</span>
                <p>{selectedMedia && formatFileSize(selectedMedia.fileSize)}</p>
              </div>
              {selectedMedia?.width && (
                <div>
                  <span className="text-muted-foreground">Rozmery:</span>
                  <p>{selectedMedia.width} x {selectedMedia.height} px</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Nahraté:</span>
                <p>{selectedMedia && formatDate(selectedMedia.createdAt)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMedia(null)}>
              Zavrieť
            </Button>
            {selectedMedia?.url && (
              <Button asChild>
                <a href={selectedMedia.url} download={selectedMedia.originalName}>
                  <Download className="h-4 w-4 mr-2" />
                  Stiahnuť
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť súbor</DialogTitle>
            <DialogDescription>
              Upravte metadáta súboru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Názov</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Zadajte názov..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Alt text</label>
              <Input
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder="Popis pre čítačky obrazovky..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMedia(null)}>
              Zrušiť
            </Button>
            <Button onClick={handleEditSave}>
              <Check className="h-4 w-4 mr-2" />
              Uložiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vymazať súbor?</DialogTitle>
            <DialogDescription>
              Naozaj chcete vymazať súbor &quot;{mediaToDelete?.originalName}&quot;?
              Táto akcia sa nedá vrátiť späť.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Zrušiť
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Vymazať
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
