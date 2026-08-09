# Core source protection

The repository stores core application source as AES-256-GCM encrypted `.enc`
files. Plaintext source paths are ignored by Git and are restored only in a
trusted local checkout or during the GitHub Actions release build.

## Local setup

Keep the existing `.keys/core-source.key` backed up in a secure password
manager. On a new trusted machine, restore that file and then run:

```powershell
pnpm core:decrypt
```

After changing any protected source file, refresh and verify the encrypted
copies before committing:

```powershell
pnpm core:encrypt
pnpm core:verify
```

Never commit `.keys/core-source.key`, paste its value into logs, or send it in
an issue or pull request. GitHub Actions receives the same base64 key through
the `CORE_SOURCE_KEY` repository secret.

Encryption protects plaintext source stored in GitHub. It does not prevent a
determined attacker from reverse engineering a distributed desktop binary.
