import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = { 
  appId: 'com.plantin.recreated', 
  appName: 'PlantIn', 
  webDir: 'dist', 
  server: {
    androidScheme: 'http',
    url: 'http://192.168.179.209:5173',
    cleartext: true
  },
}
export default config
