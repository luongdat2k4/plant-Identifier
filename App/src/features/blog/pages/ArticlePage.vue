<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { articles } from '../data/articles'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const route = useRoute()
const { back } = useAppNavigation()
const article = computed(() => articles[Number(route.params.id)])
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant care</h2><span></span></header><main class="content article-page" v-if="article"><img :src="article?.image" alt=""/><p class="eyebrow">{{ article?.tag }}</p><h1>{{ article?.title }}</h1><p>{{ article?.text }}</p><div class="advice-card"><span>QUICK TIP</span><h3>Observe before you change your routine.</h3><p>A little time with your plant each week helps you notice what it needs.</p></div></main>
</template>
