export namespace PhaserNineSlice {
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
            Phaser.Loader.prototype.nineSlice = function (key: string, url: string, top: number, left?: number, right?: number, bottom?: number) {
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
          (<any>Phaser.GameObjectFactory.prototype).nineSlice = (x: number, y: number, key: string, frame: string, width: number, height: number, group?: Phaser.Group): PhaserNineSlice.NineSlice => {
                if (group === undefined) {
                    group = this.game.world;
                }

                let nineSliceObject = new PhaserNineSlice.NineSlice(this.game, x, y, key, frame, width, height);

                return group.add(nineSliceObject);
            };

          (<any>Phaser.GameObjectFactory.prototype).nineSlice = function (x: number, y: number, key: string, frame: string, width: number, height: number): PhaserNineSlice.NineSlice {
                return new PhaserNineSlice.NineSlice(this.game, x, y, key, frame, width, height);
            };
        }

        /**
         * Extends the Phaser.Cache prototype with NineSlice properties
         */
        private addNineSliceCache(): void {
            // Create the cache space
            Phaser.Cache.prototype.nineSlice = {};

            // Method for adding a NineSlice dict to the cache space
            Phaser.Cache.prototype.addNineSlice = function (key: string, data: any) {
                this.nineSlice[key] = data;
            };

            // Method for fetching a NineSlice dict from the cache space
            Phaser.Cache.prototype.getNineSlice = function (key: string): any {
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
        protected leftSize: number;
        protected topSize: number;
        protected rightSize: number;
        protected bottomSize: number;
        protected baseFrame: PIXI.Rectangle;

        constructor(game: Phaser.Game, x: number, y: number, key: string, frame: string, width: number, height: number, data?: NineSliceCacheData) {
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

            this.sList = [];

            // this.loadTexture(new Phaser.RenderTexture(this.game, this.localWidth, this.localHeight));
            this.resize(width, height);
        }

        /**
         * Set the size of the container, then update all the parts
         *
         * @ param width
         * @ param height
         */
        public resize(width: number, height: number): void {
            this.localWidth = width;
            this.localHeight = height;

            this.renderTexture();
        }

        /**
         * Override the destroy to fix PIXI leaking CanvasBuffers
         *
         * @ param args
         */
        public destroy(destroyChildren?: boolean): void {
            super.destroy(destroyChildren);
            this.texture.destroy(true);
            this.texture = null;
            this.baseTexture = null;
            this.baseFrame = null;
        }

        /**
         * Redraw the the current texture to adjust for the new sizes;
         */
        private renderTexture(): void {
            // Set a new empty texture
            this.texture = this.game.add.renderTexture(this.localWidth, this.localHeight);
            // this.texture.resize(this.localWidth, this.localHeight, true);

            // The positions we want from the base texture
            let textureXs: number[] = [0, this.leftSize, this.baseFrame.width - this.rightSize, this.baseFrame.width];
            let textureYs: number[] = [0, this.topSize, this.baseFrame.height - this.bottomSize, this.baseFrame.height];

            // These are the positions we need the eventual texture to have
            let finalXs: number[] = [0, this.leftSize, this.localWidth - this.rightSize, this.localWidth];
            let finalYs: number[] = [0, this.topSize, this.localHeight - this.bottomSize, this.localHeight];

            (<Phaser.RenderTexture>this.texture).clear();
            for (let yi = 0; yi < 3; yi++) {
                if (this.sList.length === yi) {
                    this.sList.push([]);
                }
                for (let xi = 0; xi < 3; xi++) {
                    let s = this.createTexturePart(
                        textureXs[xi],                      // x
                        textureYs[yi],                      // y
                        textureXs[xi + 1] - textureXs[xi],  // width
                        textureYs[yi + 1] - textureYs[yi]   // height
                    );

                    s.width = finalXs[xi + 1] - finalXs[xi];
                    s.height = finalYs[yi + 1] - finalYs[yi];

                    (<Phaser.RenderTexture>this.texture).renderXY(s, finalXs[xi], finalYs[yi]);
                    this.sList[yi].push(s);
                }
            }
        }

        protected sList: any[];

        /**
         * Here we create a sprite part for the container based on the given input
         *
         * @ param x
         * @ param y
         * @ param width
         * @ param height
         * @ returns {PIXI.Sprite}
         */
        protected createTexturePart(x: number, y: number, width: number, height: number): Phaser.Image {
            let frameRect = new PIXI.Rectangle(
                this.baseFrame.x + this.texture.frame.x + x,
                this.baseFrame.y + this.texture.frame.y + y,
                Math.max(width, 1),
                Math.max(height, 1)
            );

            return new Phaser.Sprite(this.game, 0, 0, new PIXI.Texture(this.baseTexture, frameRect));
        }
    }
}
