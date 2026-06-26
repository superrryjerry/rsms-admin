<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <span>数据导入</span>
      </template>

      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>导入说明</template>
        <p>支持 .xlsx / .xls / .csv 格式文件，单次上传一个文件。请按照模板格式准备数据。</p>
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="公海池导入" name="pool">
          <ImportPanel type="pool" :api-fn="adminApi.importPool" hint="上传公海池数据（客户名称、联系方式等）" />
        </el-tab-pane>
        <el-tab-pane label="车辆导入" name="vehicles">
          <ImportPanel type="vehicles" :api-fn="adminApi.importVehicles" hint="上传车辆数据（VIN、车型、状态等）" />
        </el-tab-pane>
        <el-tab-pane label="合同导入" name="contracts">
          <ImportPanel type="contracts" :api-fn="adminApi.importContracts" hint="上传合同数据（合同号、客户、金额等）" />
        </el-tab-pane>
        <el-tab-pane label="工单导入" name="workorders">
          <ImportPanel type="workorders" :api-fn="adminApi.importWorkOrders" hint="上传工单数据（工单号、类型、状态等）" />
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
