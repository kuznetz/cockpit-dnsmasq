<template>
  <div style="margin-bottom: 20px; max-width: 1050px">

    <pf-notification-drawer>
      <pf-notification-drawer-body>
        <pf-notification-drawer-list>
          <pf-notification-drawer-list-item variant="danger">
            <pf-notification-drawer-list-item-header variant="danger" title="Parser Warnings">
            </pf-notification-drawer-list-item-header>
            <pf-notification-drawer-list-item-body>
              <p>Configuration can be damaged after saving, lines:</p>
              <div v-for="wrn,i in warnings" :key="i" v-text="wrn"></div>
            </pf-notification-drawer-list-item-body>
          </pf-notification-drawer-list-item>
        </pf-notification-drawer-list>
      </pf-notification-drawer-body>
    </pf-notification-drawer>

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