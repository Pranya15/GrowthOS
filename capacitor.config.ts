import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.growthos.app',
  appName: 'Growth OS',
  webDir: 'out', // use 'out' if using Next.js export
  android: {
    allowMixedContent: true
  }
};

export default config;
