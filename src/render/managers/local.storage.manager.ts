export class LocalStorageManager {
    constructor() {
    }

    setItem(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    getItem(key: string) {
        return localStorage.getItem(key);
    }

    clear() {
        localStorage.clear();
    }
    destroy() {
       this.clear();
    }
}
