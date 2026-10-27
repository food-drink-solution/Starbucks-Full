import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { TFunction } from 'i18next';
import { cn } from '@/lib/ui';
import type { Location } from '@/types';

interface LocationCardProps {
  location: Location;
  isRTL: boolean;
  t: TFunction;
  isSelected?: boolean;
  distanceKm?: number;
  onClick?: () => void;
}

export const LocationCard = memo(
  ({ location, isRTL, isSelected, distanceKm, onClick }: LocationCardProps) => {
    const c = location as Location & { nameAr?: string };
    const name = isRTL && c.nameAr ? c.nameAr : (typeof c.name === 'string' ? c.name : c.name?.en);
    const address = typeof c.address === 'string' ? c.address : c.address?.en;

    const formatDistance = (km: number) => {
      if (km < 1) return `${Math.round(km * 1000)} m`;
      return `${km.toFixed(1)} km`;
    };

    return (
      <div
        onClick={onClick}
        className={cn(
          'cursor-pointer p-5 rounded-2xl border transition-all shadow-sm group',
          isSelected
            ? 'bg-starbucks-green/10 border-starbucks-green dark:bg-starbucks-green/20'
            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'mt-1 w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-starbucks-green text-white'
                : 'bg-starbucks-green/10 text-starbucks-green group-hover:bg-starbucks-green group-hover:text-white'
            )}
          >
            <MapPin className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + distance badge on same row */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3
                className={cn(
                  'text-lg font-black transition-colors truncate',
                  isSelected
                    ? 'text-starbucks-green'
                    : 'text-gray-900 dark:text-white group-hover:text-starbucks-green'
                )}
              >
                {name}
              </h3>

              {distanceKm !== undefined && (
                <span
                  className={cn(
                    'shrink-0 text-xs font-bold px-2.5 py-1 rounded-full',
                    isSelected
                      ? 'bg-starbucks-green text-white'
                      : 'bg-starbucks-green/10 text-starbucks-green'
                  )}
                >
                  {formatDistance(distanceKm)}
                </span>
              )}
            </div>

            {address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {address}
              </p>
            )}

            {location.operatingHours && Object.entries(location.operatingHours)[0] && (
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span>
                  {Object.entries(location.operatingHours)[0][1].open}
                  {' – '}
                  {Object.entries(location.operatingHours)[0][1].close}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {location.features?.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold text-gray-500 bg-white dark:bg-black/20 px-2 py-1 rounded-full border border-gray-100 dark:border-white/5"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.location.id === next.location.id &&
    prev.isRTL === next.isRTL &&
    prev.isSelected === next.isSelected &&
    prev.distanceKm === next.distanceKm
);

LocationCard.displayName = 'LocationCard';
