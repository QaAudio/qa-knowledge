import {
  createWriteStream,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { chmod, unlink } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import {
  EMBEDDED_QDRANT_HOST,
  EMBEDDED_QDRANT_HTTP_PORT,
  EMBEDDED_QDRANT_GRPC_PORT,
  EMBEDDED_QDRANT_REST_URL,
  qdrantBinaryPath,
  qdrantLockPath,
  qdrantLogPath,
  qdrantPidPath,
  qdrantStoragePath,
  resolveQdrantDataDir,
} from "./paths.js";

const READY_POLL_MS = 250;
const READY_TIMEOUT_MS = 30_000;
const LOCK_STALE_MS = 60_000;

let supervisedChild: ChildProcess | null = null;

export { EMBEDDED_QDRANT_REST_URL, EMBEDDED_QDRANT_GRPC_URL } from "./paths.js";
export {
  EMBEDDED_QDRANT_HOST,
  EMBEDDED_QDRANT_HTTP_PORT,
  EMBEDDED_QDRANT_GRPC_PORT,
  resolveQdrantDataDir,
  qdrantBinaryPath,
} from "./paths.js";

/** Actionable error when the Qdrant binary has not been provisioned. */
export class QdrantNotPreparedError extends Error {
  constructor(message = "Embedded Qdrant binary not found. Run: npm run qdrant:prepare") {
    super(message);
    this.name = "QdrantNotPreparedError";
  }
}

/**
 * Poll `GET /readyz` until Qdrant accepts connections.
 *
 * @example
 * await waitForQdrantReady();
 */
export async function waitForQdrantReady(
  baseUrl = EMBEDDED_QDRANT_REST_URL,
  timeoutMs = READY_TIMEOUT_MS,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isQdrantReady(baseUrl)) {
      return;
    }
    await sleep(READY_POLL_MS);
  }
  throw new Error(`Embedded Qdrant did not become ready within ${timeoutMs}ms (${baseUrl})`);
}

export async function isQdrantReady(baseUrl = EMBEDDED_QDRANT_REST_URL): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/readyz`, { signal: AbortSignal.timeout(2_000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Start embedded Qdrant if needed (idempotent). Safe to call from daemon, MCP, and CLI.
 *
 * @example
 * await ensureEmbeddedQdrant();
 */
export async function ensureEmbeddedQdrant(): Promise<void> {
  if (await isQdrantReady()) {
    return;
  }

  const dataDir = resolveQdrantDataDir();
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(path.dirname(qdrantBinaryPath(dataDir)), { recursive: true });
  mkdirSync(qdrantStoragePath(dataDir), { recursive: true });

  const lockPath = qdrantLockPath(dataDir);
  await withEnsureLock(lockPath, async () => {
    if (await isQdrantReady()) {
      return;
    }

    const binary = qdrantBinaryPath(dataDir);
    if (!existsSync(binary)) {
      throw new QdrantNotPreparedError();
    }

    await spawnEmbeddedQdrant(dataDir, binary);
    await waitForQdrantReady();
  });
}

/**
 * Stop the Qdrant process this Node process spawned (daemon shutdown).
 */
export async function stopEmbeddedQdrant(): Promise<void> {
  const dataDir = resolveQdrantDataDir();
  const pidPath = qdrantPidPath(dataDir);

  if (supervisedChild?.pid) {
    terminateProcess(supervisedChild.pid);
    supervisedChild = null;
  }

  if (existsSync(pidPath)) {
    const raw = readFileSync(pidPath, "utf8").trim();
    const pid = Number.parseInt(raw, 10);
    if (Number.isFinite(pid) && pid > 0) {
      terminateProcess(pid);
    }
    try {
      unlinkSync(pidPath);
    } catch {
      // already gone
    }
  }
}

async function withEnsureLock(lockPath: string, fn: () => Promise<void>): Promise<void> {
  if (isLockStale(lockPath)) {
    await unlink(lockPath).catch(() => {});
  }

  let fd: number | undefined;
  try {
    fd = openSync(lockPath, "wx");
    writeFileSync(fd, String(process.pid));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EEXIST") {
      if (await isQdrantReady()) {
        return;
      }
      await sleep(READY_POLL_MS);
      if (await isQdrantReady()) {
        return;
      }
      throw new Error("Another process is starting embedded Qdrant; retry shortly");
    }
    throw err;
  }

  try {
    await fn();
  } finally {
    if (fd !== undefined) {
      try {
        unlinkSync(lockPath);
      } catch {
        // ignore
      }
    }
  }
}

function isLockStale(lockPath: string): boolean {
  if (!existsSync(lockPath)) {
    return false;
  }
  try {
    const { mtimeMs } = statSync(lockPath);
    return Date.now() - mtimeMs > LOCK_STALE_MS && !existsSync(qdrantPidPath(resolveQdrantDataDir()));
  } catch {
    return true;
  }
}

async function spawnEmbeddedQdrant(dataDir: string, binary: string): Promise<void> {
  const logPath = qdrantLogPath(dataDir);
  const logFd = openSync(logPath, "a");
  const storagePath = qdrantStoragePath(dataDir);

  const child = spawn(binary, [], {
    cwd: dataDir,
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: {
      ...process.env,
      QDRANT__SERVICE__HOST: EMBEDDED_QDRANT_HOST,
      QDRANT__SERVICE__HTTP_PORT: String(EMBEDDED_QDRANT_HTTP_PORT),
      QDRANT__SERVICE__GRPC_PORT: String(EMBEDDED_QDRANT_GRPC_PORT),
      QDRANT__STORAGE__STORAGE_PATH: storagePath,
    },
  });

  child.unref();
  supervisedChild = child;

  if (!child.pid) {
    throw new Error("Failed to spawn embedded Qdrant (no pid)");
  }

  writeFileSync(qdrantPidPath(dataDir), String(child.pid));

  if (process.platform !== "win32") {
    await chmod(binary, 0o755).catch(() => {});
  }
}

function terminateProcess(pid: number): void {
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {
    // process may already be gone
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write a small marker file (used by prepare script smoke tests). */
export function writeProvisionMarker(dataDir: string, version: string): void {
  mkdirSync(dataDir, { recursive: true });
  const stream = createWriteStream(path.join(dataDir, "provision.json"));
  stream.write(JSON.stringify({ version, provisionedAt: new Date().toISOString() }, null, 2));
  stream.end();
}
