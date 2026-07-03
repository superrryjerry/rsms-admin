<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>销售活动管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/客户/内容" clearable style="width: 260px; margin-right: 12px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="created_at" label="时间" width="160" />
        <el-table-column prop="user_name" label="销售人员" width="120" />
        <el-table-column prop="customer_name" label="客户名称" width="140" />
        <el-table-column prop="visit_method" label="活动方式" width="120" />
        <el-table-column prop="content" label="活动内容" min-width="240" show-overflow-tooltip />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getActivities({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
