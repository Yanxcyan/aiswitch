import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { generateKeyPairSync, sign, verify } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const privateKeyPath = path.join(rootDir, '.keys', 'provider-catalog-private.pem');
const publicKeyPath = path.join(rootDir, '.keys', 'provider-catalog-public.hex');
const catalogPath = path.join(rootDir, '.provider-catalog', 'providers.json');
const signaturePath = `${catalogPath}.sig`;

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function init() {
  if (await exists(privateKeyPath) || await exists(publicKeyPath)) {
    throw new Error('refusing to replace an existing provider-catalog signing key');
  }
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const privatePem = privateKey.export({ format: 'pem', type: 'pkcs8' });
  const publicDer = publicKey.export({ format: 'der', type: 'spki' });
  const publicRaw = publicDer.subarray(publicDer.length - 32);
  await mkdir(path.dirname(privateKeyPath), { recursive: true });
  await writeFile(privateKeyPath, privatePem, { mode: 0o600 });
  await writeFile(publicKeyPath, `${publicRaw.toString('hex')}\n`, { mode: 0o600 });
  console.log(`Created provider catalog signing key. Public key: ${publicRaw.toString('hex')}`);
}

async function signCatalog() {
  const [privatePem, publicHex, catalog] = await Promise.all([
    readFile(privateKeyPath, 'utf8'),
    readFile(publicKeyPath, 'utf8'),
    readFile(catalogPath),
  ]);
  const signature = sign(null, catalog, privatePem);
  const raw = Buffer.from(publicHex.trim(), 'hex');
  if (raw.length !== 32) throw new Error('public key must contain 32 bytes');
  const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
  const publicKey = { key: Buffer.concat([spkiPrefix, raw]), format: 'der', type: 'spki' };
  if (!verify(null, catalog, publicKey, signature)) {
    throw new Error('signature self-check failed');
  }
  await writeFile(signaturePath, `${signature.toString('base64')}\n`);
  console.log(`Signed ${path.relative(rootDir, catalogPath)} (${catalog.length} bytes).`);
}

const command = process.argv[2];
try {
  if (command === 'init') await init();
  else if (command === 'sign') await signCatalog();
  else throw new Error('usage: node scripts/provider-catalog-sign.mjs <init|sign>');
} catch (error) {
  console.error(`provider-catalog-sign: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
