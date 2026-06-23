<template>
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="modelValue"
          class="modal-overlay"
          @click.self="onCancel"
        >
          <div class="modal-box" role="dialog" :aria-labelledby="'modal-title-' + uid">
            <!-- Icon -->
            <div class="modal-icon" :class="'modal-icon--' + type">
              <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else-if="type === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
  
            <!-- Title -->
            <h3 :id="'modal-title-' + uid" class="modal-title">{{ title }}</h3>
  
            <!-- Message -->
            <p class="modal-message" v-html="message"></p>
  
            <!-- Footer -->
            <div class="modal-footer">
              <button
                v-if="showCancel"
                class="modal-btn modal-btn--cancel"
                @click="onCancel"
              >
                {{ cancelLabel }}
              </button>
              <button
                class="modal-btn"
                :class="'modal-btn--' + type"
                @click="onConfirm"
              >
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const uid = Math.random().toString(36).slice(2, 8)
  
  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    type: {
      type: String,
      default: 'info',
      validator: (v) => ['info', 'success', 'danger', 'warning'].includes(v)
    },
    title: { type: String, default: 'Konfirmasi' },
    message: { type: String, default: '' },
    confirmLabel: { type: String, default: 'OK' },
    cancelLabel: { type: String, default: 'Batal' },
    showCancel: { type: Boolean, default: false },
  })
  
  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
  
  const onConfirm = () => {
    emit('confirm')
    emit('update:modelValue', false)
  }
  
  const onCancel = () => {
    emit('cancel')
    emit('update:modelValue', false)
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  }
  
  .modal-box {
    background: #ffffff;
    border-radius: 16px;
    border: 0.5px solid rgba(0, 0, 0, 0.1);
    padding: 1.75rem 1.75rem 1.25rem;
    width: min(420px, 100%);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
  
  /* Icon */
  .modal-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .modal-icon svg { width: 22px; height: 22px; }
  
  .modal-icon--info    { background: #E6F1FB; color: #185FA5; }
  .modal-icon--success { background: #EAF3DE; color: #3B6D11; }
  .modal-icon--danger  { background: #FCEBEB; color: #A32D2D; }
  .modal-icon--warning { background: #FAEEDA; color: #854F0B; }
  
  /* Text */
  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 6px;
  }
  
  .modal-message {
    font-size: 14px;
    line-height: 1.6;
    color: #6B7280;
    margin-bottom: 1.25rem;
  }
  
  /* Footer */
  .modal-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 0.5px solid rgba(0, 0, 0, 0.08);
  }
  
  .modal-btn {
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    border: 0.5px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .modal-btn:hover  { opacity: 0.85; }
  .modal-btn:active { transform: scale(0.98); }
  
  .modal-btn--cancel {
    background: #F9FAFB;
    color: #6B7280;
    border-color: rgba(0,0,0,0.15);
  }
  .modal-btn--info    { background: #185FA5; color: #fff; }
  .modal-btn--success { background: #3B6D11; color: #fff; }
  .modal-btn--danger  { background: #A32D2D; color: #fff; }
  .modal-btn--warning { background: #854F0B; color: #fff; }
  
  /* Transitions */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .modal-fade-enter-active .modal-box,
  .modal-fade-leave-active .modal-box {
    transition: transform 0.2s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  .modal-fade-enter-from .modal-box {
    transform: scale(0.95) translateY(8px);
  }
  .modal-fade-leave-to .modal-box {
    transform: scale(0.95) translateY(8px);
  }
  </style>