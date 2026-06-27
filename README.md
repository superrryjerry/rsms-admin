# RSMS CRM Admin Frontend

基于 Vue.js 3 + Element Plus 的 CRM 系统管理后台前端。

## 技术栈

- **框架**: Vue.js 3
- **UI组件**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios

## 主要功能

- 用户登录与权限管理
- 经销商管理
- 客户管理
- 车辆管理
- 合同管理
- 工单管理
- 销售活动管理
- 线索管理
- 数据导入/导出
- 公海池管理

## 项目结构

```
src/
├── components/      # 公共组件
├── views/           # 页面视图
├── router/          # 路由配置
├── stores/          # 状态管理
├── utils/           # 工具函数
├── api/             # API接口
└── App.vue          # 根组件
```

## 页面说明

### 登录页
- 用户登录入口
- 首次登录强制修改密码

### 仪表盘
- 系统概览
- 数据统计

### 客户管理
- 客户列表
- 客户详情
- 客户标签管理

### 车辆管理
- 车辆列表
- 服务经销商管理
- 变更申请

### 销售活动
- 活动列表
- 活动创建
- 按经销商层级查看

### 线索管理
- 线索列表
- 状态管理（未跟进/跟进中/已结束）

### 数据导入
- 公海池数据导入
- 车辆数据导入
- 合同数据导入
- 工单数据导入

## 开发指南

### 环境要求
- Node.js >= 16.x
- npm >= 8.x

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 部署说明

### 构建
```bash
npm run build
```

### 部署文件
将 `dist/` 目录下的文件部署到 Web 服务器（Nginx/Apache）

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server:3000;
    }
}
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

MIT
