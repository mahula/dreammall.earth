<template>
  <div class="step-header">
    <div class="step-header__left">
      <v-btn v-if="isBackButtonVisible" icon variant="text" size="small" @click="emitBack">
        <v-icon icon="mdi-arrow-left" />
      </v-btn>
    </div>
    <div class="step-header__middle">
      <h2 class="text-h6 font-weight-bold">{{ title }}</h2>
    </div>
    <div class="step-header__right">
      <v-btn v-if="isCloseButtonVisible" icon variant="text" size="small" @click="emitClose">
        <v-icon icon="mdi-close" />
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    isBackButtonVisible: boolean
    isCloseButtonVisible: boolean
  }>(),
  {
    title: '',
    isBackButtonVisible: true,
    isCloseButtonVisible: true,
  },
)

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'close'): void
}>()

const emitBack = () => emit('back')
const emitClose = () => emit('close')
</script>

<style scoped lang="scss">
.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;

  &__left,
  &__right {
    display: flex;
    align-items: center;
    width: 48px; // Ensures consistent spacing even when buttons are hidden
  }

  &__middle {
    flex-grow: 1;
    text-align: center;
  }
}
</style>
