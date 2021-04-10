export declare class LocalStorageManager {
    constructor();
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    getItem(key: string): string;
    clear(): void;
    destroy(): void;
}
