///<reference path="../../node_modules/phaser-plugin-isometric/dist/phaser.plugin.isometric.d.ts"/>
///<reference path="./lib/nineSlice/phaser-nineslice.d.ts"/>

declare module Phaser {

  interface Game {
    iso: Phaser.Plugin.Isometric.Projector;
  }


  interface Loader {
    nineSlice: (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) => void;
  }

  interface GameObjectFactory {
    nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
    isoSprite(x: number, y: number, z: number, key?: any, frame?: any, group?: Phaser.Group): Phaser.Plugin.Isometric.IsoSprite;
  }

  interface Cache {
    addNineSlice: (key: string, data: PhaserNineSlice.NineSliceCacheData) => void;
    getNineSlice: (key: string) => PhaserNineSlice.NineSliceCacheData;
    nineSlice: {
      [key: string]: PhaserNineSlice.NineSliceCacheData;
    };
  }

  interface Physics {
    isoArcade: Phaser.Plugin.Isometric.Arcade;
  }
}
