import { useCallback, useEffect } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { StoreMarker } from './StoreMarker';
import { UserLocationMarker } from './UserLocationMarker';
import { MapControls } from './MapControls';
import type { Location } from '@/types';

type LatLngLiteral = { lat: number; lng: number };

interface StoreMapProps {
  locations: Location[];
  userLocation: LatLngLiteral | null;
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  onLocateMe: () => void;
  geoStatus: 'idle' | 'loading' | 'error';
}

function getPosition(location: Location): google.maps.LatLngLiteral {
  return (
    location.coordinates || {
      lat: location.latitude || 0,
      lng: location.longitude || 0,
    }
  );
}

/** Pans the map to the selected location — must live inside <Map> to access useMap(). */
function MapPanner({ selectedLocation }: { selectedLocation: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedLocation) return;
    const pos = getPosition(selectedLocation);
    if (pos.lat && pos.lng) {
      map.panTo(pos);
      map.setZoom(15);
    }
  }, [map, selectedLocation]);

  return null;
}

export function StoreMap({
  locations,
  userLocation,
  selectedLocation,
  onLocationSelect,
  onLocateMe,
  geoStatus,
}: StoreMapProps) {
  /*
   * mapId is omitted unless VITE_GOOGLE_MAPS_ID is configured.
   *
   * We no longer use AdvancedMarker (replaced with legacy Marker to avoid
   * the React 19 getRootNode / setAttribute incompatibility), so mapId is
   * not required. Passing mapId='DEMO_MAP_ID' triggers an async cloud-style
   * fetch that also crashes in React 19 (~1s after load, setAttribute error).
   */
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || undefined;
  const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // Cairo, Egypt

  const handleMarkerClick = useCallback(
    (location: Location) => {
      onLocationSelect(location);
    },
    [onLocationSelect]
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden relative shadow-lg">
      <Map
        defaultZoom={11}
        defaultCenter={defaultCenter}
        mapId={mapId}
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        {/* Must be inside <Map> so useMap() and useEffect work correctly */}
        <MapPanner selectedLocation={selectedLocation} />
        <MapControls onLocateMe={onLocateMe} geoStatus={geoStatus} />

        {userLocation && <UserLocationMarker position={userLocation} />}

        {locations.map((location) => (
          <StoreMarker
            key={location.id || location.slug}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>
    </div>
  );
}
