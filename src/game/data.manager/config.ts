export const notice_url = `https://a.tooqing.com/picatown/announcement`;
export class ConfigPath {
    static ROOT_PATH = "/";
    static version: string;
    static getConfigPath() {
        return `${ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/.config.json`;
    }

    static getBasePath() {
        return `${ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/`;
    }
}
