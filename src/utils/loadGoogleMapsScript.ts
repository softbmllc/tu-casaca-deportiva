//src/utils/loadGoogleMapsScript.ts
let isScriptLoaded = false;

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('Window is undefined');
      return;
    }

    if (isScriptLoaded || document.getElementById('google-maps-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      resolve();
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
}