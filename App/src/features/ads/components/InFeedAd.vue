<script setup lang="ts">
import type { NativeAdTemplate } from '@alf/app-sdk'
import { t } from '../../../shared/i18n'
import { adsAvailable } from '../adRuntime'
import NativeAd from './NativeAd.vue'

// In-feed ad: a native ad placed between feed items. The "Ad" label sits outside
// the ad view so the placement stays identifiable even before the creative
// loads; the SDK's own badge and AdChoices stay inside and are never covered.
// The space is reserved up front, so the feed does not shift when the ad fills.
const props = withDefaults(defineProps<{ template?: NativeAdTemplate }>(), { template: 'mrec' })
</script>

<template>
  <div v-if="adsAvailable" class="in-feed-ad">
    <p><span class="ad-tag">{{ t('ads.label') }}</span></p>
    <NativeAd :template="props.template" />
  </div>
</template>

<style scoped>
.in-feed-ad { width: 100%; }
.in-feed-ad p { margin: 0 0 8px; }
.ad-tag { display: inline-block; border-radius: 5px; background: #1c2a20; padding: 2px 8px; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
</style>
