<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showDialog = true">新增用户</el-button>
        </div>
      </template>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="dealer_code" label="经销商代码" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.role === 'admin' ? '管理员' : '经销商员工' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleReset(row)">重置密码</el-button>
            <el-button size="small" :type="row.status === 1 ? 'danger' : 'success'" @click="handleToggle(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" title="新增用户" width="460px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="手机号" required>
          <el-input v-model="form.phone" placeholder="登录手机号" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="form.password" type="password" placeholder="初始密码" show-password />
        </el-form-item>
        <el-form-item label="经销商代码">
          <el-input v-model="form.dealer_code" placeholder="关联经销商" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)
const showDialog = ref(false)
const creating = ref(false)
const form = reactive({ phone: '', name: '', password: '', dealer_code: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsers()
    users.value = res.data
  } finally { loading.value = false }
}

const handleCreate = async () => {
  if (!form.phone || !form.name || !form.password) return ElMessage.warning('请填写必填项')
  creating.value = true
  try {
    await adminApi.createUser(form)
    ElMessage.success('创建成功')
    showDialog.value = false
    Object.assign(form, { phone: '', name: '', password: '', dealer_code: '' })
    loadData()
  } finally { creating.value = false }
}

const handleReset = async (row) => {
  // 第一步：输入旧密码
  const { value: oldPwd } = await ElMessageBox.prompt('请先输入当前密码以验证身份', '重置密码 - 验证身份', {
    confirmButtonText: '下一步',
    cancelButtonText: '取消',
    inputType: 'password',
    inputPattern: /.+/,
    inputErrorMessage: '请输入当前密码'
  }).catch(() => ({ value: null }))
  if (!oldPwd) return

  // 第二步：输入新密码
  const { value: newPwd } = await ElMessageBox.prompt(`请输入 ${row.name} 的新密码`, '重置密码 - 新密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputPattern: /.{8,}/,
    inputErrorMessage: '密码至少8位'
  }).catch(() => ({ value: null }))
  if (!newPwd) return

  await adminApi.resetPassword(row.id, { old_password: oldPwd, new_password: newPwd })
  ElMessage.success('密码已重置')
}

const handleToggle = async (row) => {
  await adminApi.toggleUser(row.id)
  ElMessage.success('状态已更新')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
