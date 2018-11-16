/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */

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
        static getName(id: number): string {
            return "tile" + id + "_png";
        }

        static getPNG(id: number): string {
            return require("assets/images/terrain/terrain_" + id + ".png");
        }
    }
}

export namespace Avatar {
    export class AvatarBone {
        static getSkeName(): string {
            return "bones_allblue_ske_dbbin";
        }

        static getSkeUrl(): string {
            return require("assets/avatar/bones_allblue_ske.dbbin");
        }

        static getPartName(value: string): string {
            return value + "_png";
        }

        static getPartUrl(value: string): string {
            return require("assets/avatar/part/" + value + ".png");
        }
    }
}

export namespace Jsons {
    export class JsonMap {
        static getLoadList(): number[] {
            let temp: number[] = [];
            for (let i: number = 1; i < 2; i++) {
                temp.push(10000 + i);
            }
            return temp;
        }

        static getName(mapId: number): string {
            return require(mapId + "_json");
        }

        static getJSON(mapId: number): string {
            return require("assets/map/" + mapId + ".json");
        }
    }
}

export namespace UI {
    export class SpriteSheetsBlueBtn {
        static getName(): string { return "ui_btn_bule_sprite_sheet_png"; }
        static getPNG(): string { return require("assets/spritesheets/btn_bule_sprite_sheet.png"); }
        static getFrameWidth(): number { return 193; }
        static getFrameHeight(): number { return 71; }
        static getFrameMax(): number { return 3; }
    }

    export class SpriteSheetsCloseBtn {
        static getName(): string { return "ui_btn_close_sprite_sheet_png"; }
        static getPNG(): string { return require("assets/spritesheets/btn_close_sprite_sheet.png"); }
        static getFrameWidth(): number { return 118; }
        static getFrameHeight(): number { return 120; }
        static getFrameMax(): number { return 3; }
    }



    export class ImageMenuBag {
        static getName(): string { return "ui_menu_bag_png"; }
        static getPNG(): string { return require("assets/images/ui/menu_bag.png"); }
    }

    export class ImageBg {
        static getName(): string { return "ui_background_png"; }
        static getPNG(): string { return require("assets/images/ui/background.png"); }
    }
}

export namespace Tile {
    export class JsonMap {
        static getLoadList(): number[] {
            let temp: number[] = [];
            for (let i: number = 1; i < 2; i++) {
                temp.push(10000 + i);
            }
            return temp;
        }

        static getName(mapId: number): string {
            return require(mapId + "_json");
        }

        static getJSON(mapId: number): string {
            return require("assets/map/" + mapId + ".json");
        }
    }
}

