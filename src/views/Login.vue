<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <el-icon size="40" color="#409EFF"><Monitor /></el-icon>
        <h2>RSMS 经销商CRM</h2>
        <p>管理后台</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号/账号" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" style="width: 100%">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ phone: '', password: '' })
const rules = {
  phone: [{ required: true, message: '请输入手机号/账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const data = await userStore.login(form)
    ElMessage.success('登录成功')
    if (data.must_change_pwd) {
      router.push('/change-password')
    } else {
      router.push('/')
    }
  } catch (e) {
    // error handled in interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.login-header h2 {
  margin: 12px 0 4px;
  color: #303133;
}
.login-header p {
  color: #909399;
  font-size: 14px;
}
</style>
