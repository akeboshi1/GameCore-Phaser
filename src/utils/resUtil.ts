export const HTTP_REGEX = /^(http|https):/i;
export class Url {
    // cdn资源路径
    OSD_PATH = "";
    // 本地资源路径
    RES_PATH: string = "";
    RESUI_PATH: string = "";
    RESOURCE_ROOT: string = "";
    init(config) {
        // { osd: this.mConfig.osd, res: `resources/`, resUI: `resources/ui/` }
        this.OSD_PATH = config.osd;
        this.RES_PATH = config.res;
        this.RESUI_PATH = config.resUI;
    }
    //  REQUIRE_CONTEXT;
    getRes(value: string): string {
        return this.RES_PATH + value;
    }

    getUIRes(dpr: number, value: string): string {
        return this.RESUI_PATH + `${dpr}x/${value}`;
    }

    getSound(key: string): string {
        return "sound/" + key + ".mp3";
    }

    getNormalUIRes(value: string) {
        return this.RESUI_PATH + value;
    }

    getOsdRes(value: string): string {
        if (!value) {
            // tslint:disable-next-line:no-console
            console.warn("splicing url failed");
            return;
        }
        if (this.OSD_PATH) {
            return this.OSD_PATH + value;
        }
        return value;
    }

    getPartName(value: string): string {
        return value + "_png";
    }
    getPartUrl(value: string): string {
        return this.OSD_PATH + "avatar/part/" + value + ".png";
    }
    getUsrAvatarTextureUrls(value: string): { img: string, json: string } {
        return {
            img: this.OSD_PATH + "user_avatar/texture/" + value + ".png",
            json: this.OSD_PATH + "user_avatar/texture/" + value + ".json"
        };
    }
    getGameConfig(value: string): string {
        if (HTTP_REGEX.test(value)) {
            return value;
        }
        return this.OSD_PATH + value;
    }

    getResRoot(value: string): string {
        if (this.OSD_PATH) return this.OSD_PATH + "/" + value;
        return value;
    }
}
