import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const manifestPath = path.join(scriptDir, 'core-files.json');
const localKeyPath = path.join(rootDir, '.keys', 'core-source.key');
const magic = Buffer.from('AISWCORE1', 'ascii');
const nonceLength = 12;
const tagLength = 16;

function fail(message) {
  console.error(`core-crypto: ${message}`);
  process.exitCode = 1;
}

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadManifest() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error('invalid core-files.json');
  }
  return manifest.files;
}

async function loadKey() {
  let encoded = process.env.CORE_SOURCE_KEY?.trim();
  if (!encoded && await exists(localKeyPath)) {
    encoded = (await readFile(localKeyPath, 'utf8')).trim();
  }
  if (!encoded) {
    throw new Error('CORE_SOURCE_KEY is missing; run `pnpm core:key` locally or configure the GitHub Actions secret');
  }
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encoded) {
    throw new Error('CORE_SOURCE_KEY must be exactly 32 random bytes encoded as canonical base64');
  }
  return key;
}

function encryptBuffer(plaintext, key) {
  const nonce = randomBytes(nonceLength);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([magic, nonce, tag, ciphertext]);
}

function decryptBuffer(payload, key) {
  const minimumLength = magic.length + nonceLength + tagLength;
  if (payload.length < minimumLength || !timingSafeEqual(payload.subarray(0, magic.length), magic)) {
    throw new Error('invalid encrypted file header');
  }
  const nonceStart = magic.length;
  const tagStart = nonceStart + nonceLength;
  const dataStart = tagStart + tagLength;
  const decipher = createDecipheriv('aes-256-gcm', key, payload.subarray(nonceStart, tagStart));
  decipher.setAuthTag(payload.subarray(tagStart, dataStart));
  return Buffer.concat([decipher.update(payload.subarray(dataStart)), decipher.final()]);
}

async function initKey() {
  if (await exists(localKeyPath)) {
    throw new Error(`refusing to replace existing key: ${path.relative(rootDir, localKeyPath)}`);
  }
  await mkdir(path.dirname(localKeyPath), { recursive: true });
  await writeFile(localKeyPath, `${randomBytes(32).toString('base64')}\n`, { mode: 0o600 });
  console.log(`Created ${path.relative(rootDir, localKeyPath)}. Back it up securely; losing it makes encrypted source unrecoverable.`);
}

async function encryptFiles() {
  const key = await loadKey();
  const files = await loadManifest();
  for (const relativePath of files) {
    const sourcePath = path.join(rootDir, relativePath);
    const plaintext = await readFile(sourcePath);
    await writeFile(`${sourcePath}.enc`, encryptBuffer(plaintext, key));
    console.log(`Encrypted ${relativePath}`);
  }
}

async function decryptFiles() {
  const key = await loadKey();
  const files = await loadManifest();
  for (const relativePath of files) {
    const sourcePath = path.join(rootDir, relativePath);
    const plaintext = decryptBuffer(await readFile(`${sourcePath}.enc`), key);
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, plaintext);
    console.log(`Decrypted ${relativePath}`);
  }
}

async function verifyFiles() {
  const key = await loadKey();
  const files = await loadManifest();
  for (const relativePath of files) {
    const sourcePath = path.join(rootDir, relativePath);
    const decrypted = decryptBuffer(await readFile(`${sourcePath}.enc`), key);
    if (await exists(sourcePath)) {
      const plaintext = await readFile(sourcePath);
      if (plaintext.length !== decrypted.length || !timingSafeEqual(plaintext, decrypted)) {
        throw new Error(`${relativePath}.enc does not match its local plaintext`);
      }
    }
    console.log(`Verified ${relativePath}.enc`);
  }
}

const command = process.argv[2];
try {
  if (command === 'init') await initKey();
  else if (command === 'encrypt') await encryptFiles();
  else if (command === 'decrypt') await decryptFiles();
  else if (command === 'verify') await verifyFiles();
  else fail('usage: node scripts/core-crypto.mjs <init|encrypt|decrypt|verify>');
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
