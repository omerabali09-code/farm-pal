import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AnimalPhoto {
  id: string;
  user_id: string;
  animal_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export function useAnimalPhotos(animalId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['animal-photos', animalId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('animal_photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AnimalPhoto[];
    },
    enabled: !!user,
  });

  const uploadPhoto = useMutation({
    mutationFn: async ({ animalId, file, caption }: { animalId: string; file: File; caption?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${animalId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('animal-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(fileName);
      
      // Save to database
      const { data, error } = await supabase
        .from('animal_photos')
        .insert({
          user_id: user.id,
          animal_id: animalId,
          image_url: urlData.publicUrl,
          caption: caption || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal-photos'] });
      toast({
        title: "Fotoğraf yüklendi! 📸",
        description: "Fotoğraf başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('animal_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal-photos'] });
      toast({
        title: "Silindi",
        description: "Fotoğraf silindi.",
      });
    },
  });

  return {
    photos,
    isLoading,
    uploadPhoto,
    deletePhoto,
  };
}
