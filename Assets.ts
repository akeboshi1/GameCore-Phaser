/* AUTO GENERATED FILE. DO NOT MODIFY. YOU WILL LOSE YOUR CHANGES ON BUILD. */

export namespace Atlases {
    export class AtlasesPreloadSpritesArray {
        static getName(): string {
            return 'preload_sprites_array';
        }

        static getJSONArray(): string {
            return require('assets/atlases/preload_sprites_array.json');
        }

        static getPNG(): string {
            return require('assets/atlases/preload_sprites_array.png');
        }
    }

    export namespace AtlasesPreloadSpritesArray {
        export enum Frames {
            PreloadBar = 'preload_bar.png',
            PreloadFrame = 'preload_frame.png',
        }
    }

    export class AtlasesCharSpritesArray {
        static getName(): string {
            return 'char_sprites_array';
        }

        static getJSONArray(): string {
            return require('assets/atlases/char_sprites_array.json');
        }

        static getPNG(): string {
            return require('assets/atlases/char_sprites_array.png');
        }
    }
}

export namespace Images {
    export class ImagesTile {
        static getName(id: number): string {
            return "tile" + id + "_png";
        }

        static getPNG(id: number): string {
            return require("assets/images/terrain/terrain_"+id+".png");
        }
    }
}

export namespace Avatar {
    export class AvatarBone {
        static getSkeName(): string {
            return "bones_allblue_ske_dbbin";
        }
        static getJsonName(): string {
            return "bones_allblue_tex_json";
        }
        static getImgName(): string {
            return "bones_allblue_tex_png";
        }
        static getSkeUrl(): string {
            return require("assets/avatar/bones_allblue_ske.dbbin");
        }
        static getJsonUrl(): string {
            return require("assets/avatar/bones_allblue_tex.json");
        }
        static getImgUrl(): string {
            return require("assets/avatar/bones_allblue_tex.png");
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
            return require(mapId + '_json');
        }

        static getJSON(mapId: number): string {
            return require('assets/map/' + mapId + '.json');
        }
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
            return require(mapId + '_json');
        }

        static getJSON(mapId: number): string {
            return require('assets/map/' + mapId + '.json');
        }
    }
}

