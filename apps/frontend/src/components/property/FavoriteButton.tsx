'use client';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import toast from 'react-hot-toast';

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(propertyId);

  const handleClick = () => {
    const added = toggle(propertyId);
    toast.success(added ? 'Added to favorites' : 'Removed from favorites');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 btn btn-secondary btn-sm"
      style={{
        borderColor: liked ? '#e74c3c' : undefined,
        color:       liked ? '#e74c3c' : undefined,
      }}
      title={liked ? 'Remove from favorites' : 'Save to favorites'}
    >
      <Heart
        className="w-4 h-4"
        style={{
          fill:  liked ? '#e74c3c' : 'none',
          color: liked ? '#e74c3c' : '#95a5a6',
        }}
      />
      {liked ? 'Saved' : 'Save'}
    </button>
  );
}
