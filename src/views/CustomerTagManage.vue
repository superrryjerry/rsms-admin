<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>客户标签管理</span>
          <div class="header-actions">
            <el-select v-model="filterTag" placeholder="筛选标签" clearable style="width: 120px; margin-right: 8px" @change="loadData">
              <el-option label="核心" value="core" />
              <el-option label="焦点" value="focus" />
              <el-option label="绿洲" value="oasis" />
              <el-option label="沙漠" value="desert" />
            </el-select>
            <el-input v-model="keyword" placeholder="搜索客户名称" clearable style="width: 200px; margin-right: 8px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" plain @click="exportData">
              <el-icon><Download /></el-icon> 导出
            </el-button>
            <el-button type="warning" plain @click="importDialog = true">
              <el-icon><Upload /></el-icon> 导入
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="customer_name" label="客户名称" min-width="160" />
        <el-table-column prop="tag" label="标签" width="100">
          <template #default="{ row }">
            <el-tag :type="tagType(row.tag)" size="small">{{ tagLabel(row.tag) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="所在市" width="100" />
        <el-table-column prop="tag_dealer_name" label="打标签经销商" min-width="120" show-overflow-tooltip />
        <el-table-column prop="updated_at" label="更新时间" width="160" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="deleteTag(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="loadData"
      />
    </el-card>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialog" title="导入客户标签" width="500px">
      <el-alert type="info" :closable="false" style="margin-bottom: 16px">
        <template #title>导入说明</template>
        <p>支持 xlsx/xls 格式。标签值填写：核心/焦点/绿洲/沙漠。增量更新，不会覆盖已有数据。</p>
      </el-alert>
      <div style="margin-bottom: 16px">
        <el-button type="success" plain @click="downloadTemplate">
          <el-icon><Download /></el-icon> 下载导入模板
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
      <template #footer>
        <el-button @click="importDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" :disabled="!selectedFile" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const filterTag = ref('')
const loading = ref(false)

const importDialog = ref(false)
const uploadRef = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)

const tagMap = { core: '核心', focus: '焦点', oasis: '绿洲', desert: '沙漠' }
const tagTypeMap = { core: 'danger', focus: 'warning', oasis: 'success', desert: 'info' }
const tagLabel = (t) => tagMap[t] || t
const tagType = (t) => tagTypeMap[t] || ''

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, size: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (filterTag.value) params.tag = filterTag.value
    const res = await http.get('/admin/customer-tags/list', { params })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const exportData = () => {
  const token = localStorage.getItem('rsms_token')
  let url = '/api/admin/customer-tags/export?token=' + token
  if (keyword.value) url += '&keyword=' + encodeURIComponent(keyword.value)
  if (filterTag.value) url += '&tag=' + filterTag.value
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  a.click()
}

const downloadTemplate = () => {
  const token = localStorage.getItem('rsms_token')
  const a = document.createElement('a')
  a.href = '/api/admin/customer-tags/template?token=' + token
  a.download = ''
  a.click()
}

const handleFileChange = (file) => { selectedFile.value = file.raw }
const handleRemove = () => { selectedFile.value = null }

const handleImport = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    const res = await http.post('/admin/customer-tags/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    const d = res.data
    ElMessage.success(`导入完成！共${d.total}条，成功${d.success}条，失败${d.fail}条`)
    selectedFile.value = null
    uploadRef.value?.clearFiles()
    importDialog.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.message || '导入失败')
  } finally { uploading.value = false }
}

const deleteTag = async (row) => {
  await ElMessageBox.confirm(`确定删除 "${row.customer_name}" 在 ${row.dealer_code} 的标签？`, '确认删除', { type: 'warning' })
  await http.delete(`/admin/customer-tags/${row.id}`)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; }
</style>
