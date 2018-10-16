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
}

export namespace Images {
    export class ImagesTile {
        static getName(): string {
            return 'tile_png';
        }

        static getPNG(): string {
            return require('assets/images/tile.png');
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
            return require( mapId + '_json');
        }

        static getJSON(mapId: number): string {
            return require('assets/map/' + mapId + '.json');
        }
    }
}

