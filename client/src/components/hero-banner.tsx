import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  order: number;
  isActive: boolean;
}

// Default fallback banner image
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=400&fit=crop';

export default function HeroBanner() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['/api/banners/active'],
  });

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const displayBanners = banners.length > 0 ? banners : [{ _id: 'default', imageUrl: DEFAULT_BANNER_IMAGE, title: 'Default Banner', order: 0, isActive: true }];
  const currentBanner = displayBanners[currentBannerIndex];

  return (
    <section className="w-full">
      <div className="hero-banner-wrapper relative">
        <div className="hero-banner-content">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title || "PawCart - Everything You Need for Your Pet"}
            loading="eager"
            className="w-full h-auto"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BANNER_IMAGE;
            }}
          />
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_: Banner, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBannerIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
