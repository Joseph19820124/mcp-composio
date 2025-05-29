# MCP Composio 配置示例

这个目录包含了各种 MCP 客户端的配置示例和最佳实践。

## 文件结构

```
examples/
├── cursor/
│   ├── mcp-config.json         # Cursor MCP 配置示例
│   └── project-specific.json   # 项目特定配置
├── claude/
│   └── claude_desktop_config.json  # Claude Desktop 配置
├── windsurf/
│   └── windsurf-config.json    # Windsurf 配置示例
├── scripts/
│   ├── setup.sh               # 自动化设置脚本
│   └── health-check.js        # 健康检查脚本
└── docker/
    └── docker-compose.yml     # Docker 部署示例
```

## 快速开始

1. 选择你使用的客户端目录
2. 复制对应的配置文件
3. 根据你的需求修改配置
4. 运行设置脚本进行验证

## 注意事项

- 确保将 `your-api-key-here` 替换为实际的 API 密钥
- 根据你的具体需求调整权限和工具配置
- 定期检查配置文件的有效性