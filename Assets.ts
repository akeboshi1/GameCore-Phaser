/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */
import {GameConfig} from "./GameConfig";
import * as path from "path";
import * as url from "url";

export namespace Load {
    export class Url {
        static getRes(value: string): string {
            const isRemote: boolean = /^(http|https):/i.test(GameConfig.HomeDir);
            if (isRemote) {
                return `${url.resolve(GameConfig.HomeDir, value)}`;
            }
            return `file:///${path.resolve(GameConfig.HomeDir, value)}`;
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

export namespace EDITOR {
  export class SelectFlag {
    static getName(): string {
      return "selectFlag_png";
    }

    static getPNG(): string {
      return require("assets/images/editor/selectFlag.png");
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
            return require("assets/images/ui/vote/flag.png");
        }
    }

    export class KillerFlag {
        static getName(): string {
            return "vote_killer_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/vote/killer.png");
        }
    }

    export class VoteLight {
        static getName(): string {
            return "vote_light_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/vote/light.png");
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

    export class LabaBt {
        static getName(): string {
            return "laba_bt_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/laba_bt.png");
        }

        static getWidth(): number {
            return 28;
        }

        static getHeight(): number {
            return 28;
        }
    }

    export class VoiceBt {
        static getName(): string {
            return "voice_bt_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/voice_bt.png");
        }

        static getWidth(): number {
            return 28;
        }

        static getHeight(): number {
            return 28;
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

    export class StorageTitle {
        static getName(): string {
            return "storage_title_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/storage/storage_title.png");
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

    export class Loading {
        static getName(): string {
            return "loading_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/loading.png");
        }

        static getWidth(): number {
            return 30;
        }

        static getHeight(): number {
            return 30;
        }

        static getFrame(): number {
            return 8;
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
            return "ui_button_red_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/button_red.png");
        }

        static getJSON(): string {
            return require("assets/images/ui/button_red.json");
        }

        static getWidth(): number {
            return 15;
        }

        static getHeight(): number {
            return 15;
        }
    }

    export class ButtonBlue {
        static getName(): string {
            return "ui_button_blue_png";
        }

        static getPNG(): string {
            return require("assets/images/ui/button_blue.png");
        }

        static getJSON(): string {
            return require("assets/images/ui/button_blue.json");
        }

        static getWidth(): number {
            return 15;
        }

        static getHeight(): number {
            return 15;
        }
    }
}

export namespace CustomWebFonts {
    export class Fonts2DumbWebfont {
        static getName(): string { return "2Dumb-webfont"; }

        static getFamily(): string { return "2dumbregular"; }

        static getCSS(): string { return require("!file-loader?name=assets/fonts/[name].[ext]!assets/fonts/2Dumb-webfont.css"); }
        static getTTF(): string { return require("!file-loader?name=assets/fonts/[name].[ext]!assets/fonts/2Dumb-webfont.ttf"); }
        static getWOFF(): string { return require("!file-loader?name=assets/fonts/[name].[ext]!assets/fonts/2Dumb-webfont.woff"); }
    }
}
