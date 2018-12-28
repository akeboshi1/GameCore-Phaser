///<reference path="../../node_modules/phaser-plugin-isometric/dist/phaser.plugin.isometric.d.ts"/>
///<reference path="./../core/lib/dragonBones/dragonBones.d.ts"/>

declare module Phaser {

    interface Game {
        iso: Phaser.Plugin.Isometric.Projector;
    }


    interface Loader {
        nineSlice: (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) => void;
    }

    interface Cache {
        addNineSlice: (key: string, data: PhaserNineSlice.NineSliceCacheData) => void;
        getNineSlice: (key: string) => PhaserNineSlice.NineSliceCacheData;
        nineSlice: {
            [key: string]: PhaserNineSlice.NineSliceCacheData;
        };
    }

    interface GameObjectFactory {
        isoSprite(x: number, y: number, z: number, key?: any, frame?: any, group?: Phaser.Group): Phaser.Plugin.Isometric.IsoSprite;
        nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
    }

    interface GameObjectCreator {
        nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
    }

    interface Physics {
        isoArcade: Phaser.Plugin.Isometric.Arcade;
    }
}
