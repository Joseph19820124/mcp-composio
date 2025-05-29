#!/usr/bin/env node

/**
 * Composio MCP 健康检查脚本
 * 用于验证 MCP 服务器连接和功能
 */

const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[✓]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[⚠]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[✗]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

class MCPHealthChecker {
  constructor() {
    this.results = {
      environment: [],
      connectivity: [],
      services: []
    };
  }

  async checkEnvironment() {
    log.title('🔍 环境检查');
    
    // 检查 Node.js
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      
      if (majorVersion >= 16) {
        log.success(`Node.js 版本: ${version}`);
        this.results.environment.push({ check: 'Node.js', status: 'pass', details: version });
      } else {
        log.error(`Node.js 版本过低: ${version} (需要 16+)`);
        this.results.environment.push({ check: 'Node.js', status: 'fail', details: `${version} < 16.0.0` });
      }
    } catch (error) {
      log.error('Node.js 未安装');
      this.results.environment.push({ check: 'Node.js', status: 'fail', details: 'Not installed' });
    }

    // 检查 npm
    try {
      const { stdout } = await execAsync('npm --version');
      log.success(`npm 版本: ${stdout.trim()}`);
      this.results.environment.push({ check: 'npm', status: 'pass', details: stdout.trim() });
    } catch (error) {
      log.error('npm 未安装');
      this.results.environment.push({ check: 'npm', status: 'fail', details: 'Not installed' });
    }

    // 检查 npx
    try {
      await execAsync('npx --version');
      log.success('npx 可用');
      this.results.environment.push({ check: 'npx', status: 'pass', details: 'Available' });
    } catch (error) {
      log.error('npx 不可用');
      this.results.environment.push({ check: 'npx', status: 'fail', details: 'Not available' });
    }

    // 检查环境变量
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (apiKey) {
      log.success('COMPOSIO_API_KEY 环境变量已设置');
      this.results.environment.push({ check: 'API Key', status: 'pass', details: 'Set' });
    } else {
      log.warning('COMPOSIO_API_KEY 环境变量未设置');
      this.results.environment.push({ check: 'API Key', status: 'warning', details: 'Not set' });
    }
  }

  async checkConnectivity() {
    log.title('🌐 网络连接检查');
    
    const endpoints = [
      { name: 'Composio MCP', url: 'mcp.composio.dev' },
      { name: 'Composio API', url: 'api.composio.dev' },
      { name: 'Composio Status', url: 'status.composio.dev' }
    ];

    for (const endpoint of endpoints) {
      try {
        await this.checkEndpoint(endpoint.url);
        log.success(`${endpoint.name} 连接正常`);
        this.results.connectivity.push({ endpoint: endpoint.name, status: 'pass', url: endpoint.url });
      } catch (error) {
        log.error(`${endpoint.name} 连接失败: ${error.message}`);
        this.results.connectivity.push({ endpoint: endpoint.name, status: 'fail', url: endpoint.url, error: error.message });
      }
    }
  }

  checkEndpoint(hostname) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        port: 443,
        path: '/',
        method: 'HEAD',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        resolve(res.statusCode);
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.setTimeout(5000);
      req.end();
    });
  }

  async checkComposioServices() {
    log.title('🔧 Composio 服务检查');
    
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
      log.warning('跳过服务检查：未设置 COMPOSIO_API_KEY');
      return;
    }

    try {
      // 检查 API 认证
      const authStatus = await this.checkAPIAuth(apiKey);
      if (authStatus) {
        log.success('API 认证成功');
        this.results.services.push({ service: 'Authentication', status: 'pass' });
      } else {
        log.error('API 认证失败');
        this.results.services.push({ service: 'Authentication', status: 'fail' });
      }

      // 检查可用服务
      log.info('获取可用服务列表...');
      // 这里可以添加更多服务检查逻辑
      
    } catch (error) {
      log.error(`服务检查失败: ${error.message}`);
      this.results.services.push({ service: 'General', status: 'fail', error: error.message });
    }
  }

  checkAPIAuth(apiKey) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.composio.dev',
        port: 443,
        path: '/v1/auth/verify',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.setTimeout(10000);
      req.end();
    });
  }

  async checkMCPInstallation() {
    log.title('📦 MCP 安装检查');
    
    try {
      // 检查 @composio/mcp 包
      const { stdout } = await execAsync('npm list -g @composio/mcp 2>/dev/null || echo "not installed"');
      if (stdout.includes('not installed')) {
        log.warning('@composio/mcp 全局包未安装');
        this.results.environment.push({ check: 'MCP Package', status: 'warning', details: 'Not globally installed' });
      } else {
        log.success('@composio/mcp 包已安装');
        this.results.environment.push({ check: 'MCP Package', status: 'pass', details: 'Installed' });
      }
    } catch (error) {
      log.warning('无法检查 MCP 包安装状态');
    }

    // 检查 MCP 命令可用性
    try {
      await execAsync('npx @composio/mcp@latest --help');
      log.success('MCP 命令行工具可用');
      this.results.environment.push({ check: 'MCP CLI', status: 'pass', details: 'Available' });
    } catch (error) {
      log.error('MCP 命令行工具不可用');
      this.results.environment.push({ check: 'MCP CLI', status: 'fail', details: 'Not available' });
    }
  }

  generateReport() {
    log.title('📊 健康检查报告');
    
    const categories = [
      { name: '环境检查', results: this.results.environment },
      { name: '网络连接', results: this.results.connectivity },
      { name: '服务状态', results: this.results.services }
    ];

    categories.forEach(category => {
      if (category.results.length === 0) return;
      
      console.log(`\n${colors.bright}${category.name}:${colors.reset}`);
      category.results.forEach(result => {
        const status = result.status === 'pass' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
        const color = result.status === 'pass' ? colors.green : result.status === 'warning' ? colors.yellow : colors.red;
        const name = result.check || result.endpoint || result.service || 'Unknown';
        console.log(`  ${color}${status}${colors.reset} ${name}`);
        if (result.details) {
          console.log(`    ${colors.cyan}详情: ${result.details}${colors.reset}`);
        }
        if (result.error) {
          console.log(`    ${colors.red}错误: ${result.error}${colors.reset}`);
        }
      });
    });

    // 总结
    const totalChecks = this.results.environment.length + this.results.connectivity.length + this.results.services.length;
    const passedChecks = [...this.results.environment, ...this.results.connectivity, ...this.results.services]
      .filter(r => r.status === 'pass').length;
    const warningChecks = [...this.results.environment, ...this.results.connectivity, ...this.results.services]
      .filter(r => r.status === 'warning').length;
    const failedChecks = totalChecks - passedChecks - warningChecks;

    console.log(`\n${colors.bright}总结:${colors.reset}`);
    console.log(`  ${colors.green}✓ 通过: ${passedChecks}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ 警告: ${warningChecks}${colors.reset}`);
    console.log(`  ${colors.red}✗ 失败: ${failedChecks}${colors.reset}`);
    
    if (failedChecks === 0 && warningChecks === 0) {
      log.success('所有检查通过! 🎉');
    } else if (failedChecks === 0) {
      log.warning('基本功能正常，但有一些警告项目');
    } else {
      log.error('发现问题，请检查失败的项目');
    }
  }

  async run() {
    console.log(`${colors.bright}${colors.magenta}🔍 Composio MCP 健康检查${colors.reset}`);
    console.log('正在检查您的 MCP 环境配置...\n');

    try {
      await this.checkEnvironment();
      await this.checkMCPInstallation();
      await this.checkConnectivity();
      await this.checkComposioServices();
      this.generateReport();
    } catch (error) {
      log.error(`健康检查过程中出现错误: ${error.message}`);
      process.exit(1);
    }
  }
}

// 主函数
if (require.main === module) {
  const checker = new MCPHealthChecker();
  checker.run().catch(error => {
    console.error('检查过程中出现未捕获的错误:', error);
    process.exit(1);
  });
}

module.exports = MCPHealthChecker;
