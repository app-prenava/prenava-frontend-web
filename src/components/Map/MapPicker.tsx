import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error Leaflet icon fix for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icon for selected/active state
const selectedIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker icon for existing locations
const existingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: number;
  position: MapPosition;
  label: string;
  info?: React.ReactNode;
}

interface MapPickerProps {
  initialPosition?: MapPosition;
  markers?: MapMarker[];
  selectedPosition?: MapPosition | null;
  onLocationSelect?: (position: MapPosition) => void;
  editable?: boolean;
  zoom?: number;
  height?: string | number;
}

// Component to handle map click events
const MapClickHandler = ({
  onLocationSelect,
  editable,
}: {
  onLocationSelect?: (position: MapPosition) => void;
  editable: boolean;
}) => {
  useMapEvents({
    click(e) {
      if (editable && onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

// Component to recenter map
const MapRecenter = ({ position, zoom }: { position: MapPosition; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([position.lat, position.lng], zoom);
  }, [map, position.lat, position.lng, zoom]);

  return null;
};

const MapPicker = ({
  initialPosition = { lat: -6.2088, lng: 106.8456 }, // Default: Jakarta
  markers = [],
  selectedPosition,
  onLocationSelect,
  editable = true,
  zoom = 13,
  height = 400,
}: MapPickerProps) => {
  const [mapReady, setMapReady] = useState(false);

  // Handle draggable marker
  const handleMarkerDrag = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    if (onLocationSelect) {
      onLocationSelect({ lat: position.lat, lng: position.lng });
    }
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[initialPosition.lat, initialPosition.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationSelect={onLocationSelect} editable={editable} />

        {/* Recenter map when initialPosition changes */}
        {mapReady && <MapRecenter position={initialPosition} zoom={zoom} />}

        {/* Existing markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={existingIcon}
          >
            <Popup>
              <div className="min-w-[150px]">
                <strong>{marker.label}</strong>
                {marker.info && <div className="mt-2">{marker.info}</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected position marker (draggable) */}
        {selectedPosition && (
          <Marker
            position={[selectedPosition.lat, selectedPosition.lng]}
            icon={selectedIcon}
            draggable={editable}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          >
            <Popup>
              <div>
                <strong>Lokasi Terpilih</strong>
                <div className="text-xs mt-1">
                  Lat: {selectedPosition.lat.toFixed(6)}
                  <br />
                  Lng: {selectedPosition.lng.toFixed(6)}
                </div>
                {editable && (
                  <div className="text-xs text-gray-500 mt-1">
                    Drag marker untuk mengubah posisi
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
