declare module PhaserNineSlice {
  class NineSlice extends Phaser.Sprite {
    localWidth: number;
    localHeight: number;
    baseTexture: PIXI.BaseTexture;
    texture: Phaser.RenderTexture;
    private leftSize;
    private topSize;
    private rightSize;
    private bottomSize;
    private baseFrame;

    constructor(game: PhaserNineSlice.NineSliceGame, x: number, y: number, key: string, frame: string, width: number, height: number, data?: NineSliceCacheData);

    resize(width: number, height: number): void;

    destroy(destroyChildren?: boolean): void;

    private renderTexture();

    private createTexturePart(x, y, width, height);
  }
}
declare module PhaserNineSlice {
  class NineSliceObjectFactory extends Phaser.GameObjectFactory {
    nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
  }

  class NineSliceObjectCreator extends Phaser.GameObjectCreator {
    nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
  }

  class NineSliceCache extends Phaser.Cache {
    addNineSlice: (key: string, data: NineSliceCacheData) => void;
    getNineSlice: (key: string) => NineSliceCacheData;
    nineSlice: {
      [key: string]: NineSliceCacheData;
    };
  }

  class NineSliceLoader extends Phaser.Loader {
    nineSlice: (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) => void;
    cache: NineSliceCache;
  }

  class NineSliceGame extends Phaser.Game {
    add: NineSliceObjectFactory;
    load: NineSliceLoader;
    cache: NineSliceCache;
  }

  class NineSliceCacheData {
    top: number;
    bottom?: number;
    left?: number;
    right?: number;
  }

  class Plugin extends Phaser.Plugin {
    constructor(game: Phaser.Game, parent: Phaser.PluginManager);

    private addNineSliceLoader();

    private addNineSliceFactory();

    private addNineSliceCache();
  }
}
