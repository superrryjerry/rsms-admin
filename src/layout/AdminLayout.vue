<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <el-icon size="24"><Monitor /></el-icon>
        <span v-show="!isCollapse">小斯的商用车客户跟踪后台</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/dealers">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>经销商管理</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/pool">
          <el-icon><Coin /></el-icon>
          <template #title>公海池管理</template>
        </el-menu-item>
        <el-menu-item index="/vehicles">
          <el-icon><Van /></el-icon>
          <template #title>车辆管理</template>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><UserFilled /></el-icon>
          <template #title>客户管理</template>
        </el-menu-item>
        <el-menu-item index="/leads">
          <el-icon><Bell /></el-icon>
          <template #title>线索管理</template>
        </el-menu-item>
        <el-menu-item index="/approvals">
          <el-icon><Checked /></el-icon>
          <template #title>审批管理</template>
        </el-menu-item>
        <el-menu-item index="/contracts">
          <el-icon><Document /></el-icon>
          <template #title>合同管理</template>
        </el-menu-item>
        <el-menu-item index="/workorders">
          <el-icon><Tickets /></el-icon>
          <template #title>工单管理</template>
        </el-menu-item>
        <el-menu-item index="/activities">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>销售活动</template>
        </el-menu-item>
        <el-menu-item index="/config">
                  <el-icon><Setting /></el-icon>
                  <template #title>系统配置</template>
                </el-menu-item>
                <el-menu-item index="/customer-tags">
                  <el-icon><PriceTag /></el-icon>
                  <template #title>客户标签管理</template>
                </el-menu-item>
                <el-menu-item index="/import">
          <el-icon><Upload /></el-icon>
          <template #title>数据导入</template>
        </el-menu-item>
                <el-menu-item index="/login-logs">
                  <el-icon><Notebook /></el-icon>
                  <template #title>登录日志</template>
                </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="user-name">{{ userStore.userInfo?.name || '管理员' }}</span>
          <el-dropdown @command="handleCommand">
            <el-icon size="20"><ArrowDown /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">沪ICP备2026032337号-1</a>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #ffffff1a;
}
.el-menu {
  border-right: none;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  font-size: 14px;
  color: #333;
}
.main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
.footer {
  text-align: center;
  padding: 12px 0;
  background: #f0f2f5;
  color: #666;
  font-size: 12px;
}
.footer a {
  color: #666;
  text-decoration: none;
}
.footer a:hover {
  color: #409EFF;
}
</style>
