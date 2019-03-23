/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */
import {GameConfig} from "./GameConfig";
import * as path from "path";
import * as url from "url";

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

export namespace Load {
    export class Url {
        static getRes(value: string): string {
            if (GameConfig.isEditor) {
                return `${path.resolve(GameConfig.HomeDir, value)}`;
            } else {
                return `${url.resolve(GameConfig.HomeDir, value)}`;
            }
        }
    }


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

    export class Sheet {
        static getKey(key: string): string {
            return key + "_sheets";
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
            return Load.Url.getRes("avatar/part/" + value + ".png");
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

export namespace Font {
    export class NumsLatinUppercase {
        static getName(): string {
            return "NumsLatinUppercase_font";
        }

        static getUrl(): string {
            return require("assets/fonts/NumsLatinUppercase.png");
        }

        static getXml(): string {
            return require("assets/fonts/NumsLatinUppercase.xml");
        }
    }
}


export namespace UI {
    export class MenuBtBag {
        static getName(): string {
            return "bt_bag_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/bt_bag.png");
        }
    }

    export class VoteFlag {
        static getName(): string {
            return "vote_flag_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/Vote/Flag.png");
        }
    }

    export class VoteLight {
        static getName(): string {
            return "vote_light_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/Vote/Light.png");
        }
    }

    export class PageBt {
        static getName(): string {
            return "page_bt_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/page_bt.png");
        }

        static getWidth(): number {
            return 64;
        }

        static getHeight(): number {
            return 64;
        }
    }

    export class MenuItemBg {
        static getName(): string {
            return "menu_item_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/menu_item_bg.png");
        }
    }

    export class MenuItemOver {
        static getName(): string {
            return "menu_item_over_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/menu_item_over.png");
        }
    }

    export class ShortcutItemBg {
        static getName(): string {
            return "ui_item_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/item_shortcut_bg.png");
        }
    }

    export class ShortcutItemIcon {
        static getName(): string {
            return "item_shortcut_icon_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/item_shortcut_icon.png");
        }
    }

    export class BagTitle {
        static getName(): string {
            return "bag_title_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/bag/bag_title.png");
        }
    }

    export class EvidenceTitle {
        static getName(): string {
            return "evidence_title_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/bag/evidence_title.png");
        }
    }

    export class BagBg {
        static getName(): string {
            return "bag_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/bag/bag_bg.png");
        }
    }

    export class BagItemBg {
        static getName(): string {
            return "bag_item_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/bag/bag_item_bg.png");
        }
    }

    export class WindowBg {
        static getName(): string {
            return "ui_window_bg_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/window_bg.png");
        }
    }

    export class WindowClose {
        static getName(): string {
            return "ui_window_close_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/window_close.png");
        }

        static getWidth(): number {
            return 16;
        }

        static getHeight(): number {
            return 16;
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

    export class DropDownBtn {
        static getName(): string {
            return "ui_drop_down_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/drop_down.png");
        }

        static getWidth(): number {
            return 16;
        }

        static getHeight(): number {
            return 16;
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

        static getWidth(): number {
            return 15;
        }

        static getHeight(): number {
            return 15;
        }
    }

    export class ButtonRed {
        static getName(): string {
            return "ui_button_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/button_red.png");
        }

        static getJSON(): string {
            return require("assets/images/ui/button.json");
        }

        static getWidth(): number {
            return 15;
        }

        static getHeight(): number {
            return 15;
        }
    }
}

