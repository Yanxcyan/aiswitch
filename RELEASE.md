# AiSwitch 发版说明 / Release Guide

[简体中文](#简体中文) | [English](#english)

## 简体中文

仓库：https://github.com/Yanxcyan/aiswitch

### 用户如何更新

1. 打开 AiSwitch → **设置**
2. 点 **检查新版本**
3. 有新版本时确认 → 自动下载安装并重启

也可从发布页手动下载安装包：  
https://github.com/Yanxcyan/aiswitch/releases

---

### 维护者如何发布新版本

#### 1. 改版本号（三处保持一致）

- `package.json` → `"version": "0.1.1"`
- `src-tauri/tauri.conf.json` → `"version": "0.1.1"`
- `src-tauri/Cargo.toml` → `version = "0.1.1"`

#### 2. 加密并校验核心源码

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

仓库只上传 `src/app.js.enc` 和 `src-tauri/src/*.rs.enc`。明文核心源码只保留在本地，并已由 `.gitignore` 排除。

#### 2.1 签名 ChatGPT/MSIX 版本目录

首次部署时生成独立密钥（已有 `.keys/release-catalog-private.pem` 时不要重跑）：

```powershell
pnpm.cmd release-catalog:key
```

编辑根目录中被忽略的 `releases.json`：每次发布递增 `sequence`，更新 `issued_at`/`expires_at`，且有效期不得超过 45 天；随后签名：

```powershell
pnpm.cmd release-catalog:sign
```

把 `releases.json` 和逐字节对应的 `releases.json.sig` 一同上传到版本目录地址。签名后不得重新格式化 JSON。私钥只保存在 `.keys/` 和可靠的离线备份中；仓库内 `release_catalog.rs` 的公钥必须与 `.keys/release-catalog-public.hex` 一致。

#### 3. 只提交已确认的文件并打 tag

```bash
# 先用 git status 检查范围，再用 git add -- <已确认路径>
# 禁止使用 git add -A、git add . 或 git add --all
git commit -m "release: v0.1.1"
git push origin main
git tag v0.1.1
git push origin v0.1.1
```

#### 4. 等 GitHub Actions

推送 `v*` tag 后会自动：

1. 在 Windows 上打包 NSIS 安装包
2. 生成 `latest.json` 与签名
3. 创建 GitHub Release 并上传资源

查看进度：仓库 → Actions

#### 5. 首次配置（只需一次）

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

### 本地试打包

```powershell
# 需先设置签名私钥（PowerShell）
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content .keys/aiswitch.key -Raw
pnpm.cmd tauri:build
```

产物大致在：

- `src-tauri/target/release/bundle/nsis/*.exe`
- 同目录的 `*.sig` / updater 产物

---

## English

Repository: https://github.com/Yanxcyan/aiswitch

### Updating as a user

1. Open AiSwitch and go to **Settings**.
2. Select **Check for updates**.
3. Confirm the available update; AiSwitch downloads, installs, and restarts.

You can also download the installer manually from
https://github.com/Yanxcyan/aiswitch/releases.

### Publishing a release as a maintainer

#### 1. Update all three version fields

- `package.json` → `"version": "0.1.1"`
- `src-tauri/tauri.conf.json` → `"version": "0.1.1"`
- `src-tauri/Cargo.toml` → `version = "0.1.1"`

#### 2. Encrypt and verify protected source

```powershell
pnpm.cmd core:encrypt
pnpm.cmd core:verify
```

Only `src/app.js.enc` and `src-tauri/src/*.rs.enc` are uploaded. Plaintext core
source remains local and is excluded by `.gitignore`.

#### 2.1 Sign the ChatGPT/MSIX release catalog

Generate the independent key once (do not run this again when
`.keys/release-catalog-private.pem` already exists):

```powershell
pnpm.cmd release-catalog:key
```

For every catalog publication, increment `sequence`, update `issued_at` and
`expires_at` with a validity window no longer than 45 days, then run:

```powershell
pnpm.cmd release-catalog:sign
```

Publish `releases.json` and its byte-matched `releases.json.sig` together. Do
not reformat the JSON after signing. Keep the private key only in `.keys/` and
a trusted offline backup, and keep the public key in `release_catalog.rs`
aligned with `.keys/release-catalog-public.hex`.

#### 3. Commit only reviewed paths and create the tag

```bash
# Inspect git status, then run git add -- <reviewed paths> only.
# Never use git add -A, git add ., or git add --all.
git commit -m "release: v0.1.1"
git push origin main
git tag v0.1.1
git push origin v0.1.1
```

#### 4. Wait for GitHub Actions

Pushing a `v*` tag automatically:

1. Builds the Windows NSIS installer.
2. Generates `latest.json` and updater signatures.
3. Creates a GitHub Release and uploads its assets.

Track progress on the repository's **Actions** page.

#### 5. One-time repository configuration

Configure these repository Secrets under **Settings → Secrets and variables →
Actions**:

| Secret | Purpose |
|--------|---------|
| `CORE_SOURCE_KEY` | Base64 key from `.keys/core-source.key`, used to decrypt protected source before the build |
| `TAURI_SIGNING_PRIVATE_KEY` | Complete contents of `.keys/aiswitch.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Private-key password; it may be omitted when the key has no password |

> Store encryption and signing keys only in the local `.keys/` directory and
> GitHub Actions Secrets. Never commit them.
>
> Back up `.keys/core-source.key` in a trusted password manager. Losing it makes
> the uploaded protected source unrecoverable.
>
> Losing the updater signing key prevents existing clients from validating new
> updates; replacing it requires changing the public key and asking users to
> reinstall.

### Testing a local package

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content .keys/aiswitch.key -Raw
pnpm.cmd tauri:build
```

Expected output paths include:

- `src-tauri/target/release/bundle/nsis/*.exe`
- `*.sig` and updater artifacts in the same bundle directory
