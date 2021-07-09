export class LocalStorageManager {
  constructor() {
  }
  setItem(key, value) {
    localStorage.setItem(key, value);
  }
  removeItem(key) {
    localStorage.removeItem(key);
  }
  getItem(key) {
    return localStorage.getItem(key);
  }
  clear() {
    localStorage.clear();
  }
  destroy() {
    this.clear();
  }
}
