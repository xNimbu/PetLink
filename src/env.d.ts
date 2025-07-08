/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  readonly NG_APP_WS_URL: string;

  readonly NG_APP_FIREBASE_API_KEY: string;
  readonly NG_APP_FIREBASE_AUTH_DOMAIN: string;
  readonly NG_APP_FIREBASE_DATABASE_URL: string;
  readonly NG_APP_FIREBASE_PROJECT_ID: string;
  readonly NG_APP_FIREBASE_STORAGE_BUCKET: string;
  readonly NG_APP_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly NG_APP_FIREBASE_APP_ID: string;
  readonly NG_APP_FIREBASE_MEASUREMENT_ID: string;

  readonly NG_APP_LOGIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
