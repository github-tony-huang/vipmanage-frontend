FROM nginx:1.27-alpine

# 后端地址默认值，运行时用 -e API_BACKEND=http://xxx:8080 覆盖
ENV API_BACKEND=http://localhost:8080

# 只让 envsubst 替换 API_BACKEND，避免误替换 nginx 自身的 $host 等变量
ENV NGINX_ENVSUBST_FILTER=API_BACKEND

# 构建产物
COPY dist /usr/share/nginx/html

# nginx 配置模板：放到 templates 目录，nginx 官方镜像启动时
# 会自动用环境变量执行 envsubst 替换 ${API_BACKEND}，生成到 conf.d
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# 使用 nginx 官方默认启动流程（自动处理 templates 目录的 envsubst）
CMD ["nginx", "-g", "daemon off;"]
