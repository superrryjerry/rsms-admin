<template>
  <router-view />
</template>

<script setup>
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

/* 公共样式 - 避免各组件重复定义 */
.page-container { }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.pagination { margin-top: 16px; justify-content: flex-end; }
.text-muted { color: #999; font-size: 13px; }
</style>
