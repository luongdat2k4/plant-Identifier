<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { articles } from '../data/articles'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go } = useAppNavigation()
</script>

<template>
<header class="topbar"><div><p class="eyebrow">GROW YOUR KNOWLEDGE</p><h1>Plant care blog</h1></div></header><main class="content"><div class="blog-hero"><img src="/assets/ic_scroll_card_2.png" alt="Plant care illustration"/><span>PLANT CARE NOTES</span><h2>Small habits,<br/>healthier plants.</h2></div><div class="section-heading"><div><p class="eyebrow">LEARN</p><h2>Featured reads</h2></div></div><button v-for="item in articles" :key="item.title" class="article-row" @click="go('article', String(articles.indexOf(item)))"><img :src="item.image" alt=""/><span><small>{{ item.tag }}</small><b>{{ item.title }}</b><em>Read article →</em></span></button></main>
</template>
