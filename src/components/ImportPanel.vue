<template>
  <div class="import-panel">
    <p class="hint">{{ hint }}</p>

    <div class="template-row" v-if="templateUrl">
      <el-button type="success" plain @click="downloadTpl">
        <el-icon><Download /></el-icon>
        下载导入模板
      </el-button>
    </div>

    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :limit="1"
      accept=".xlsx,.xls"
      :on-change="handleFileChange"
      :on-remove="handleRemove"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">仅支持 xlsx / xls 文件</div>
      </template>
    </el-upload>

    <el-button
      type="primary"
      style="margin-top: 16px"
      :loading="uploading"
      :disabled="!selectedFile"
      @click="handleUpload"
    >
      开始导入
    </el-button>

    <div v-if="importResult" class="import-result">
      <el-alert
        :type="importResult.success ? 'success' : 'error'"
        :title="importResult.message"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  type: { type: String, required: true },
  apiFn: { type: Function, required: true },
  templateUrl: { type: String, default: '' },
  hint: { type: String, default: '' }
})

const uploadRef = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)
const importResult = ref(null)

const handleFileChange = (file) => {
  selectedFile.value = file.raw
  importResult.value = null
}

const handleRemove = () => {
  selectedFile.value = null
  importResult.value = null
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  importResult.value = null
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await props.apiFn(formData)
    const d = res.data
    importResult.value = { success: true, message: `导入成功！共${d.total}条，成功${d.success}条，失败${d.fail}条` }
    selectedFile.value = null
    uploadRef.value?.clearFiles()
  } catch (e) {
    importResult.value = { success: false, message: e.message || '导入失败' }
  } finally {
    uploading.value = false
  }
}

const downloadTpl = () => {
  const token = localStorage.getItem('rsms_token')
  const a = document.createElement('a')
  a.href = props.templateUrl + '?token=' + token
  a.download = ''
  a.click()
}
</script>

<style scoped>
.hint { color: #666; margin-bottom: 16px; font-size: 14px; }
.template-row { margin-bottom: 16px; }
.import-result { margin-top: 16px; }
</style>
