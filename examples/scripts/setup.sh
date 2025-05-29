#!/bin/bash

# Composio MCP 自动化设置脚本
# 使用方法: ./setup.sh [client] [service] [api-key]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -lt 3 ]; then
    log_error "使用方法: $0 [client] [service] [api-key]"
    log_info "示例: $0 cursor gmail your-api-key-here"
    log_info "支持的客户端: cursor, claude, windsurf"
    log_info "支持的服务: gmail, slack, linear, github, notion, salesforce"
    exit 1
fi

CLIENT=$1
SERVICE=$2
API_KEY=$3

# 验证客户端
case $CLIENT in
    cursor|claude|windsurf)
        log_info "设置 $CLIENT 客户端..."
        ;;
    *)
        log_error "不支持的客户端: $CLIENT"
        exit 1
        ;;
esac

# 验证服务
case $SERVICE in
    gmail|slack|linear|github|notion|salesforce|trello|asana|hubspot|zendesk)
        log_info "配置 $SERVICE 服务..."
        ;;
    *)
        log_error "不支持的服务: $SERVICE"
        exit 1
        ;;
esac

# 检查前置条件
log_info "检查前置条件..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装。请访问 https://nodejs.org/ 安装 Node.js 16+"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    log_error "Node.js 版本过低 (当前: $(node -v))。需要 16.0.0 或更高版本"
    exit 1
fi

log_success "Node.js 版本检查通过: $(node -v)"

# 检查 npx
if ! command -v npx &> /dev/null; then
    log_error "npx 未找到。请确保 npm 正确安装"
    exit 1
fi

log_success "npx 检查通过"

# 设置环境变量
export COMPOSIO_API_KEY="$API_KEY"

# 构建 MCP URL
MCP_URL="https://mcp.composio.dev/$SERVICE/$API_KEY"

log_info "开始安装 Composio MCP 服务器..."

# 根据客户端类型执行不同的安装命令
case $CLIENT in
    cursor)
        log_info "为 Cursor 安装 $SERVICE MCP 服务器..."
        npx @composio/mcp@latest setup "$MCP_URL" --client cursor
        ;;
    claude)
        log_info "为 Claude 生成配置..."
        log_warning "Claude Desktop 需要手动配置。请将以下内容添加到 Claude 配置文件中:"
        echo ""
        echo "{"
        echo "  \"mcpServers\": {"
        echo "    \"composio-$SERVICE\": {"
        echo "      \"command\": \"npx\","
        echo "      \"args\": ["
        echo "        \"@composio/mcp@latest\","
        echo "        \"server\","
        echo "        \"--url\","
        echo "        \"$MCP_URL\""
        echo "      ]"
        echo "    }"
        echo "  }"
        echo "}"
        echo ""
        ;;
    windsurf)
        log_info "为 Windsurf 安装 $SERVICE MCP 服务器..."
        npx @composio/mcp@latest setup "$MCP_URL" --client windsurf
        ;;
esac

if [ $? -eq 0 ]; then
    log_success "MCP 服务器安装完成!"
else
    log_error "安装过程中出现错误"
    exit 1
fi

# 运行健康检查
log_info "运行健康检查..."

# 检查 Composio API 连接
log_info "测试 Composio API 连接..."
API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $API_KEY" https://api.composio.dev/v1/auth/verify)

if [ "$API_CHECK" = "200" ]; then
    log_success "API 连接测试通过"
else
    log_warning "API 连接测试失败 (HTTP $API_CHECK)。请检查 API 密钥是否正确"
fi

# 提供后续步骤指导
log_info "设置完成! 后续步骤:"
echo ""
echo "1. 重启你的 $CLIENT 客户端"
echo "2. 在客户端中测试 MCP 连接:"
echo "   - 在聊天中询问: '列出所有可用的工具'"
echo "   - 或者尝试: '帮我发送一封测试邮件'"
echo ""
echo "3. 如果需要 OAuth 认证，请在客户端中执行:"
echo "   'create a connection with $SERVICE'"
echo ""
echo "4. 查看更多示例和文档:"
echo "   https://github.com/Joseph19820124/mcp-composio"
echo ""

log_success "Composio MCP 设置向导完成!"
