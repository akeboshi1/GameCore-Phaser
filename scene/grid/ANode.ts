export class ANode {
    /** 节点列号 */
    public x: number;

    /** 节点行号 */
    public y: number;

    public f: number;
    public g: number;
    public h: number;
    public parent: ANode;
    public costMultiplier: number = 1.0;
    /** 埋葬深度 */
    public buriedDepth: number = -1;
    /** 距离 */
    public distance: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    private _walkable: boolean = true;

    public get walkable(): boolean {
        return this._walkable;
    }

    public set walkable(value: boolean) {
        this._walkable = value;
    }

    public get key(): string {
        return this.x + "," + this.y;
    }

    public ANode(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /** 得到此节点到另一节点的网格距离 */
    public getDistanceTo(targetNode: ANode): number {
        var disX: number = targetNode.x - this.x;
        var disY: number = targetNode.y - this.y;
        this.distance = Math.sqrt(disX * disX + disY * disY);
        return this.distance;
    }
}
