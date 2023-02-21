/// <reference types="vite/client" />
/// <reference types="@types/amap-js-api-geolocation" />

interface Window {
    pushLocations: (locations: string) => Promise<void>,
    _AMapSecurityConfig: {
        securityJsCode: string,
    }
}

interface ServiceWorkerRegistration {
    sync: {
        register(tag: string): Promise<void>;
        getTags(): Promise<string[]>
    }
}