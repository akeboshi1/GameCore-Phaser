import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {GameConfig} from "../../../GameConfig";

export class DisplaySortableTerrainLayer extends DisplaySortableSceneLayer {

    protected mStaticContainer: Phaser.Image;
    // protected mAnimationContainer: Phaser.Sprite;
    protected showBitmapData: Phaser.BitmapData;
    protected memoryBitmapData: Phaser.BitmapData;
    protected mCameraRect: Phaser.Rectangle;

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

        // this.mAnimationContainer = this.game.make.sprite(0, 0);
        // this.mAnimationContainer.fixedToCamera = true;
        // this.add(this.mAnimationContainer);
    }

    public onInitialize(): void {
        this.mCameraRect = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
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
        d.onDispose();
        d = null;
    }

    public onFrame(): void {
        let validEntitys: BasicSceneEntity[] = [];
        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onFrame();
            if (entity.isValidDisplay) {
                validEntitys.push(entity);
            }
            entity = this.mSceneEntities.moveNext();
        }

        let changeDirty = false;
        let drawAreas: Phaser.Rectangle[] = [];
        let offsetX = 0, offsetY = 0;

        let newCameraRect: Phaser.Rectangle = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
        if (!Phaser.Rectangle.equals(newCameraRect, this.mCameraRect)) {
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

        if (changeDirty) {
            let len = validEntitys.length;
            if (len > 0) {
                this.memoryBitmapData.cls();
                let boo = false;
                let reDrawEntitys: BasicSceneEntity[] = [];
                for (let i = 0; i < len; i++) {
                    entity = validEntitys[i];
                    boo = this.drawMemoryRegion(entity, drawAreas, newCameraRect);
                    if (boo) {
                        reDrawEntitys.push(entity);
                    }
                }

                this.showBitmapData.move(offsetX, offsetY, false);

                let cRect: Phaser.Rectangle;
                if (offsetX !== 0) {
                    if (offsetX < 0) {
                        cRect = new Phaser.Rectangle(newCameraRect.width + offsetX, 0, -offsetX, newCameraRect.height);
                        this.showBitmapData.copyRect(this.memoryBitmapData, cRect, newCameraRect.width + offsetX, 0);
                    } else {
                        cRect = new Phaser.Rectangle(0, 0, offsetX, newCameraRect.height);
                        this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
                    }
                }

                if (offsetY !== 0) {
                    if (offsetY < 0) {
                        cRect = new Phaser.Rectangle(0, newCameraRect.height + offsetY, newCameraRect.width, -offsetY);
                        this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, newCameraRect.height + offsetY);
                    } else {
                        cRect = new Phaser.Rectangle(0, 0, newCameraRect.width, offsetY);
                        this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
                    }
                }
            }
        }
    }

    public onTick(deltaTime: number): void {
        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onTick(deltaTime);
            entity = this.mSceneEntities.moveNext();
        }
    }

    public onClear(): void {
        this.showBitmapData.cls();
        this.memoryBitmapData.cls();
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
