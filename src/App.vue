<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 antialiased">
    <router-view />

    <!-- Non-intrusive version badge (bottom-left). pointer-events-none so it
         can never block clicks; muted + tiny so it won't distract. -->
    <span
      class="fixed bottom-2 left-2 z-[9999] text-[10px] leading-none font-mono
             text-slate-400/70 select-none pointer-events-none print:hidden">
      v{{ APP_VERSION }}
    </span>
  </div>
</template>

<script setup>
import { APP_VERSION } from './config';
</script>
