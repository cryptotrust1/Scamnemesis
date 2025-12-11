'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileText, Film, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  description?: string;
  file?: File;
}

interface EvidenceStepProps {
  files: EvidenceFile[];
  onFilesChange: (files: EvidenceFile[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
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

export function EvidenceStep({ files, onFilesChange }: EvidenceStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return `Nepodporovaný typ súboru: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Súbor ${file.name} je príliš veľký (max 10MB)`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      setError(null);
      const currentCount = files.length;

      if (currentCount >= MAX_FILES) {
        setError(`Môžete nahrať maximálne ${MAX_FILES} súborov`);
        return;
      }

      const filesToAdd: EvidenceFile[] = [];
      let errorMessage: string | null = null;

      for (let i = 0; i < newFiles.length && currentCount + filesToAdd.length < MAX_FILES; i++) {
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
        });
      }

      if (errorMessage) {
        setError(errorMessage);
      }

      if (filesToAdd.length > 0) {
        onFilesChange([...files, ...filesToAdd]);
      }
    },
    [files, onFilesChange]
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
    const file = files.find((f) => f.id === id);
    if (file?.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleDescriptionChange = (id: string, description: string) => {
    onFilesChange(
      files.map((f) => (f.id === id ? { ...f, description } : f))
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Dôkazy a prílohy</h2>
        <p className="text-muted-foreground">
          Nahrajte screenshoty, dokumenty alebo videá, ktoré dokazujú podvod
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            files.length >= MAX_FILES && 'opacity-50 pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Pretiahnite súbory sem
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            alebo kliknite pre výber súborov
          </p>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleInputChange}
            disabled={files.length >= MAX_FILES}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={files.length >= MAX_FILES}
          >
            Vybrať súbory
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Podporované formáty: JPG, PNG, GIF, PDF, MP4, DOCX, TXT
            <br />
            Max. veľkosť: 10MB na súbor | Max. počet: {MAX_FILES} súborov
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Nahrané súbory ({files.length}/{MAX_FILES})
              </h3>
              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    files.forEach((f) => {
                      if (f.url?.startsWith('blob:')) {
                        URL.revokeObjectURL(f.url);
                      }
                    });
                    onFilesChange([]);
                  }}
                >
                  Odstrániť všetky
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                const isImage = file.type.startsWith('image/');

                return (
                  <div
                    key={file.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-card"
                  >
                    {/* Preview or Icon */}
                    <div className="flex-shrink-0">
                      {isImage && file.url ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <Input
                        placeholder="Popis súboru (voliteľné)"
                        value={file.description || ''}
                        onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
                        className="mt-2 h-8 text-sm"
                      />
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Tipy pre kvalitné dôkazy:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Screenshoty konverzácií s podvodníkom</li>
            <li>Potvrdenia o platbách a prevody</li>
            <li>Emaily a správy od podvodníka</li>
            <li>Fotografie falošných dokumentov</li>
            <li>Záznamy z webových stránok</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
