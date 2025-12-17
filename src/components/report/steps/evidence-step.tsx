'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileText, Film, File, AlertCircle, Link, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

// Evidence categories matching the user's requirements
export type EvidenceCategory =
  | 'PAYMENT'
  | 'FRAUDSTER_PHOTOS'
  | 'SCREENSHOTS'
  | 'DAMAGE_DOCUMENTATION'
  | 'CRIME_SCENE'
  | 'OTHER';

interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
  file?: File;
  category: EvidenceCategory;
  externalUrl?: string;
}

interface EvidenceStepProps {
  files: EvidenceFile[];
  onFilesChange: (files: EvidenceFile[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - must match backend limit
const MAX_FILES_PER_CATEGORY = 5;
const MAX_TOTAL_FILES = 30;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Category configuration with icons and descriptions
const categoryConfig: Record<
  EvidenceCategory,
  { icon: string; titleKey: string; descriptionKey: string; fallbackTitle: string; fallbackDescription: string }
> = {
  PAYMENT: {
    icon: '💳',
    titleKey: 'payment',
    descriptionKey: 'paymentDesc',
    fallbackTitle: 'Payment Evidence',
    fallbackDescription: 'Bank statements, transfer receipts, payment confirmations',
  },
  FRAUDSTER_PHOTOS: {
    icon: '👤',
    titleKey: 'fraudsterPhotos',
    descriptionKey: 'fraudsterPhotosDesc',
    fallbackTitle: 'Fraudster Photos',
    fallbackDescription: 'Photos or images of the scammer',
  },
  SCREENSHOTS: {
    icon: '📱',
    titleKey: 'screenshots',
    descriptionKey: 'screenshotsDesc',
    fallbackTitle: 'Screenshots',
    fallbackDescription: 'Screenshots of conversations, messages, emails',
  },
  DAMAGE_DOCUMENTATION: {
    icon: '📋',
    titleKey: 'damageDocumentation',
    descriptionKey: 'damageDocumentationDesc',
    fallbackTitle: 'Damage Documentation',
    fallbackDescription: 'Documents proving financial or other damage',
  },
  CRIME_SCENE: {
    icon: '📍',
    titleKey: 'crimeScene',
    descriptionKey: 'crimeSceneDesc',
    fallbackTitle: 'Crime Scene Photos',
    fallbackDescription: 'Photos of locations related to the fraud',
  },
  OTHER: {
    icon: '📎',
    titleKey: 'other',
    descriptionKey: 'otherDesc',
    fallbackTitle: 'Other Evidence',
    fallbackDescription: 'Any other relevant evidence',
  },
};

const categoryOrder: EvidenceCategory[] = [
  'PAYMENT',
  'FRAUDSTER_PHOTOS',
  'SCREENSHOTS',
  'DAMAGE_DOCUMENTATION',
  'CRIME_SCENE',
  'OTHER',
];

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return FileImage;
  if (type.startsWith('video/')) return Film;
  if (type.includes('pdf') || type.includes('document') || type.includes('word')) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CategoryUploadProps {
  category: EvidenceCategory;
  files: EvidenceFile[];
  onFilesChange: (files: EvidenceFile[]) => void;
  allFiles: EvidenceFile[];
  translations: Record<string, unknown>;
}

function CategoryUpload({ category, files, onFilesChange, allFiles, translations }: CategoryUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');

  const config = categoryConfig[category];
  const categoryFiles = files.filter((f) => f.category === category);
  const totalFiles = allFiles.length;

  // Get translated texts
  const evidenceTranslations = (translations.report as Record<string, unknown>)?.evidence as Record<string, unknown> | undefined;
  const categoryTitle = (evidenceTranslations?.categories as Record<string, string>)?.[config.titleKey] || config.fallbackTitle;
  const categoryDescription = (evidenceTranslations?.descriptions as Record<string, string>)?.[config.descriptionKey] || config.fallbackDescription;

  const dragDropText = (evidenceTranslations?.dragDrop as string) || 'Drag files here';
  const orText = (evidenceTranslations?.orClickToSelect as string) || 'or click to select';
  const selectFilesText = (evidenceTranslations?.selectFiles as string) || 'Select Files';
  const addLinkText = (evidenceTranslations?.addLink as string) || 'Add Link';
  const addText = (evidenceTranslations?.add as string) || 'Add';
  const cancelText = (translations.common as Record<string, string>)?.cancel || 'Cancel';
  const urlPlaceholder = (evidenceTranslations?.urlPlaceholder as string) || 'https://...';
  const descriptionPlaceholder = (evidenceTranslations?.descriptionPlaceholder as string) || 'Description (optional)';
  const maxSizeText = (evidenceTranslations?.maxSize as string) || 'Max 10MB per file';
  const fileDescPlaceholder = (evidenceTranslations?.fileDescription as string) || 'File description (optional)';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large (max 10MB)`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      setError(null);

      if (categoryFiles.length >= MAX_FILES_PER_CATEGORY) {
        setError(`Maximum ${MAX_FILES_PER_CATEGORY} files per category`);
        return;
      }

      if (totalFiles >= MAX_TOTAL_FILES) {
        setError(`Maximum ${MAX_TOTAL_FILES} total files`);
        return;
      }

      const filesToAdd: EvidenceFile[] = [];
      let errorMessage: string | null = null;

      for (
        let i = 0;
        i < newFiles.length &&
        categoryFiles.length + filesToAdd.length < MAX_FILES_PER_CATEGORY &&
        totalFiles + filesToAdd.length < MAX_TOTAL_FILES;
        i++
      ) {
        const file = newFiles[i];
        const validationError = validateFile(file);

        if (validationError) {
          errorMessage = validationError;
          continue;
        }

        filesToAdd.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          file,
          category,
        });
      }

      if (errorMessage) {
        setError(errorMessage);
      }

      if (filesToAdd.length > 0) {
        onFilesChange([...allFiles, ...filesToAdd]);
      }
    },
    [categoryFiles.length, totalFiles, allFiles, onFilesChange, category]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    const file = allFiles.find((f) => f.id === id);
    if (file?.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
    onFilesChange(allFiles.filter((f) => f.id !== id));
  };

  const handleDescriptionChange = (id: string, description: string) => {
    onFilesChange(allFiles.map((f) => (f.id === id ? { ...f, description } : f)));
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    // Validate URL
    try {
      new URL(linkUrl);
    } catch {
      setError('Invalid URL');
      return;
    }

    const newLink: EvidenceFile = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: linkUrl,
      size: 0,
      type: 'link',
      externalUrl: linkUrl,
      description: linkDescription,
      category,
    };

    onFilesChange([...allFiles, newLink]);
    setLinkUrl('');
    setLinkDescription('');
    setShowLinkInput(false);
  };

  const inputId = `file-upload-${category}`;

  return (
    <div className="border rounded-lg p-4 bg-card">
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h3 className="font-semibold">{categoryTitle}</h3>
          <p className="text-xs text-muted-foreground">{categoryDescription}</p>
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {categoryFiles.length}/{MAX_FILES_PER_CATEGORY}
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          categoryFiles.length >= MAX_FILES_PER_CATEGORY && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">{dragDropText}</p>
        <p className="text-xs text-muted-foreground mb-3">{orText}</p>

        <input
          type="file"
          id={inputId}
          className="hidden"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={categoryFiles.length >= MAX_FILES_PER_CATEGORY}
        />

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(inputId)?.click()}
            disabled={categoryFiles.length >= MAX_FILES_PER_CATEGORY}
          >
            <Upload className="h-4 w-4 mr-1" />
            {selectFilesText}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            {addLinkText}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">{maxSizeText}</p>
      </div>

      {/* Add Link Input */}
      {showLinkInput && (
        <div className="mt-3 p-3 border rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              type="url"
              placeholder={urlPlaceholder}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Input
            placeholder={descriptionPlaceholder}
            value={linkDescription}
            onChange={(e) => setLinkDescription(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddLink} disabled={!linkUrl.trim()}>
              {addText}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>
              {cancelText}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* File List */}
      {categoryFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {categoryFiles.map((file) => {
            const Icon = file.externalUrl ? ExternalLink : getFileIcon(file.type);
            const isImage = file.type.startsWith('image/');

            return (
              <div
                key={file.id}
                className="flex items-start gap-2 p-2 border rounded bg-background"
              >
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {isImage && file.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  {file.externalUrl ? (
                    <a
                      href={file.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {file.externalUrl}
                    </a>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </>
                  )}
                  <Input
                    placeholder={fileDescPlaceholder}
                    value={file.description || ''}
                    onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EvidenceStep({ files, onFilesChange }: EvidenceStepProps) {
  const { translations } = useTranslation();

  // Get translated texts
  const evidenceTranslations = (translations.report as Record<string, unknown>)?.evidence as Record<string, unknown> | undefined;
  const title = (evidenceTranslations?.title as string) || 'Evidence & Attachments';
  const subtitle = (evidenceTranslations?.subtitle as string) || 'Upload screenshots, documents, or videos that prove the fraud';
  const tipsTitle = (evidenceTranslations?.tipsTitle as string) || 'Tips for quality evidence:';
  const tips = (evidenceTranslations?.tips as string[]) || [
    'Screenshots of conversations with the scammer',
    'Payment confirmations and transfers',
    'Emails and messages from the scammer',
    'Photos of fake documents',
    'Website recordings',
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Category Uploads */}
        {categoryOrder.map((category) => (
          <CategoryUpload
            key={category}
            category={category}
            files={files}
            onFilesChange={onFilesChange}
            allFiles={files}
            translations={translations}
          />
        ))}

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h4 className="font-medium mb-2">{tipsTitle}</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
