/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */
import * as path from "path";
import {GameConfig} from "./GameConfig";
export namespace Atlases {
    export class AtlasesPreloadSpritesArray {
        static getName(): string {
            return "preload_sprites_array";
        }

        static getJSONArray(): string {
            return require("assets/atlases/preload_sprites_array.json");
        }

        static getPNG(): string {
            return require("assets/atlases/preload_sprites_array.png");
        }
    }

    export namespace AtlasesPreloadSpritesArray {
        export enum Frames {
            PreloadBar = "preload_bar.png",
            PreloadFrame = "preload_frame.png",
        }
    }
}

export namespace Images {
    export class ImagesTile {
        static getName(type: string): string {
            return "tile_" + type + "_png";
        }

        static getPNG(type: string): string {
            return `${path.resolve(GameConfig.HomeDir , `.pixelpai/${GameConfig.UserName}terrains/${type}/${type}.png`)}`;
        }

        static getJSONArray(type: string): string {
            return `${path.resolve(GameConfig.HomeDir, `.pixelpai/${GameConfig.UserName}/terrains/${type}/${type}.json`)}`;
        }
    }

    export class ImagesElement {
        static getName(id: string): string {
            return "element_" + id + "_png";
        }

        static getPNG(id: string): string {
          return `${path.resolve(GameConfig.HomeDir , `.pixelpai/${GameConfig.UserName}/elements/${id}/${id}.png`)}`;
        }

        static getJSONArray(id: string): string {
          return `${path.resolve(GameConfig.HomeDir, `.pixelpai/${GameConfig.UserName}/elements/${id}/${id}.json`)}`;
        }
    }
}

export namespace Avatar {
    export class AvatarBone {
        static getSkeName(avatarId: string): string {
            return avatarId + "_dbbin";
        }

        static getSkeUrl(avatarId: string): string {
            return require("assets/avatar/" + avatarId + ".dbbin");
        }

        static getPartName(value: string): string {
            return value + "_png";
        }

        static getPartUrl(value: string): string {
            return require("assets/avatar/part/" + value + ".png");
        }
    }
}

export namespace Sound {
    export class BgSound {
        static getName(id: number): string {
            return "bg_sound_" + id + "_mp3";
        }

        static getUrl(id: number): string {
            return require("assets/sound/bg/" + id + ".mp3");
        }
    }

    export class GameSound {
        static getName(id: number): string {
            return "game_sound" + id + "_mp3";
        }

        static getUrl(id: number): string {
            return require("assets/sound/game/" + id + ".mp3");
        }
    }
}

export namespace UI {
    export class SpriteSheetsBlueBtn {
        static getName(): string {
            return "ui_btn_bule_sprite_sheet_png";
        }

        static getPNG(): string {
            return require("assets/spritesheets/btn_bule_sprite_sheet.png");
        }

        static getFrameWidth(): number {
            return 193;
        }

        static getFrameHeight(): number {
            return 71;
        }

        static getFrameMax(): number {
            return 3;
        }
    }

    export class SpriteSheetsCloseBtn {
        static getName(): string {
            return "ui_btn_close_sprite_sheet_png";
        }

        static getPNG(): string {
            return require("assets/spritesheets/btn_close_sprite_sheet.png");
        }

        static getFrameWidth(): number {
            return 118;
        }

        static getFrameHeight(): number {
            return 120;
        }

        static getFrameMax(): number {
            return 3;
        }
    }


    export class ImageMenuBag {
        static getName(): string {
            return "ui_menu_bag_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/menu_bag.png");
        }
    }

    export class ImageBg {
        static getName(): string {
            return "ui_background_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/background.png");
        }
    }
}

