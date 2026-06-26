<template>
  <div class="change-pwd-page">
    <div class="change-pwd-card">
      <div class="pwd-header">
        <el-icon size="40" color="#E6A23C"><WarningFilled /></el-icon>
        <h2>修改密码</h2>
        <p>首次登录需要修改密码</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="旧密码" prop="old_password">
          <el-input v-model="form.old_password" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="form.new_password" type="password" placeholder="至少8位" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input v-model="form.confirm_password" type="password" placeholder="再次输入新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleChange" style="width: 100%">确认修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { authApi } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ old_password: '', new_password: '', confirm_password: '' })

const validateConfirm = (rule, value, callback) => {
  if (value !== form.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  old_password: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码至少8位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const handleChange = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authApi.changePassword({ old_password: form.old_password, new_password: form.new_password })
    ElMessage.success('密码修改成功')
    // 更新本地用户信息
    if (userStore.userInfo) {
      userStore.userInfo.must_change_pwd = false
      localStorage.setItem('rsms_user', JSON.stringify(userStore.userInfo))
    }
    router.push('/')
  } catch (e) {
    // error handled in interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-pwd-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
}
.change-pwd-card {
  width: 440px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.pwd-header {
  text-align: center;
  margin-bottom: 30px;
}
.pwd-header h2 {
  margin: 12px 0 4px;
  color: #303133;
}
.pwd-header p {
  color: #E6A23C;
  font-size: 14px;
}
</style>
