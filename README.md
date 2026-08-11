# 会员管理系统 - 前端

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Zustand (状态管理)
- Axios (HTTP 请求)

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 环境变量

创建 `.env.development` 文件：

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 项目结构

```
src/
├── api/            # API 请求
├── components/     # 公共组件
├── pages/          # 页面
├── stores/         # 状态管理
├── types/          # TypeScript 类型
├── App.tsx         # 根组件
├── main.tsx        # 入口文件
└── index.css       # 全局样式
```

## 页面

- `/login` - 登录页
- `/dashboard` - 仪表盘
- `/members` - 会员管理
- `/members/:id` - 会员详情
- `/card-types` - 卡种管理
- `/member-cards` - 会员卡管理
- `/signs` - 签到管理
- `/transactions` - 交易记录
