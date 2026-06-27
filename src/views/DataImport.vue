<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <span>数据导入</span>
      </template>

      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>导入说明</template>
        <p>支持 .xlsx / .xls 格式文件，单次上传一个文件。请先下载对应模板，按模板格式准备数据后上传。</p>
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="公海池导入" name="pool">
          <ImportPanel type="pool" :api-fn="adminApi.importPool" :template-url="adminApi.downloadTemplate('pool')" hint="上传公海池数据" />
        </el-tab-pane>
        <el-tab-pane label="车辆导入" name="vehicles">
          <ImportPanel type="vehicles" :api-fn="adminApi.importVehicles" :template-url="adminApi.downloadTemplate('vehicles')" hint="上传车辆数据" />
        </el-tab-pane>
        <el-tab-pane label="合同导入" name="contracts">
          <ImportPanel type="contracts" :api-fn="adminApi.importContracts" :template-url="adminApi.downloadTemplate('contracts')" hint="上传合同数据" />
        </el-tab-pane>
        <el-tab-pane label="工单导入" name="workorders">
          <ImportPanel type="workorders" :api-fn="adminApi.importWorkOrders" :template-url="adminApi.downloadTemplate('workorders')" hint="上传工单数据" />
        </el-tab-pane>
        <el-tab-pane label="客户导入" name="customers">
          <ImportPanel type="customers" :api-fn="adminApi.importCustomers" :template-url="adminApi.downloadTemplate('customers')" hint="上传客户数据（标签、所在市、注册信息等）" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { adminApi } from '../api'
import ImportPanel from '../components/ImportPanel.vue'

const activeTab = ref('pool')
</script>
