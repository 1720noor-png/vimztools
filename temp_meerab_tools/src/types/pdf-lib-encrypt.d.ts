declare module 'pdf-lib-encrypt' {
  export interface LockOptions {
    algo?: 'aes256' | 'rc4'
    permissions?: number
  }

  export function configure(pdfLib: unknown): void
  export function lock(plainBytes: ArrayBuffer | Uint8Array, password: string, options?: LockOptions): Promise<Uint8Array>
  export function unlockInPlace<T extends { context: unknown }>(doc: T, password: string): Promise<boolean>
}