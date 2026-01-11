import { useState, useRef } from 'react';
import { useAnimalPhotos } from '@/hooks/useAnimalPhotos';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Plus, Trash2, Loader2, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimalPhotoGalleryProps {
  animalId: string;
  profileImageUrl?: string | null;
  onProfileImageChange?: (url: string) => void;
}

export function AnimalPhotoGallery({ animalId, profileImageUrl, onProfileImageChange }: AnimalPhotoGalleryProps) {
  const { photos, isLoading, uploadPhoto, deletePhoto } = useAnimalPhotos(animalId);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadPhoto.mutateAsync({ animalId, file, caption });
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      await deletePhoto.mutateAsync(photoId);
    }
  };

  const handleSetAsProfile = (imageUrl: string) => {
    if (onProfileImageChange) {
      onProfileImageChange(imageUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Fotoğraf Ekle
        </Button>
        <div className="flex-1">
          <Input
            placeholder="Fotoğraf açıklaması (opsiyonel)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl border-2 border-dashed">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Henüz fotoğraf eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-border cursor-pointer"
              onClick={() => setPreviewImage(photo.image_url)}
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Hayvan fotoğrafı'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onProfileImageChange && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAsProfile(photo.image_url);
                    }}
                  >
                    <Image className="w-3 h-3 mr-1" />
                    Profil
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="bg-popover max-w-3xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            {previewImage && (
              <img
                src={previewImage}
                alt="Önizleme"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
