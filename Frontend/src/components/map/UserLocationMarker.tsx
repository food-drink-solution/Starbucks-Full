import { Marker } from '@vis.gl/react-google-maps';

interface UserLocationMarkerProps {
  position: { lat: number; lng: number } | null;
}

/*
 * Uses the same legacy Marker approach as StoreMarker to avoid the
 * AdvancedMarker / getRootNode React 19 incompatibility.
 */
const USER_ICON = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#2563EB" fill-opacity="0.2" stroke="none"/>
    <circle cx="12" cy="12" r="6" fill="#2563EB" stroke="white" stroke-width="2.5"/>
  </svg>`
)}`;

export function UserLocationMarker({ position }: UserLocationMarkerProps) {
  if (!position) return null;

  return (
    <Marker
      position={position}
      zIndex={100}
      title="Your location"
      icon={{
        url: USER_ICON,
        scaledSize: { width: 24, height: 24, equals: () => false },
        anchor: { x: 12, y: 12, equals: () => false },
      }}
    />
  );
}
