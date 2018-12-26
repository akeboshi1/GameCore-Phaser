export namespace PhaserNineSlice {
    export interface NineSliceObjectFactory extends Phaser.GameObjectFactory {
        nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
    }

    export interface NineSliceObjectCreator extends Phaser.GameObjectCreator {
        nineSlice: (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group) => PhaserNineSlice.NineSlice;
    }

    export interface NineSliceCache extends Phaser.Cache {
        addNineSlice: (key: string, data: NineSliceCacheData) => void;
        getNineSlice: (key: string) => NineSliceCacheData;
        nineSlice: { [key: string]: NineSliceCacheData };
    }

    export interface NineSliceLoader extends Phaser.Loader {
        nineSlice: (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) => void;
        cache: NineSliceCache;
    }

    export interface NineSliceGame extends Phaser.Game {
        add: NineSliceObjectFactory;
        load: NineSliceLoader;
        cache: NineSliceCache;
    }

    export interface NineSliceCacheData {
        top: number;
        bottom?: number;
        left?: number;
        right?: number;
    }

    export class Plugin extends Phaser.Plugin {
        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);

            this.addNineSliceCache();
            this.addNineSliceFactory();
            this.addNineSliceLoader();
        }

        private addNineSliceLoader() {
            (<PhaserNineSlice.NineSliceLoader>Phaser.Loader.prototype).nineSlice = function (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) {
                let cacheData: NineSliceCacheData = {
                    top: top
                };

                if (left) {
                    cacheData.left = left;
                }

                if (right) {
                    cacheData.right = right;
                }

                if (bottom) {
                    cacheData.bottom = bottom;
                }

                this.addToFileList("image", key, url);

                this.game.cache.addNineSlice(key, cacheData);
            };
        }

        /**
         * Extends the GameObjectFactory prototype with the support of adding NineSlice. this allows us to add NineSlice methods to the game just like any other object:
         * game.add.NineSlice();
         */
        private addNineSliceFactory() {
            (<PhaserNineSlice.NineSliceObjectFactory>Phaser.GameObjectFactory.prototype).nineSlice = function (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group): PhaserNineSlice.NineSlice {
                if (group === undefined) {
                    group = this.world;
                }

                let nineSliceObject = new PhaserNineSlice.NineSlice(this.game, x, y, key, frame, width, height);

                return group.add(nineSliceObject);
            };

            (<PhaserNineSlice.NineSliceObjectCreator>Phaser.GameObjectCreator.prototype).nineSlice = function (x: number, y: number, key: string, frame: string, width: number, height: number): PhaserNineSlice.NineSlice {
                return new PhaserNineSlice.NineSlice(this.game, x, y, key, frame, width, height);
            };
        }

        /**
         * Extends the Phaser.Cache prototype with NineSlice properties
         */
        private addNineSliceCache(): void {
            //Create the cache space
            (<PhaserNineSlice.NineSliceCache>Phaser.Cache.prototype).nineSlice = {};

            //Method for adding a NineSlice dict to the cache space
            (<PhaserNineSlice.NineSliceCache>Phaser.Cache.prototype).addNineSlice = function (key: string, data: any) {
                this.nineSlice[key] = data;
            };

            //Method for fetching a NineSlice dict from the cache space
            (<PhaserNineSlice.NineSliceCache>Phaser.Cache.prototype).getNineSlice = function (key: string): any {
                let data = this.nineSlice[key];

                // if (undefined === data) {
                //     console.warn("Phaser.Cache.getNineSlice: Key \"" + key + "\" not found in Cache.");
                // }

                return data;
            };
        }
    }

    export class NineSlice extends Phaser.Sprite {
        /**
         * The eventual sizes of the container
         */
        public localWidth: number;
        public localHeight: number;
        /**
         * The original texture, unmodified
         */
        public baseTexture: PIXI.BaseTexture;
        public texture: Phaser.RenderTexture;
        /**
         * The sizes of the edges
         */
        private leftSize: number;
        private topSize: number;
        private rightSize: number;
        private bottomSize: number;
        private baseFrame: PIXI.Rectangle;

        constructor(game: PhaserNineSlice.NineSliceGame, x: number, y: number, key: string, frame: string, width: number, height: number, data?: NineSliceCacheData) {
            super(game, x, y, key, frame);

            this.baseTexture = this.texture.baseTexture;
            this.baseFrame = this.texture.frame;

            if (frame !== null && !data) {
                data = game.cache.getNineSlice(frame);
            } else if (!data) {
                data = game.cache.getNineSlice(key);
            }

            if (undefined === data) {
                return;
            }

            this.topSize = data.top;
            if (!data.left) {
                this.leftSize = this.topSize;
            } else {
                this.leftSize = data.left;
            }

            if (!data.right) {
                this.rightSize = this.leftSize;
            } else {
                this.rightSize = data.right;
            }

            if (!data.bottom) {
                this.bottomSize = this.topSize;
            } else {
                this.bottomSize = data.bottom;
            }

            this.loadTexture(new Phaser.RenderTexture(this.game, this.localWidth, this.localHeight));
            this.resize(width, height);
        }

        /**
         * Set the size of the container, then update all the parts
         *
         * @param width
         * @param height
         */
        public resize(width: number, height: number): void {
            this.localWidth = width;
            this.localHeight = height;

            this.renderTexture();
        }

        /**
         * Override the destroy to fix PIXI leaking CanvasBuffers
         *
         * @param args
         */
        public destroy(...args: any[]): void {
            super.destroy(args[0]);
            this.texture.destroy(true);
            this.texture = null;
            this.baseTexture = null;
            this.baseFrame = null;
        }

        /**
         * Redraw the the current texture to adjust for the new sizes;
         */
        private renderTexture(): void {
            //Set a new empty texture
            this.texture = this.game.add.renderTexture(this.localWidth, this.localHeight);
            // this.texture.resize(this.localWidth, this.localHeight, true);

            //The positions we want from the base texture
            let textureXs: number[] = [0, this.leftSize, this.baseFrame.width - this.rightSize, this.baseFrame.width];
            let textureYs: number[] = [0, this.topSize, this.baseFrame.height - this.bottomSize, this.baseFrame.height];

            //These are the positions we need the eventual texture to have
            let finalXs: number[] = [0, this.leftSize, this.localWidth - this.rightSize, this.localWidth];
            let finalYs: number[] = [0, this.topSize, this.localHeight - this.bottomSize, this.localHeight];

            (<Phaser.RenderTexture>this.texture).clear();
            for (let yi = 0; yi < 3; yi++) {
                for (let xi = 0; xi < 3; xi++) {
                    let s = this.createTexturePart(
                        textureXs[xi],                      //x
                        textureYs[yi],                      //y
                        textureXs[xi + 1] - textureXs[xi],  //width
                        textureYs[yi + 1] - textureYs[yi]   //height
                    );

                    s.width = finalXs[xi + 1] - finalXs[xi];
                    s.height = finalYs[yi + 1] - finalYs[yi];

                    (<Phaser.RenderTexture>this.texture).renderXY(s, finalXs[xi], finalYs[yi]);
                }
            }
        }

        /**
         * Here we create a sprite part for the container based on the given input
         *
         * @param x
         * @param y
         * @param width
         * @param height
         * @returns {PIXI.Sprite}
         */
        private createTexturePart(x: number, y: number, width: number, height: number): Phaser.Image {
            let frame = new PIXI.Rectangle(
                this.baseFrame.x + this.texture.frame.x + x,
                this.baseFrame.y + this.texture.frame.y + y,
                Math.max(width, 1),
                Math.max(height, 1)
            );

            return new Phaser.Sprite(this.game, 0, 0, new PIXI.Texture(this.baseTexture, frame));
        }
    }
}
