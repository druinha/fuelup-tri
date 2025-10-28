import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'fuelup-tri',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#00000000',
      overlaysWebView: true
    }
  }
};

export default config;
