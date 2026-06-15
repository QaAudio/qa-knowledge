import os from "node:os";
import path from "node:path";

/** Loopback host for the embedded Qdrant instance. */
export const EMBEDDED_QDRANT_HOST = "127.0.0.1";

/** REST port (qa-knowledge, CLI). */
export const EMBEDDED_QDRANT_HTTP_PORT = 6433;

/** gRPC port (qa-library-mcp). */
export const EMBEDDED_QDRANT_GRPC_PORT = 6434;

/** REST URL used by @qdrant/js-client-rest. */
export const EMBEDDED_QDRANT_REST_URL = `http://${EMBEDDED_QDRANT_HOST}:${EMBEDDED_QDRANT_HTTP_PORT}`;

/** gRPC URL used by qa-library-mcp (qdrant-client). */
export const EMBEDDED_QDRANT_GRPC_URL = `http://${EMBEDDED_QDRANT_HOST}:${EMBEDDED_QDRANT_GRPC_PORT}`;

/** Electron userData candidates (primary first). Matches QuantumAgent daemon layout. */
export function electronUserDataCandidates(): string[] {
  const home = os.homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(home, "AppData", "Roaming");
    return [
      path.join(appData, "@quantumaudio", "quantum-agent"),
      path.join(appData, "QuantumAgent"),
    ];
  }
  if (process.platform === "darwin") {
    return [
      path.join(home, "Library", "Application Support", "@quantumaudio", "quantum-agent"),
      path.join(home, "Library", "Application Support", "QuantumAgent"),
    ];
  }
  return [
    path.join(home, ".config", "@quantumaudio", "quantum-agent"),
    path.join(home, ".config", "QuantumAgent"),
  ];
}

/**
 * Root for embedded Qdrant: binary, storage, pid/lock files.
 *
 * Override with `QA_QDRANT_DATA_DIR` (QuantumAgent daemon sets `{userData}/qdrant`).
 */
export function resolveQdrantDataDir(): string {
  const override = process.env.QA_QDRANT_DATA_DIR?.trim();
  if (override) {
    return path.resolve(override);
  }
  return path.join(electronUserDataCandidates()[0]!, "qdrant");
}

export function qdrantBinaryPath(dataDir = resolveQdrantDataDir()): string {
  const name = process.platform === "win32" ? "qdrant.exe" : "qdrant";
  return path.join(dataDir, "bin", name);
}

export function qdrantStoragePath(dataDir = resolveQdrantDataDir()): string {
  return path.join(dataDir, "storage");
}

export function qdrantLogPath(dataDir = resolveQdrantDataDir()): string {
  return path.join(dataDir, "qdrant.log");
}

export function qdrantPidPath(dataDir = resolveQdrantDataDir()): string {
  return path.join(dataDir, "qdrant.pid");
}

export function qdrantLockPath(dataDir = resolveQdrantDataDir()): string {
  return path.join(dataDir, ".ensure.lock");
}
