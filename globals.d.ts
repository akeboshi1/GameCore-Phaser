///<reference path="../../node_modules/phaser-plugin-isometric/dist/phaser.plugin.isometric.d.ts"/>
///<reference path="./lib/dragonBones/dragonBones.d.ts"/>
declare let DEFAULT_GAME_WIDTH: number;
declare let DEFAULT_GAME_HEIGHT: number;
declare let MAX_GAME_WIDTH: number;
declare let MAX_GAME_HEIGHT: number;
declare let SCALE_MODE: string;
declare let GOOGLE_WEB_FONTS: string[];
declare let SOUND_EXTENSIONS_PREFERENCE: string[];

declare module Phaser {
    interface Game {
        iso: Phaser.Plugin.Isometric.Projector;
    }

    interface GameObjectFactory {
        isoSprite(x: number, y: number, z: number, key?: any, frame?: any, group?: Phaser.Group): Phaser.Plugin.Isometric.IsoSprite;
    }

    interface Physics {
        isoArcade: Phaser.Plugin.Isometric.Arcade;
    }
}
