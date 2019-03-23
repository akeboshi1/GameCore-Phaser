import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {GameConfig} from "../../../GameConfig";
import {SceneBuffer} from "./SceneBuffer";

export class DisplaySortableTerrainLayer extends DisplaySortableSceneLayer {
    protected mStaticContainer: Phaser.Image;
    protected mAnimationContainer: Phaser.Sprite;
    protected showBitmapData: Phaser.BitmapData;
    protected memoryBitmapData: Phaser.BitmapData;
    protected mCameraRect: Phaser.Rectangle;
    protected testGraph: Phaser.Graphics;
    private sceneBuffer: SceneBuffer;

    public constructor(game: Phaser.Game) {
        super(game);
        this.showBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
        this.showBitmapData.smoothed = false;

        this.memoryBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
        this.memoryBitmapData.smoothed = false;

        this.sceneBuffer = new SceneBuffer(this.showBitmapData, this.memoryBitmapData);

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

        if (d.isInScreen()) {
          this.drawShowRegion(d, this.mCameraRect);
        }
    }

    public removeEntity(d: BasicSceneEntity): void {
      this.mSceneEntities.remove(d);
      d.scene = null;
      d.camera = null;
      d.onClear();
    }

    public onFrame(): void {
        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onFrame();
            entity = this.mSceneEntities.moveNext();
        }

        this.sceneBuffer.onFrame();
    }

    private newCameraRect: Phaser.Rectangle;
    public onTick(deltaTime: number): void {
        if (this.sceneBuffer.copyDirty) {
            return;
        }

        if (this.newCameraRect === undefined) {
            this.newCameraRect = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
        } else {
            this.newCameraRect.setTo(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
        }

        if (this.mCameraRect === undefined) {
            this.mCameraRect = new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, this.newCameraRect.width, this.newCameraRect.height);
        }

        let drawAreas: Phaser.Rectangle[] = [];
        let changeDirty = false;
        let offsetX, offsetY = 0;

        if (!Phaser.Rectangle.equals(this.newCameraRect, this.mCameraRect)) {
            changeDirty = true;

            offsetX = (this.mCameraRect.x - this.newCameraRect.x);
            offsetY = (this.mCameraRect.y - this.newCameraRect.y);

            if (offsetX !== 0 && offsetY !== 0) {
                if (offsetX < 0 && offsetY < 0) {
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.right + offsetX, this.newCameraRect.y, -offsetX, this.newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.bottom + offsetY, this.newCameraRect.width + offsetX, -offsetY));
                } else if (offsetX > 0 && offsetY > 0) {
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, offsetX, this.newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x + offsetX, this.newCameraRect.y, this.newCameraRect.width - offsetX, offsetY));
                } else if (offsetX < 0 && offsetY > 0) {
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.right + offsetX, this.newCameraRect.y, -offsetX, this.newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, this.newCameraRect.width - offsetX, offsetY));
                } else if (offsetX > 0 && offsetY < 0) {
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, offsetX, this.newCameraRect.height));
                    drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x + offsetX, this.newCameraRect.bottom + offsetY, this.newCameraRect.width - offsetX, -offsetY));
                }
            } else {
                if (offsetX !== 0) {
                    if (offsetX < 0) {
                        drawAreas.push(new Phaser.Rectangle(this.newCameraRect.right + offsetX, this.newCameraRect.y, -offsetX, this.newCameraRect.height));
                    } else {
                        drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, offsetX, this.newCameraRect.height));
                    }
                }
                if (offsetY !== 0) {
                    if (offsetY < 0) {
                        drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.bottom + offsetY, this.newCameraRect.width, -offsetY));
                    } else {
                        drawAreas.push(new Phaser.Rectangle(this.newCameraRect.x, this.newCameraRect.y, this.newCameraRect.width, offsetY));
                    }
                }
            }
            this.mCameraRect.setTo(this.newCameraRect.x, this.newCameraRect.y, this.newCameraRect.width, this.newCameraRect.height);
        }

        let reDrawEntitys: BasicSceneEntity[] = [];

        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onTick(deltaTime);

            if (changeDirty && entity.isValidDisplay) {
                reDrawEntitys.push(entity);
            }
            entity = this.mSceneEntities.moveNext();
        }

        if (changeDirty) {
            let len = reDrawEntitys.length;
            if (len > 0) {
                this.memoryBitmapData.cls();
                let boo = false;
                for (let i = 0; i < len; i++) {
                    entity = reDrawEntitys[i];
                    boo = this.drawMemoryRegion(entity, drawAreas, this.mCameraRect);
                    if (boo) {
                        reDrawEntitys.push(entity);
                    }
                }
                this.sceneBuffer.draw(reDrawEntitys, this.mCameraRect, [], offsetX, offsetY);
            }
        }
    }

    protected isIntersectionRect(d: BasicSceneEntity, cRects: Phaser.Rectangle[]): boolean {
        let len = cRects.length;
        for (let i = 0; i < len; i++) {
            let dRect = d.getRect();
            let cRect = cRects[i];
            let mRect = Phaser.Rectangle.intersection(dRect, cRect);
            if (mRect.width > 0 && mRect.height > 0) {
                return true;
            }
        }
        return false;
    }

    private drawShowRegion(d: BasicSceneEntity, cameraRect: Phaser.Rectangle): boolean {
        let tx, ty = 0;
        let dRect = d.getRect();
        if (this.isIntersectionRect(d, [cameraRect])) {
            tx = dRect.x - cameraRect.x;
            ty = dRect.y - cameraRect.y;
            d.drawBit(this.showBitmapData, new Phaser.Point(tx, ty));
            return true;
        }
        return false;
    }

    private drawMemoryRegion(d: BasicSceneEntity, cRects: Phaser.Rectangle[], cameraRect: Phaser.Rectangle): boolean {
        let tx, ty = 0;
        let dRect = d.getRect();
        if (this.isIntersectionRect(d, cRects)) {
            tx = dRect.x - cameraRect.x;
            ty = dRect.y - cameraRect.y;
            d.drawBit(this.memoryBitmapData, new Phaser.Point(tx, ty));
            return true;
        }
        return false;
    }
}
