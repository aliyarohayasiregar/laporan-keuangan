<template>
  <div id="app">
    <router-view />
    <AppModal
      v-model="visible"
      :type="state.type"
      :title="state.title"
      :message="state.message"
      :confirm-label="state.confirmLabel"
      :cancel-label="state.cancelLabel"
      :show-cancel="state.showCancel"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import AppModal from '@/components/AppModal.vue'
import { useModal } from '@/composables/useModal.js'

const { visible, state, onConfirm, onCancel } = useModal()
</script>