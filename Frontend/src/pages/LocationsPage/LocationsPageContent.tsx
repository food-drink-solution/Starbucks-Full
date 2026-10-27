import { useState, useCallback, useMemo } from 'react';
import { captureError } from '@/lib/error/errorMonitoring';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/ui';
import { ANIMATION_CONFIG } from '@/lib/core/constants';
import { SEO, QueryErrorBoundary } from '@/components';
import { useLanguage } from '@/hooks';
import type { Location } from '@/types';
import { LocationCard } from './LocationCard';
import { StoreDetailPanel } from '@/components/map/StoreDetailPanel';
import { StoreMap } from '@/components/map/StoreMap';
import { PlacesAutocomplete } from '@/components/map/PlacesAutocomplete';
import { List, Map as MapIcon, Navigation2 } from 'lucide-react';

interface LocationsPageContentProps {
  locations: Location[];
}

/** Haversine formula — returns straight-line distance in kilometres. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCoords(loc: Location): { lat: number; lng: number } | null {
  const lat = loc.coordinates?.lat ?? loc.latitude;
  const lng = loc.coordinates?.lng ?? loc.longitude;
  if (!lat || !lng) return null;
  return { lat, lng };
}

export function LocationsPageContent({ locations }: LocationsPageContentProps) {
  const { isRTL } = useLanguage();
  const { t } = useTranslation(['pages']);

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setGeoStatus('idle');
        setViewMode('map');
      },
      () => setGeoStatus('error'),
      { timeout: 8000 }
    );
  }, []);

  const handlePlaceSelect = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setViewMode('map');
  }, []);

  /** Filtered + distance-sorted list. Each entry carries its distance from the user. */
  const processedLocations = useMemo(() => {
    const lc = search.toLowerCase();
    const filtered =
      search === ''
        ? locations
        : locations.filter((loc) => {
            const nameEn = typeof loc.name === 'string' ? loc.name : (loc.name?.en ?? '');
            const nameAr = typeof loc.name === 'string' ? '' : (loc.name?.ar ?? '');
            const addr = typeof loc.address === 'string' ? loc.address : (loc.address?.en ?? '');
            return (
              nameEn.toLowerCase().includes(lc) ||
              nameAr.includes(search) ||
              addr.toLowerCase().includes(lc) ||
              (loc.city?.toLowerCase().includes(lc) ?? false)
            );
          });

    if (!userLocation) return filtered.map((loc) => ({ loc, distanceKm: undefined }));

    return filtered
      .map((loc) => {
        const coords = getCoords(loc);
        const distanceKm = coords
          ? haversineKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
          : undefined;
        return { loc, distanceKm };
      })
      .sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [locations, search, userLocation]);

  const filteredLocations = useMemo(
    () => processedLocations.map(({ loc }) => loc),
    [processedLocations]
  );

  /** Distance for the currently selected store (used in detail panel header). */
  const selectedDistanceKm = useMemo(() => {
    if (!selectedLocation || !userLocation) return undefined;
    return processedLocations.find(({ loc }) => loc.id === selectedLocation.id)?.distanceKm;
  }, [selectedLocation, userLocation, processedLocations]);

  const sortedByDistance = userLocation !== null;
  const showDetail = selectedLocation !== null;

  return (
    <div
      className="h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 transition-colors duration-300 flex flex-col overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <SEO title={t('pages:locations.title', 'Store Locator')} />

      {/* Mobile View Toggle */}
      <div className="lg:hidden p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-zinc-950 z-20">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('pages:locations.content.title', 'Find a Store')}
        </h1>
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-full">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-700 text-starbucks-green shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <List className="w-4 h-4" />
            {t('pages:locations.view.list', 'List')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              viewMode === 'map'
                ? 'bg-white dark:bg-zinc-700 text-starbucks-green shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <MapIcon className="w-4 h-4" />
            {t('pages:locations.view.map', 'Map')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative h-full overflow-hidden">

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div
          className={cn(
            'w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col h-full bg-white dark:bg-zinc-950 z-10 overflow-hidden',
            viewMode === 'map' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showDetail ? (
              /* ── Detail Panel ── */
              <StoreDetailPanel
                key="detail"
                location={selectedLocation}
                distanceKm={selectedDistanceKm}
                onBack={() => setSelectedLocation(null)}
              />
            ) : (
              /* ── Store List ── */
              <motion.div
                key="list"
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col h-full"
              >
                {/* Search header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
                  <h2 className="hidden lg:block text-3xl font-black text-gray-900 dark:text-white mb-6">
                    {t('pages:locations.content.title', 'Find a Store')}
                  </h2>
                  <PlacesAutocomplete
                    search={search}
                    setSearch={setSearch}
                    onPlaceSelect={handlePlaceSelect}
                  />
                </div>

                {/* Sorted-by-distance banner */}
                <AnimatePresence>
                  {sortedByDistance && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden shrink-0"
                    >
                      <div className="flex items-center gap-2 px-6 py-3 bg-starbucks-green/5 border-b border-starbucks-green/20 text-starbucks-green text-sm font-bold">
                        <Navigation2 className="w-4 h-4 shrink-0" />
                        <span>{t('pages:locations.sorted_by_distance', 'Sorted by nearest to you')}</span>
                        <button
                          onClick={() => setUserLocation(null)}
                          className="ms-auto text-xs underline underline-offset-2 opacity-60 hover:opacity-100 font-medium transition-opacity"
                        >
                          {t('pages:locations.clear', 'Clear')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Store list */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                  <QueryErrorBoundary variant="compact">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={ANIMATION_CONFIG.VARIANTS.STAGGER_CONTAINER}
                      className="flex flex-col gap-4"
                    >
                      {processedLocations.length === 0 ? (
                        <p className="py-8 text-gray-400 font-bold text-center italic">
                          {t('pages:locations.content.no_results', 'No stores found.')}
                        </p>
                      ) : (
                        processedLocations.map(({ loc: location, distanceKm }) => (
                          <motion.div
                            key={location.id || location.slug}
                            variants={ANIMATION_CONFIG.VARIANTS.STAGGER_ITEM}
                            layout
                          >
                            <LocationCard
                              location={location}
                              isRTL={isRTL}
                              t={t}
                              isSelected={selectedLocation === location}
                              distanceKm={distanceKm}
                              onClick={() => {
                                setSelectedLocation(location);
                                if (window.innerWidth < 1024) setViewMode('map');
                              }}
                            />
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </QueryErrorBoundary>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Map ────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex-1 relative h-full',
            viewMode === 'list' ? 'hidden lg:block' : 'block'
          )}
        >
          <StoreMap
            locations={filteredLocations}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
              if (loc && window.innerWidth < 1024) setViewMode('list');
            }}
            onLocateMe={handleUseMyLocation}
            geoStatus={geoStatus}
          />

          {import.meta.env.DEV && (
            <button
              id="sentry-test-btn"
              onClick={() => {
                const err = new Error('[Sentry Test] Starbucks EG — error tracking verified ✅');
                captureError(err, { page: 'LocationsPage', triggeredBy: 'sentry-test-btn' });
                throw err;
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all"
            >
              🧪 Test Sentry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
