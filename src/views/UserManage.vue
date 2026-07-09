<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
        </div>
      </template>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="phone" label="账号" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="dealer_code" label="经销商代码" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : row.role === 'admin_test' ? 'warning' : ''" size="small">
              {{ row.role === 'admin' ? '超级管理员' : row.role === 'admin_test' ? 'Web管理员' : '经销商员工' }}
            </el-tag>
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
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" @click="handleReset(row)">重置密码</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggle(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑用户' : '新增用户'" width="460px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="账号" required>
          <el-input v-model="form.phone" placeholder="登录账号（可填数字或文本）" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" required>
          <el-input v-model="form.password" type="password" placeholder="初始密码" show-password />
        </el-form-item>
        <el-form-item label="经销商代码">
          <el-input v-model="form.dealer_code" placeholder="关联经销商" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="经销商员工" value="dealer_staff" />
            <el-option label="Web管理员" value="admin_test" />
            <el-option label="超级管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ isEdit ? '保存' : '创建' }}</el-button>
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
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const form = reactive({ phone: '', name: '', password: '', dealer_code: '', role: 'dealer_staff' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsers()
    users.value = res.data
  } finally { loading.value = false }
}

const openCreateDialog = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, { phone: '', name: '', password: '', dealer_code: '', role: 'dealer_staff' })
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    phone: row.phone,
    name: row.name,
    password: '',
    dealer_code: row.dealer_code || '',
    role: row.role
  })
  showDialog.value = true
}

const handleSubmit = async () => {
  if (!form.phone || !form.name) return ElMessage.warning('请填写必填项')
  if (!isEdit.value && !form.password) return ElMessage.warning('请填写密码')
  if (!isEdit.value && form.password.length < 8) return ElMessage.warning('密码至少8位')
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await adminApi.updateUser(editId.value, {
        phone: form.phone,
        name: form.name,
        dealer_code: form.dealer_code || null,
        role: form.role
      })
      ElMessage.success('更新成功')
    } else {
      await adminApi.createUser({
        phone: form.phone,
        name: form.name,
        password: form.password,
        dealer_code: form.dealer_code || null,
        role: form.role
      })
      ElMessage.success('创建成功')
    }
    showDialog.value = false
    loadData()
  } finally { submitting.value = false }
}

const handleReset = async (row) => {
  // 直接输入新密码（管理员重置不需要旧密码）
  const { value: newPwd } = await ElMessageBox.prompt(`请输入 ${row.name} 的新密码`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputPattern: /.{8,}/,
    inputErrorMessage: '密码至少8位'
  }).catch(() => ({ value: null }))
  if (!newPwd) return

  await adminApi.resetPassword(row.id, { new_password: newPwd })
  ElMessage.success('密码已重置，用户下次登录需修改密码')
}

const handleToggle = async (row) => {
  await adminApi.toggleUser(row.id)
  ElMessage.success('状态已更新')
  loadData()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      // 错误已在api拦截器中处理
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
