/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */
import * as path from "path";
import {GameConfig} from "./GameConfig";
import {op_gameconfig} from "../protocol/protocols";

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

export namespace Display {
    export class AtlasUtil {
        static getKey(value: op_gameconfig.IDisplay): string {
            let keys = [];
            if (value.texturePath) {
                keys.push(value.texturePath);
            }
            if (value.dataPath) {
                keys.push(value.dataPath);
            }
            return keys.join("&");
        }

        static getRes(url: string): string {
            return `${path.resolve(GameConfig.HomeDir, url)}`;
        }
    }
}

export namespace Load {
    export class Image {
        static getKey(value: string): string {
            return value + "_png";
        }
    }

    export class Audio {
        static getKey(key: string): string {
            return key + "_mp3";
        }
    }

    export class Atlas {
        static getKey(key: string): string {
            return key + "_atlas";
        }
    }

    export class Nineslice {
        static getKey(key: string): string {
            return key + "_nineslice";
        }
    }
}

export namespace Images {
    export class Load {
        static getKey(key: string): string {
            return key + "_png";
        }
    }

    export class ImagesTile {
        static getName(id: number): string {
            return "tile_" + id + "_png";
        }

        static getPNG(id: number): string {
            return "assets/images/terrain/terrain_" + id + ".png";
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

    export class ProgressBg {
        static getName(): string {
            return "ui_progress_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/progress_bg.png");
        }
    }

    export class ProgressFill {
        static getName(): string {
            return "ui_progress_fill_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/progress_fill.png");
        }
    }

    export class DialogBg {
        static getName(): string {
            return "ui_dialog_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/dialog_bg.png");
        }
    }

    export class InputBg {
        static getName(): string {
            return "ui_input_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/input_bg.png");
        }
    }

    export class Button {
        static getName(): string {
            return "ui_button_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/button.png");
        }

        static getJSON(): string {
            return require("assets/images/ui/button.json");
        }
    }
}

