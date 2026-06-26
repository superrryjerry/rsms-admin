<template>
  <div class="import-panel">
    <p class="hint">{{ hint }}</p>

    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :limit="1"
      accept=".xlsx,.xls,.csv"
      :on-change="handleFileChange"
      :on-remove="handleRemove"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">仅支持 xlsx / xls / csv 文件</div>
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
    importResult.value = { success: true, message: res.data?.message || '导入成功' }
    selectedFile.value = null
    uploadRef.value?.clearFiles()
  } catch (e) {
    importResult.value = { success: false, message: e.message || '导入失败' }
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.hint { color: #666; margin-bottom: 16px; font-size: 14px; }
.import-result { margin-top: 16px; }
</style>
