import {IDragDropData} from "../interfaces/IDragDropData";
import {IDragable} from "../interfaces/IDragable";
import {IDropable} from "../interfaces/IDropable";

export class DragDropData implements IDragDropData {
    private m_DragSource: IDragable;
    private m_DropTarget: IDropable;
    constructor(drag: IDragable, drop?: IDropable) {
        this.m_DragSource = drag;
        if (drop) {
            this.m_DropTarget = drop;
        }
    }
    public get dragSource(): IDragable {
        return this.m_DragSource;
    }
    public set dragSource(value: IDragable) {
        this.m_DragSource = value;
    }

    public get dropTarget(): IDropable {
        return this.m_DropTarget;
    }
    public set dropTarget(value: IDropable) {
        this.m_DropTarget = value;
    }

}