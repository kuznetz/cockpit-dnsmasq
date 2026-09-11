<template>
  <div>
      <div class="card danger" style="margin-bottom: 20px; max-width: 1050px">
        <div class="card-title">Parser Warnings</div>
        <div class="card-body padding">
          <div v-for="wrn,i in warnings" :key="i" v-text="wrn"></div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  // Format: ["warn1", ...]
  warnings: {
    type: Array,
    default: () => []
  },
})
</script>