import { ALF, type Config } from '@alf/app-sdk'

// Google's official test app IDs. `settings.testAds` makes AdController request Google's
// test ad units for every format, so ads fill without a real AdMob account. Replace both
// app IDs and the ad units (and the APPLICATION_ID in AndroidManifest.xml), then set
// `testAds: false` and `dev: false`, before shipping.
const TEST_APP_ID = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
}

export const adsConfig: Config = {
  settings: {
    dev: true,
    testAds: true,
    isGame: false,
    isApp: true,
    appName: 'PlantIn',
    appVersion: '1.0.0',
    environment: 'dev',
  },
  keys: {
    admob: {
      android: { appId: TEST_APP_ID.android, banner: '', interstitial: '', rewarded: '', openApp: '', native: '' },
      ios: { appId: TEST_APP_ID.ios, banner: '', interstitial: '', rewarded: '', openApp: '', native: '' },
    },
  },
}

// Ads only: the rest of the framework (analytics, push, i18n, IAP) is not
// initialised, so booting it cannot prompt or log anything the app didn't ask for.
export async function initAds(): Promise<void> {
  const alf = ALF.Instance
  await alf.initControllers()
  alf.Config.set(adsConfig)
  await alf.Ads.initAdMob()
}
