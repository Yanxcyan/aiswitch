# AiSwitch 发版说明（GitHub Releases）

仓库：https://github.com/Yanxcyan/aiswitch

## 用户如何更新

1. 打开 AiSwitch → **设置**
2. 点 **检查新版本**
3. 有新版本时确认 → 自动下载安装并重启

也可从发布页手动下载安装包：  
https://github.com/Yanxcyan/aiswitch/releases

---

## 你如何发布新版本

### 1. 改版本号（三处保持一致）

- `package.json` → `"version": "0.1.1"`
- `src-tauri/tauri.conf.json` → `"version": "0.1.1"`
- `src-tauri/Cargo.toml` → `version = "0.1.1"`

### 2. 加密并校验核心源码

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

仓库只上传 `src/app.js.enc` 和 `src-tauri/src/*.rs.enc`。明文核心源码只保留在本地，并已由 `.gitignore` 排除。

### 3. 只提交已确认的文件并打 tag

```bash
# 先用 git status 检查范围，再用 git add -- <已确认路径>
# 禁止使用 git add -A、git add . 或 git add --all
git commit -m "release: v0.1.1"
git push origin main
git tag v0.1.1
git push origin v0.1.1
```

### 4. 等 GitHub Actions

推送 `v*` tag 后会自动：

1. 在 Windows 上打包 NSIS 安装包
2. 生成 `latest.json` 与签名
3. 创建 GitHub Release 并上传资源

查看进度：仓库 → Actions

### 5. 首次配置（只需一次）

仓库 Secrets（Settings → Secrets and variables → Actions）：

| Secret | 说明 |
|--------|------|
| `CORE_SOURCE_KEY` | `.keys/core-source.key` 的 base64 密钥，用于构建前解密核心源码 |
| `TAURI_SIGNING_PRIVATE_KEY` | `.keys/aiswitch.key` 文件全文 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码（当前为空可省略） |

> 加密密钥和签名私钥只保存在本地 `.keys/` 与 GitHub Actions Secrets，不要提交到 Git。  
> 请将 `.keys/core-source.key` 另行备份到可靠的密码管理器；丢失后无法解密已上传的核心源码。  
> 丢失私钥后旧客户端无法校验新签名，需要换公钥并让用户重装。

---

## 本地试打包

```bash
# 需先设置签名私钥（PowerShell）
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content .keys/aiswitch.key -Raw
pnpm tauri:build
```

产物大致在：

- `src-tauri/target/release/bundle/nsis/*.exe`
- 同目录的 `*.sig` / updater 产物
