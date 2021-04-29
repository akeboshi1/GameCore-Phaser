export let cdn_path = "/";
export const config_path = `/game/resource/alpha/5e719a0a68196e416ecf7aad/.config.json`;
export const base_path = `/game/resource/alpha/5e719a0a68196e416ecf7aad/`;

export const notice_url = `https://a.tooqing.com/picatown/announcement`;
export class ConfigPath {
    static ROOT_PATH = "/";

    static getConfigPath() {
        return `${ConfigPath.ROOT_PATH}game/resource/alpha/5e719a0a68196e416ecf7aad/.config.json`;
    }

    static getBasePath() {
        return `${ConfigPath.ROOT_PATH}game/resource/alpha/5e719a0a68196e416ecf7aad/`;
    }
}
