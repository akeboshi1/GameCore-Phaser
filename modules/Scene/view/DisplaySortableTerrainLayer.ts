import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {GameConfig} from "../../../GameConfig";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";

export class DisplaySortableTerrainLayer extends DisplaySortableSceneLayer {
    protected mStaticContainer: Phaser.Image;
    protected mAnimationContainer: Phaser.Sprite;
    protected showBitmapData: Phaser.BitmapData;
    protected memoryBitmapData: Phaser.BitmapData;
    protected mCameraRect: Phaser.Rectangle;
    protected testGraph: Phaser.Graphics;
    private drawFlag = false;
    private addComplete = false;
    private initShow = false;

    public constructor(game: Phaser.Game) {
        super(game);
        this.showBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
        this.showBitmapData.smoothed = false;

        this.memoryBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
        this.memoryBitmapData.smoothed = false;

        this.mStaticContainer = this.game.make.image(0, 0, this.showBitmapData);
        this.mStaticContainer.fixedToCamera = true;
        this.mStaticContainer.cacheAsBitmap = true;
        this.add(this.mStaticContainer);

        this.mAnimationContainer = this.game.make.sprite(0, 0);
        this.add(this.mAnimationContainer);

        this.testGraph = this.game.make.graphics();
        this.testGraph.fixedToCamera = true;
        this.add(this.testGraph);
    }

    public addEntity(d: BasicSceneEntity): void {
        d.scene = this.scene;
        d.camera = this.camera;

        d.initialize();
        this.mSceneEntities.add(d);
    }

    public onAddComplete(): void {
        this.addComplete = true;
    }

    public onFrame(): void {
        if (!this.addComplete) {
            return;
        }

        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();

        while (entity) {
            entity.onFrame();
            entity = this.mSceneEntities.moveNext();
        }
    }

    private totalDraw = 0;
    public onTick(deltaTime: number): void {
        if (!this.addComplete || this.drawFlag) {
            return;
        }

        let newCameraRect: Phaser.Rectangle = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);

        if (this.mCameraRect === undefined) {
            this.mCameraRect = new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width, newCameraRect.height);
        }

        let drawAreas: Phaser.Rectangle[] = [];
        let changeDirty = false;
        let offsetX, offsetY = 0;

        if (this.initShow && !Phaser.Rectangle.equals(newCameraRect, this.mCameraRect)) {
            changeDirty = true;

            offsetX = (this.mCameraRect.x - newCameraRect.x);
            offsetY = (this.mCameraRect.y - newCameraRect.y);

            if (offsetX !== 0 && offsetY !== 0) {
                if (offsetX < 0 && offsetY < 0) {
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.bottom + offsetY, newCameraRect.width + offsetX, -offsetY));
                } else if (offsetX > 0 && offsetY > 0) {
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x + offsetX, newCameraRect.y, newCameraRect.width - offsetX, offsetY));
                } else if (offsetX < 0 && offsetY > 0) {
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width - offsetX, offsetY));
                } else if (offsetX > 0 && offsetY < 0) {
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(newCameraRect.x + offsetX, newCameraRect.bottom + offsetY, newCameraRect.width - offsetX, -offsetY));
                }
            } else {
                if (offsetX !== 0) {
                    if (offsetX < 0) {
                        drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
                    } else {
                        drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
                    }
                }
                if (offsetY !== 0) {
                    if (offsetY < 0) {
                        drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.bottom + offsetY, newCameraRect.width, -offsetY));
                    } else {
                        drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width, offsetY));
                    }
                }
            }
            this.mCameraRect.setTo(newCameraRect.x, newCameraRect.y, newCameraRect.width, newCameraRect.height);
        }

        let reDrawEntitys: BasicSceneEntity[] = [];
        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onTick(deltaTime);

            if ((!this.initShow || changeDirty) && entity.isValidDisplay) {
                reDrawEntitys.push(entity);
            }
            entity = this.mSceneEntities.moveNext();
        }

        if (!this.initShow || changeDirty) {
            this.totalDraw = reDrawEntitys.length;
            if (this.totalDraw > 0) {
                if (this.initShow) {
                    this.memoryBitmapData.cls();
                }
                this.drawFlag = true;

                let len = this.totalDraw;
                for (let i = 0; i < len; i++) {
                    entity = reDrawEntitys[i];
                    if (!this.initShow) {
                        entity.drawBack(this.initRegion, this, this.mCameraRect);
                    } else {
                        entity.drawBack(this.drawRegion, this, drawAreas, this.mCameraRect, offsetX, offsetY);
                    }
                }
            }
        }
    }

    private initRegion(d: BasicSceneEntity, cameraRect: Phaser.Rectangle): void {
        --this.totalDraw;
        let loader: DisplayLoaderAvatar = d.display.Loader;
        let tx, ty = 0;
        let dRect = d.getRect();
        let mRect = Phaser.Rectangle.intersection(dRect, cameraRect);
        if (mRect.width > 0 && mRect.height > 0) {
            tx = dRect.x - cameraRect.x;
            ty = dRect.y - cameraRect.y;
            this.showBitmapData.draw(loader, tx, ty);
        }
        if (this.totalDraw === 0) {
            this.initShow = true;
            this.drawFlag = false;
        }
    }

    private drawRegion(d: BasicSceneEntity, cRects: Phaser.Rectangle[], cameraRect: Phaser.Rectangle, offsetX: number, offsetY: number): void {
        --this.totalDraw;
        let len = cRects.length;
        let loader: DisplayLoaderAvatar = d.display.Loader;
        let tx, ty = 0;
        for (let i = 0; i < len; i++) {
            let dRect = d.getRect();
            let cRect = cRects[i];
            let mRect = Phaser.Rectangle.intersection(dRect, cRect);
            if (mRect.width > 0 && mRect.height > 0) {
                tx = dRect.x - cameraRect.x;
                ty = dRect.y - cameraRect.y;
                this.memoryBitmapData.draw(loader, tx, ty);
            }
        }
        if (this.totalDraw === 0) {
            this.showBitmapData.move(offsetX, offsetY, false);
            let cRect: Phaser.Rectangle;
            if (offsetX !== 0) {
                if (offsetX < 0) {
                    cRect = new Phaser.Rectangle(this.mCameraRect.width + offsetX, 0, -offsetX, this.mCameraRect.height);
                    this.showBitmapData.copyRect(this.memoryBitmapData, cRect, this.mCameraRect.width + offsetX, 0);
                } else {
                    cRect = new Phaser.Rectangle(0, 0, offsetX, this.mCameraRect.height);
                    this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
                }
            }

            if (offsetY !== 0) {
                if (offsetY < 0) {
                    cRect = new Phaser.Rectangle(0, this.mCameraRect.height + offsetY, this.mCameraRect.width, -offsetY);
                    this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, this.mCameraRect.height + offsetY);
                } else {
                    cRect = new Phaser.Rectangle(0, 0, this.mCameraRect.width, offsetY);
                    this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
                }
            }
            this.drawFlag = false;
        }
    }
}
