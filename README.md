# AiSwitch

[简体中文](#简体中文) | [English](#english)

## 简体中文

AiSwitch 是一款 Windows 桌面工具，用于集中管理和切换 Codex、Claude Code
与 Gemini CLI 的 AI 服务商配置。

### 主要功能

- 管理多个 AI 服务商、API 地址、模型与凭据引用。
- 在 Codex、Claude Code 和 Gemini CLI 配置之间快速切换。
- 获取上游模型列表，并为 Claude 模型角色配置映射。
- 下载和安装 ChatGPT（Codex）Windows 客户端。
- 通过 GitHub Releases 检查、下载并安装 AiSwitch 更新。

### 下载与更新

从 [GitHub Releases](https://github.com/Yanxcyan/aiswitch/releases/latest)
下载最新的 `AiSwitch_*_x64-setup.exe`。已安装用户也可以在 AiSwitch 的
**设置 → 检查新版本** 中自动更新。

### 受保护的核心源码

公开仓库只保存经过 AES-256-GCM 加密的核心源码文件。明文源码与解密密钥
不会上传，因此普通公开检出无法直接构建应用。受信任的维护者需要从安全备份
恢复 `.keys/core-source.key`，然后执行：

```powershell
pnpm.cmd install
pnpm.cmd core:decrypt
pnpm.cmd tauri:dev
```

修改核心源码后，在提交前刷新并校验加密副本：

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

详细说明见 [核心源码保护](CORE_SOURCE.md) 和 [发版说明](RELEASE.md)。

### 安全提示

不要在 Issue、Pull Request、日志或截图中提交 API Key、签名私钥、
`CORE_SOURCE_KEY` 或 `.keys/` 中的任何内容。

---

## English

AiSwitch is a Windows desktop utility for managing and switching AI provider
configurations used by Codex, Claude Code, and Gemini CLI.

### Key features

- Manage multiple AI providers, API endpoints, models, and credential references.
- Switch configurations for Codex, Claude Code, and Gemini CLI quickly.
- Fetch upstream model lists and configure Claude model-role mappings.
- Download and install the ChatGPT (Codex) Windows client.
- Check, download, and install AiSwitch updates through GitHub Releases.

### Download and updates

Download the latest `AiSwitch_*_x64-setup.exe` from
[GitHub Releases](https://github.com/Yanxcyan/aiswitch/releases/latest).
Existing installations can also update from **Settings → Check for updates**
inside AiSwitch.

### Protected core source

The public repository stores core source files only as AES-256-GCM encrypted
artifacts. Plaintext source and decryption keys are not uploaded, so a regular
public checkout cannot build the application directly. Trusted maintainers must
restore `.keys/core-source.key` from secure backup and then run:

```powershell
pnpm.cmd install
pnpm.cmd core:decrypt
pnpm.cmd tauri:dev
```

After changing protected source, refresh and verify the encrypted copies before
committing:

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

See [Core Source Protection](CORE_SOURCE.md) and the
[Release Guide](RELEASE.md) for details.

### Security notice

Never include API keys, signing private keys, `CORE_SOURCE_KEY`, or anything
from `.keys/` in issues, pull requests, logs, or screenshots.
