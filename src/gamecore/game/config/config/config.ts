export const notice_url = `https://a.tooqing.com/picatown/announcement`;
const HTTP_REGEX = /^(http|https):/i;
export class ConfigPath {
    static ROOT_PATH = "/";
    static version: string = "";

    static getConfigPath() {
        return `${ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/.config.json`;
    }

    static getBasePath() {
        return `${ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/`;
    }

    static getBaseVersionPath() {
        if (this.version === "") return undefined;
        return this.getBasePath() + this.version + "/";
    }

    static getSceneConfigUrl(url: string) {
        if (HTTP_REGEX.test(url)) {
            return url;
        }
        return `${this.ROOT_PATH}${url}`;
    }
}
