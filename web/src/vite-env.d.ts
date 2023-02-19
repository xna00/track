/// <reference types="vite/client" />
/// <reference types="@types/amap-js-api-geolocation" />

interface Window {
    pushLocations: (locations: string) => Promise<void>
}