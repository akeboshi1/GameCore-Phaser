import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {QuadTree} from "../../../base/ds/QuadTree";
import {Log} from "../../../Log";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
    public needRealTimeDepthSort = false;
    protected mSceneEntities: UniqueLinkList;
    protected SCENE_LAYER_RENDER_DELAY = 200;
    private mDepthSortDirtyFlag = false;
    private mSortWaitTime = 0;
    private mSortRectangle: Phaser.Rectangle;
    private mQuadTree: QuadTree;

    // private mQuadTree: QuadTreeTest;


    public constructor(game: Phaser.Game) {
        super(game);
        this.mSceneEntities = new UniqueLinkList();
    }

    public initialize(p_rect: Phaser.Rectangle): void {
        if (this.mQuadTree === undefined) {
            this.mQuadTree = new QuadTree(p_rect);
            // this.mQuadTree = new QuadTreeTest(p_rect, this);
            // this.addChild(QuadTreeTest.graphicsTree);
        }
        this.mQuadTree.clear();
    }

    public addEntity(d: BasicSceneEntity): void {
        d.scene = this.scene;
        d.camera = this.camera;

        d.initialize();

        this.mSceneEntities.add(d);
        this.add(d.display);

        if (this.mQuadTree) {
            this.mQuadTree.insert(d);
        }
    }

    public onFrame(deltaTime: number): void {
        let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onFrame(deltaTime);
            entity = this.mSceneEntities.moveNext();
        }
    }



    public onTick(deltaTime: number): void {
        this.mSortWaitTime += deltaTime;

        let needSort = false;

        if (this.mSortWaitTime > this.SCENE_LAYER_RENDER_DELAY) {
            this.mSortWaitTime = 0;
            needSort = this.needRealTimeDepthSort || this.mDepthSortDirtyFlag;
            if (needSort) {
                this.mDepthSortDirtyFlag = false;
            }
        }
        let found: BasicSceneEntity[];
        if (needSort) {
            found = this.mQuadTree.retrieve(this.mSortRectangle) as BasicSceneEntity[];
            this.mSortRectangle = null;
        }
        let entity: BasicSceneEntity;
        if (found && found.length > 0) {
            let childIdxList = [];
            let len = found.length;
            for (let i = 0; i < len; i++) {
                childIdxList.push(this.getChildIndex(found[i].display));
            }
            found.sort(Globals.Room45Util.sortFunc);
            childIdxList = childIdxList.sort((n1, n2) => {
                if (n1 > n2) {
                    return 1;
                }
                if (n1 < n2) {
                    return -1;
                }
                return 0;
            });

            for (let i = 0; i < len; i++) {
                entity = found[i];
                this.setChildIndex(entity.display, childIdxList[i]);
            }
        }

        entity = this.mSceneEntities.moveFirst();
        while (entity) {
            entity.onTick(deltaTime);
            if (entity.positionDirty) {
                this.markDirty(entity.quadX, entity.quadY, entity.quadW, entity.quadH);
                entity.positionDirty = false;
            }
            entity = this.mSceneEntities.moveNext();
        }

        if (this.mDepthSortDirtyFlag) {
            if (this.mQuadTree) {
                this.mQuadTree.cleanup();
            }
        }
    }

    /**
     * Indicates this layer is dirty and needs to resort.
     */
    public markDirty(x: number, y: number, w: number, h: number): void {
        if (this.mSortRectangle === undefined || this.mSortRectangle == null) {
            this.mSortRectangle = new Phaser.Rectangle(x, y, w, h);
        }
        let startX: number = this.mSortRectangle.x;
        let startY: number = this.mSortRectangle.y;
        let endX: number = startX + this.mSortRectangle.width;
        let endY: number = startY + this.mSortRectangle.height;
        if (x < startX) {
            this.mSortRectangle.x = x;
        }
        if (y < startY) {
            this.mSortRectangle.y = y;
        }

        if (x + w > endX) {
            endX = x + w;
        }

        if (y + h > endY) {
            endY = y + h;
        }

        this.mSortRectangle.x = startX;
        this.mSortRectangle.y = startY;
        this.mSortRectangle.width = endX - startX;
        this.mSortRectangle.height = endY - startY;

        this.mDepthSortDirtyFlag = true;
    }

    public removeEntity(d: BasicSceneEntity, dispose: boolean = true): void {
        if (this.mQuadTree) {
            this.mQuadTree.remove(d);
        }

        this.mSceneEntities.remove(d);

        if (d && d.display && d.display.parent) {
            this.removeChild(d.display);
        }

        if (dispose) {
            d.onDispose();
        }

        d.scene = null;
        d.camera = null;
    }
}
