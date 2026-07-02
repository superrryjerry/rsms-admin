<template>
  <div class="page-container">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <span>系统配置</span>
      </template>

      <el-form label-width="160px" style="max-width: 600px">
        <el-divider content-position="left">基础设置</el-divider>
        <el-form-item label="系统名称">
          <el-input v-model="config.system_name" placeholder="小斯的商用车客户跟踪后台" />
        </el-form-item>
        <el-form-item label="线索自动分配">
          <el-switch v-model="config.lead_auto_assign" />
        </el-form-item>
        <el-form-item label="公海池自动回收(天)">
          <el-input-number v-model="config.pool_recycle_days" :min="1" :max="365" />
        </el-form-item>

        <el-divider content-position="left">通知设置</el-divider>
        <el-form-item label="新线索通知">
          <el-switch v-model="config.notify_new_lead" />
        </el-form-item>
        <el-form-item label="审批通知">
          <el-switch v-model="config.notify_approval" />
        </el-form-item>

        <el-divider content-position="left">数据保留</el-divider>
        <el-form-item label="日志保留(天)">
          <el-input-number v-model="config.log_retention_days" :min="30" :max="3650" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
          <el-button @click="loadConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '../api'

const loading = ref(false)
const saving = ref(false)

const config = reactive({
  system_name: '小斯的商用车客户跟踪后台',
  lead_auto_assign: false,
  pool_recycle_days: 30,
  notify_new_lead: true,
  notify_approval: true,
  log_retention_days: 90
})

const loadConfig = async () => {
  loading.value = true
  try {
    const res = await adminApi.getConfig()
    if (Array.isArray(res.data)) {
      for (const item of res.data) {
        if (item.config_key in config) {
          const v = item.config_value
          if (typeof config[item.config_key] === 'boolean') {
            config[item.config_key] = v === 'true' || v === '1'
          } else if (typeof config[item.config_key] === 'number') {
            config[item.config_key] = Number(v) || 0
          } else {
            config[item.config_key] = v
          }
        }
      }
    }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const configs = Object.entries(config).map(([config_key, config_value]) => ({
      config_key,
      config_value: String(config_value)
    }))
    await adminApi.updateConfig({ configs })
    ElMessage.success('配置已保存')
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<style scoped>
.el-divider { margin: 24px 0 16px; }
</style>
