# Composio MCP Server 完整使用指南

## 目录
- [什么是 MCP (Model Context Protocol)](#什么是-mcp-model-context-protocol)
- [Composio MCP 简介](#composio-mcp-简介)
- [核心特性](#核心特性)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [支持的客户端](#支持的客户端)
- [安装配置](#安装配置)
- [认证设置](#认证设置)
- [常用集成示例](#常用集成示例)
- [高级用法](#高级用法)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

## 什么是 MCP (Model Context Protocol)

Model Context Protocol (MCP) 是由 Anthropic 开发的开放标准协议，旨在帮助 AI 模型（特别是大型语言模型）连接外部数据源和工具。

### MCP 的核心概念

**把 MCP 想象成 AI 的"USB-C 接口"** - 它提供了一个标准化的方式让 AI 系统访问外部工具和数据，而不需要为每个服务单独编写集成代码。

### MCP 与传统 API 的区别

| 特性 | 传统 API | MCP |
|------|----------|-----|
| 通信方式 | 单向请求-响应 | 双向动态通信 |
| 标准化 | 每个 API 不同 | 统一标准接口 |
| 维护复杂度 | 每个集成需要单独维护 | 写一次，所有 AI 系统都能使用 |
| 智能程度 | 静态集成 | 支持上下文感知和动态操作 |

## Composio MCP 简介

Composio MCP 是一个全面管理的 MCP 服务器实现，让开发者可以轻松地将 AI 代理与 250+ 外部工具、服务器和 API 连接，仅需一行代码。

### 官方网站
- 主站：[https://mcp.composio.dev/](https://mcp.composio.dev/)
- 文档：[https://docs.composio.dev/mcp/](https://docs.composio.dev/mcp/)

## 核心特性

### 🔧 统一 API 接口
- 通过单一、一致的 API 协议访问多个服务
- 支持 250+ 预构建工具和服务
- 20,000+ 预构建 API 操作

### 🔐 内置认证支持
- OAuth 2.0
- API 密钥
- JWT (JSON Web Tokens)
- 基本认证 (Basic Auth)
- 无需创建自己的登录系统

### ⚡ 全托管服务器
- 消除复杂设置的需要
- 自动处理基础设施
- 高可用性和可扩展性
- 实时状态监控：[status.composio.dev](https://status.composio.dev/)

### 🎯 高精度工具调用
- AI 代理与集成应用的流畅交互
- 减少停机时间
- 更少的维护问题

## 系统架构

### MCP 架构组件

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP 主机       │    │   MCP 客户端     │    │   MCP 服务器     │
│ (Claude/Cursor)  │◄──►│   (协议桥接)     │◄──►│  (Composio)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   外部服务       │
                                               │ (Gmail/Slack/   │
                                               │  GitHub/...)    │
                                               └─────────────────┘
```

### 核心组件说明

1. **MCP 主机 (Hosts)**: 需要访问外部数据或工具的应用程序
   - Claude Desktop
   - Cursor IDE
   - Windsurf
   - 其他 AI 驱动的应用

2. **MCP 客户端 (Clients)**: 维护与 MCP 服务器的一对一连接的协议客户端

3. **MCP 服务器 (Servers)**: 通过 MCP 暴露特定功能的轻量级服务器
   - 连接到本地或远程数据源
   - 提供标准化的工具和资源接口

4. **传输层**:
   - **Stdio 传输**: 用于本地运行的服务器
   - **SSE (Server-Sent Events)**: 用于远程部署的服务器

## 快速开始

### 前置要求

- **Node.js 16+** (确保 `npx` 可用)
- **Composio API 密钥** (从 [Composio Dashboard](https://app.composio.dev/) 获取)
- 支持的 MCP 客户端 (Cursor/Claude/Windsurf)

### 5 步快速集成

#### 步骤 1: 访问 Composio MCP 网站
前往 [https://mcp.composio.dev/](https://mcp.composio.dev/)

#### 步骤 2: 选择所需工具
- 浏览可用的 MCP 服务器列表
- 选择你需要的工具/服务器
- 查看工具描述和兼容性

#### 步骤 3: 生成安装命令
- 在选定工具页面的"Installation Steps"部分点击"Generate"
- 复制生成的 URL（包含私有信息）
- 查看"Available Actions"部分了解所有可用功能

#### 步骤 4: 配置客户端
##### 对于 Cursor:
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/[tool]/[your-private-key]" --client cursor
```

##### 对于其他客户端:
- **类型**: 选择 "sse"
- **服务器 URL**: 粘贴复制的 URL

#### 步骤 5: 测试集成
在客户端中测试功能，例如：
```
发送邮件到 test@example.com，主题为"MCP 测试"
```

## 支持的客户端

### Cursor IDE
- **平台**: Windows, macOS, Linux
- **配置路径**: `File → Preferences → Cursor Settings → MCP → Add New Server`
- **命令面板**: `Ctrl + Shift + P` → 搜索 "cursor settings"

### Claude Desktop
- **平台**: macOS
- **配置**: 通过配置文件设置

### Windsurf
- **平台**: macOS, Linux
- **注意**: Windows 支持即将推出

### 其他兼容客户端
- OpenAI Agents SDK
- 自定义 MCP 客户端

## 安装配置

### 方法 1: 使用 npx 命令 (推荐)

```bash
# 通用安装命令格式
npx @composio/mcp@latest setup "https://mcp.composio.dev/[service]/[api-key]" --client [client-name]

# 示例：安装 Gmail MCP 服务器到 Cursor
npx @composio/mcp@latest setup "https://mcp.composio.dev/gmail/your-api-key-here" --client cursor

# 示例：安装 Linear MCP 服务器到 Cursor
npx @composio/mcp@latest setup "https://mcp.composio.dev/linear/your-api-key-here" --client cursor
```

### 方法 2: 手动配置

#### Cursor 手动配置
1. 打开 Cursor
2. 使用 `Ctrl + Shift + P` 打开命令面板
3. 搜索 "cursor settings"
4. 在侧边栏找到 MCP 选项
5. 点击 "Add New Server"
6. 填写配置：
   - **名称**: 自定义服务器名称
   - **类型**: `sse`
   - **URL**: 从 Composio 生成的 SSE URL

#### 配置文件位置选择

你可以将配置放在两个位置之一：

1. **项目特定配置**: 在项目目录中创建 `.cursorrules` 文件
   ```json
   {
     "mcp": {
       "servers": {
         "composio-gmail": {
           "command": "npx",
           "args": ["@composio/mcp@latest", "server", "--url", "your-sse-url"]
         }
       }
     }
   }
   ```

2. **全局配置**: 在用户配置目录中设置全局 MCP 服务器

## 认证设置

### 认证方式

Composio MCP 支持多种认证方式：

#### 1. OAuth 2.0 (推荐)
```bash
# 启动带 OAuth 的服务器
npx @composio/mcp@latest setup "https://mcp.composio.dev/gmail/oauth-key" --client cursor
```

认证流程：
1. 在客户端中发起连接："create a connection with Gmail"
2. 系统生成认证 URL
3. 在浏览器中完成 OAuth 流程
4. 返回客户端确认连接状态

#### 2. API 密钥
```bash
# 使用 API 密钥的服务器
npx @composio/mcp@latest setup "https://mcp.composio.dev/github/api-key-here" --client cursor
```

#### 3. JWT 令牌
适用于企业级集成和自定义认证系统。

#### 4. 基本认证
用于简单的用户名/密码认证场景。

### 高级认证配置

#### 包含 Composio 辅助操作
```bash
# 启用辅助操作，让代理引导用户完成认证
npx @composio/mcp@latest setup "https://mcp.composio.dev/slack/key?include_composio_helper_actions=true" --client cursor
```

#### 自定义认证体验
- 提供自己的 OAuth 凭据
- 自定义同意屏幕
- 品牌化认证流程

更多详细信息：
- [集成设置指南](https://docs.composio.dev/auth/set-up-integrations)
- [白标化指南](https://docs.composio.dev/auth/white-labelling)

## 常用集成示例

### 1. Gmail 集成

#### 安装
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/gmail/your-key" --client cursor
```

#### 使用示例
```
# 发送邮件
发送邮件到 john@example.com，主题为"会议安排"，内容为"明天下午2点会议室A见面"

# 搜索邮件
搜索来自 boss@company.com 的邮件

# 创建草稿
创建一封邮件草稿，收件人是 team@company.com，主题是"周报总结"
```

#### 可用功能
- 发送邮件
- 获取附件
- 创建邮件草稿
- 修改线程标签
- 回复邮件线程
- 获取联系人
- 删除消息
- 移至垃圾箱
- 搜索联系人

### 2. Linear 项目管理集成

#### 安装
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/linear/your-key" --client cursor
```

#### 使用示例
```
# 创建任务
在 Linear 中创建一个新任务："优化登录页面性能"，优先级为高

# 更新任务状态
将任务 #123 的状态更新为"进行中"

# 搜索问题
搜索标签为"bug"的所有 Linear 问题
```

### 3. Slack 集成

#### 安装
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/slack/your-key" --client cursor
```

#### 使用示例
```
# 发送消息
在 #general 频道发送消息："项目部署完成"

# 创建频道
创建一个名为"新项目讨论"的新 Slack 频道

# 搜索消息
搜索包含"部署"关键词的消息
```

### 4. GitHub 集成

#### 安装
```bash
npx @composio/mcp@latest setup "https://mcp.composio.dev/github/your-key" --client cursor
```

#### 使用示例
```
# 创建仓库
创建一个名为"新项目"的公共 GitHub 仓库

# 创建 Issue
在 my-repo 中创建一个 Issue："修复登录 bug"

# 创建 Pull Request
为 feature-branch 创建一个 PR 到 main 分支
```

### 5. 多服务器综合使用案例

#### 场景：项目管理工作流
```
# 从 Linear 创建任务并同步到 Slack
1. 在 Linear 中创建高优先级任务："网站性能优化"
2. 在 #dev-team Slack 频道通知团队新任务已创建
3. 发送邮件给项目经理，包含任务详情
```

## 高级用法

### 创建自定义 MCP 服务器

#### 基本服务器结构
```python
# Python 示例
from mcp import McpServer, Tool, Resource
import asyncio

# 创建服务器实例
server = McpServer("my-custom-server")

# 定义工具
@server.tool("calculate_sum")
async def calculate_sum(a: int, b: int) -> int:
    """计算两个数的和"""
    return a + b

# 定义资源
@server.resource("user_preferences")
async def get_user_preferences() -> str:
    """获取用户偏好设置"""
    return "用户偏好数据"

# 启动服务器
if __name__ == "__main__":
    server.run()
```

#### TypeScript 示例
```typescript
import { McpServer } from '@mcp/server';

const server = new McpServer('my-ts-server');

// 注册工具
server.registerTool({
  name: 'get_weather',
  description: '获取天气信息',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: '城市名称' }
    },
    required: ['city']
  },
  handler: async (params) => {
    const { city } = params;
    // 实现天气查询逻辑
    return `${city} 的天气是晴天`;
  }
});

server.start();
```

### MCP Inspector 调试工具

MCP Inspector 是一个 GUI 工具，用于测试自定义 MCP 服务器而无需集成到 LLM/AI 代理中。

#### 安装和使用
```bash
# 安装 MCP Inspector
npm install -g @mcp/inspector

# 启动 Inspector
mcp-inspector

# 连接到你的服务器
# 访问显示的 localhost URL
```

#### 调试步骤
1. 启动你的 MCP 服务器
2. 在 Inspector 中连接到服务器
3. 测试资源功能
4. 测试工具调用
5. 验证响应格式

## 故障排除

### 常见问题和解决方案

#### 1. 连接失败
**问题**: 无法连接到 MCP 服务器

**解决方案**:
```bash
# 检查 Node.js 版本
node --version  # 应该是 16+

# 检查 npx 是否可用
npx --version

# 重新安装服务器
npx @composio/mcp@latest setup "your-url" --client cursor --force

# 重启电脑（如果仍然无法连接）
```

#### 2. 认证失败
**问题**: OAuth 认证流程失败

**解决方案**:
```bash
# 检查 API 密钥是否有效
curl -H "Authorization: Bearer your-api-key" https://api.composio.dev/v1/auth/verify

# 重新生成认证 URL
# 在客户端中执行: "create a connection with [service-name]"

# 清除缓存的认证信息
rm -rf ~/.composio/cache
```

#### 3. 工具调用失败
**问题**: AI 代理无法正确调用 MCP 工具

**解决方案**:
```bash
# 检查服务器状态
curl https://status.composio.dev/api/v2/status.json

# 验证工具权限
# 确保在 Composio Dashboard 中启用了所需的权限

# 测试工具是否在列表中
# 在客户端问: "列出所有可用的工具"
```

## 最佳实践

### 1. 安全性最佳实践

#### API 密钥管理
```bash
# 使用环境变量存储敏感信息
export COMPOSIO_API_KEY="your-key"
export GMAIL_CLIENT_SECRET="your-secret"

# 不要在代码中硬编码密钥
# ❌ 错误做法
# const apiKey = "sk-1234567890abcdef"

# ✅ 正确做法
const apiKey = process.env.COMPOSIO_API_KEY;
```

#### 权限最小化原则
```json
{
  "permissions": {
    "gmail": ["read", "send"],
    "linear": ["read", "create_issue"]
  }
}
```

### 2. 性能优化

#### 缓存策略
```bash
# 启用本地缓存
export MCP_CACHE_TTL=3600  # 1小时缓存

# 使用连接池
export MCP_CONNECTION_POOL_SIZE=10
```

### 3. 错误处理

#### 健壮的错误处理
```python
import asyncio
from typing import Optional

async def safe_mcp_call(tool_name: str, params: dict) -> Optional[dict]:
    """安全的 MCP 工具调用，包含重试机制"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            result = await mcp_client.call_tool(tool_name, params)
            return result
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"MCP call failed after {max_retries} attempts: {e}")
                return None
            await asyncio.sleep(2 ** attempt)  # 指数退避
```

## 支持的服务列表

### 通信工具
- **Slack** - 消息发送、频道管理、文件共享
- **Discord** - 服务器管理、消息操作
- **Microsoft Teams** - 团队协作、会议安排
- **Telegram** - 机器人集成、消息处理

### 邮件服务
- **Gmail** - 邮件发送、搜索、标签管理
- **Outlook** - 邮件处理、日历集成
- **SendGrid** - 批量邮件发送
- **Mailgun** - 邮件 API 服务

### 项目管理
- **Linear** - 问题跟踪、项目管理
- **Jira** - 工作流管理、bug 追踪
- **Asana** - 任务管理、团队协作
- **Trello** - 看板管理、卡片操作
- **Monday.com** - 工作操作系统
- **ClickUp** - 一体化工作空间

### 开发工具
- **GitHub** - 代码仓库、PR 管理、Issue 跟踪
- **GitLab** - DevOps 平台、CI/CD
- **Bitbucket** - 代码协作、管道管理
- **Docker Hub** - 容器镜像管理

### 文档和知识管理
- **Notion** - 笔记、数据库、团队空间
- **Confluence** - 团队文档、知识库
- **Google Docs** - 文档协作、实时编辑
- **Obsidian** - 个人知识管理

## 相关资源

### 官方文档
- [Composio MCP 官方文档](https://docs.composio.dev/mcp/)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)
- [Anthropic MCP 介绍](https://www.anthropic.com/news/model-context-protocol)

### 社区资源
- [GitHub 仓库](https://github.com/composiohq/composio)
- [Discord 社区](https://discord.gg/composio)
- [Slack 频道](https://composio.dev/slack)

### 教程和示例
- [MCP 服务器从零构建指南](https://composio.dev/blog/mcp-server-step-by-step-guide-to-building-from-scrtch/)
- [MCP 客户端构建指南](https://composio.dev/blog/mcp-client-step-by-step-guide-to-building-from-scratch/)
- [Cursor 连接 100+ MCP 服务器](https://composio.dev/blog/how-to-connect-cursor-to-100-mcp-servers-within-minutes/)

## 常见问题 (FAQ)

### Q: MCP 与传统 API 集成有什么区别？
**A**: MCP 提供标准化接口，支持双向通信和动态操作，而传统 API 需要为每个服务单独编写集成代码。

### Q: Composio MCP 支持哪些认证方式？
**A**: 支持 OAuth 2.0、API 密钥、JWT 和基本认证。推荐使用 OAuth 2.0。

### Q: 如何处理 MCP 服务器的限流？
**A**: 实施指数退避重试、使用连接池、启用缓存，并监控 API 使用情况。

### Q: 可以同时连接多个 MCP 服务器吗？
**A**: 是的，大多数 MCP 客户端支持同时连接多个服务器。

## 结语

Composio MCP 为 AI 代理与外部工具的集成提供了强大而灵活的解决方案。通过标准化的协议和全托管的服务，开发者可以专注于构建创新的 AI 应用。

**开始你的 MCP 之旅**：
1. 访问 [https://mcp.composio.dev/](https://mcp.composio.dev/)
2. 选择你需要的工具
3. 按照本指南进行配置
4. 开始构建令人惊叹的 AI 应用！

---

*本文档持续更新中，如有问题或建议，请访问 [GitHub Issues](https://github.com/Joseph19820124/mcp-composio/issues)*