<template>
  <ul class="list">
    <li v-for="item in items" :key="item.meetingID" class="table">
      <div class="table-info bg-dropdown-background">
        <span class="name">{{ item.meetingName }}</span>
        <span class="subtitle">
          {{ $t('tables.participantCount', { count: item.participantCount }) }}
        </span>
      </div>
      <button class="action" @click="openTable(item.id)">
        <v-icon class="icon" icon="$camera" />
      </button>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { navigate } from 'vike/client/router'

import type { OpenTable } from '#stores/tablesStore'

defineProps<{
  items: OpenTable[]
}>()

const emit = defineEmits(['openTable'])

const openTable = (id: number) => {
  emit('openTable')
  navigate(`/table/${id}`)
}
</script>

<style scoped>
.list {
  display: flex;
  flex-flow: column;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.table {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.table-info {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  width: 100%;
  height: 42px;
  padding: 5px 24px;
  border-radius: 16px 0 0 16px;
}

.name {
  height: 18px;
  font-size: 14px;
  font-weight: bold;
}

.subtitle {
  font-size: 11px;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 41px;
  min-width: 41px;
  height: 42px;
  color: #fff;
  background-color: #f09630;
  border-radius: 0 16px 16px 0;
}

.icon {
  transform: scale(0.8);
}
</style>
