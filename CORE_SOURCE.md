# AiSwitch 核心源码保护 / Core Source Protection

[简体中文](#简体中文) | [English](#english)

## 简体中文

本仓库将核心应用源码保存为 AES-256-GCM 加密的 `.enc` 文件。明文源码路径
由 Git 忽略，仅在受信任的本地检出或 GitHub Actions 发版构建期间恢复。

### 本地配置

请将现有的 `.keys/core-source.key` 备份到安全的密码管理器。在新的受信任
设备上恢复该文件，然后运行：

```powershell
pnpm.cmd core:decrypt
```

修改任何受保护源码后，提交前必须刷新并校验加密副本：

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

切勿提交 `.keys/core-source.key`、将其内容打印到日志，或通过 Issue、
Pull Request 与聊天工具发送。GitHub Actions 通过仓库 Secret
`CORE_SOURCE_KEY` 接收相同的 base64 密钥。

此加密措施保护 GitHub 中存储的明文源码，但无法阻止有能力的攻击者逆向分析
已发布的桌面安装包。

---

## English

The repository stores core application source as AES-256-GCM encrypted `.enc`
files. Plaintext source paths are ignored by Git and are restored only in a
trusted local checkout or during the GitHub Actions release build.

### Local setup

Keep the existing `.keys/core-source.key` backed up in a secure password
manager. On a new trusted machine, restore that file and then run:

```powershell
pnpm.cmd core:decrypt
```

After changing any protected source file, refresh and verify the encrypted
copies before committing:

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

Never commit `.keys/core-source.key`, paste its value into logs, or send it in
an issue or pull request. GitHub Actions receives the same base64 key through
the `CORE_SOURCE_KEY` repository secret.

Encryption protects plaintext source stored in GitHub. It does not prevent a
determined attacker from reverse engineering a distributed desktop binary.
