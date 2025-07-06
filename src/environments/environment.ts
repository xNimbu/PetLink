export const environment = {
  production: false,
  backendUrl: import.meta.env['NG_APP_API_URL'],
  wsUrl: import.meta.env['NG_APP_WS_URL'],
  firebaseConfig: {
    apiKey: import.meta.env['NG_APP_FIREBASE_API_KEY'],
    authDomain: import.meta.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
    databaseURL: import.meta.env['NG_APP_FIREBASE_DATABASE_URL'],
    projectId: import.meta.env['NG_APP_FIREBASE_PROJECT_ID'],
    storageBucket: import.meta.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: import.meta.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
    appId: import.meta.env['NG_APP_FIREBASE_APP_ID'],
    measurementId: import.meta.env['NG_APP_FIREBASE_MEASUREMENT_ID']
  },
  login: import.meta.env['NG_APP_LOGIN'] === 'true'
};
