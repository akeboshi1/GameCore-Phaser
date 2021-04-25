import { IPos, IPosition45Obj } from "structure";
import { Astar, Grids, MatterBodies } from "../display";
import { Render } from "../render";
import { ServerPosition } from "../display/debugs/server.pointer";

export class DebugManager {
    private mAstarDebug: Astar;
    private mGridsDebug: Grids;
    private matterBodies: MatterBodies;
    private serverPosition: ServerPosition;
    constructor(protected render: Render) {
    }

    public showGridsDebug(size: IPosition45Obj) {
        if (!this.mGridsDebug) {
            this.mGridsDebug = new Grids(this.render);
        }
        this.mGridsDebug.setData(size);
    }

    public hideGridsDebug() {
        if (this.mGridsDebug) {
            this.mGridsDebug.destroy();
            this.mGridsDebug = null;
        }
    }

    public showAstarDebug_init(map: number[][], posObj: IPosition45Obj) {
        if (!this.mAstarDebug) {
            this.mAstarDebug = new Astar(this.render);
        }

        this.mAstarDebug.initData(map, posObj);
    }

    public showAstarDebug_update(x: number, y: number, val: boolean) {
        if (!this.mAstarDebug) {
            // Logger.getInstance().error("AstarDebug not init");
            return;
        }

        this.mAstarDebug.updateData(x, y, val);
    }

    public showAstarDebug_findPath(start: IPos, tar: IPos, path: IPos[]) {
        if (!this.mAstarDebug) {
            // Logger.getInstance().error("AstarDebug not init");
            return;
        }

        this.mAstarDebug.showPath(start, tar, path);
    }

    public hideAstarDebug() {
        if (this.mAstarDebug) {
            this.mAstarDebug.destroy();
            this.mAstarDebug = null;
        }
    }
    public showMatterDebug(bodies) {
        if (!this.matterBodies) {
            this.matterBodies = new MatterBodies(this.render);
        }
        this.matterBodies.renderWireframes(bodies);
    }

    public hideMatterDebug() {
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = undefined;
        }
    }

    public drawServerPosition(x: number, y: number) {
        if (!this.serverPosition) {
            this.serverPosition = new ServerPosition(this.render);
        }
        this.serverPosition.draw(x, y);
    }

    public hideServerPosition() {
        if (!this.serverPosition) return;
        this.serverPosition.destroy();
        this.serverPosition = null;
    }

    public destroy() {
        if (this.mAstarDebug) {
            this.mAstarDebug.destroy();
            this.mAstarDebug = null;
        }
        if (this.mGridsDebug) {
            this.mGridsDebug.destroy();
            this.mGridsDebug = null;
        }
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = null;
        }
        if (this.serverPosition) {
            this.serverPosition.destroy();
            this.serverPosition = null;
        }
    }
}
