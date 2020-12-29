import { BaseDataManager, DataMgrType } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { ElementStateType, EventType, ISprite } from "structure";
import { IRoomService } from "../room/room";
import { Element, IElement } from "./element";
export class ElementStateManager extends PacketHandler {

    protected mElements: Map<string, Map<number, Element>> = new Map();
    constructor(protected mRoom: IRoomService) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
        const size = this.mRoom.miniSize;
        this.addLisenter();
    }

    public addLisenter() {
        const game = this.mRoom.game;
        game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.checkElementHeadState, this);
        game.emitter.on(EventType.PACKAGE_UPDATE, this.checkElementHeadState, this);
        game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.checkElementHeadState, this);
        game.emitter.on(EventType.UPDATE_ROOM_INFO, this.checkElementHeadState, this);

    }

    public removeLisenter() {
        const game = this.mRoom.game;
        game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.checkElementHeadState, this);
        game.emitter.off(EventType.PACKAGE_UPDATE, this.checkElementHeadState, this);
        game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.checkElementHeadState, this);
        game.emitter.off(EventType.UPDATE_ROOM_INFO, this.checkElementHeadState, this);
    }

    public get(id: number, type?: ElementStateType): Element {
        let element;
        if (type) {
            const map = this.getMap(type);
            if (map.has(id)) {
                element = map.get(id);
            }
        } else {
            this.mElements.forEach((value) => {
                if (value.has(id)) {
                    element = value.get(id);
                }
            });
        }
        return element;
    }

    public remove(id: number, type?: ElementStateType): IElement {
        let element;
        if (type) {
            const map = this.getMap(type);
            if (map.has(id)) {
                element = map.get(id);
                map.delete(id);
            }
        } else {
            this.mElements.forEach((value) => {
                if (value.has(id)) {
                    element = value.get(id);
                    value.delete(id);
                }
            });
        }
        return element;
    }

    public getElements(type?: ElementStateType): IElement[] {
        if (type) {
            const map = this.mElements.get(type);
            return Array.from(map.values());
        } else {
            let arr: IElement[] = [];
            this.mElements.forEach((value) => {
                arr = arr.concat(Array.from(value.values()));
            });
            return arr;
        }
    }

    public add(elements: Element[]) {
        for (const element of elements) {
            const tempele = this.remove(element.id);
            const type = this.getElementStateType(element);
            if (type !== ElementStateType.NONE) {
                const map = this.getMap(type);
                map.set(element.id, element);
            } else if (tempele) {
                (<Element>tempele).showTopDisplay(undefined);
            }
        }
        this.checkElementHeadState();
    }

    public syncElement(elements: Element[]) {
        for (const element of elements) {
            const tempele = this.remove(element.id);
            const type = this.getElementStateType(element);
            if (type !== ElementStateType.NONE) {
                const map = this.getMap(type);
                map.set(element.id, element);
            } else if (tempele) {
                (<Element>tempele).showTopDisplay(undefined);
            }
        }
        this.checkElementHeadState();
    }

    public setState(state: op_client.IStateGroup) {
        if (!state) {
            return;
        }
        const owner = state.owner;
        if (!owner || owner.type !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const element = this.get(owner.id);
        if (!element) {
            return;
        }
        element.setState(state.state);
    }

    public destroy() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        if (!this.mElements) return;
        this.mElements.forEach((value) => value.clear());
        this.mElements.clear();
        this.removeLisenter();
    }

    public update(time: number, delta: number) { }
    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.game.connection;
        }
        return;
    }

    protected getMap(type: ElementStateType) {
        if (this.mElements.has(type)) {
            return this.mElements.get(type);
        } else {
            const map = new Map();
            this.mElements.set(type, map);
            return map;
        }
    }

    protected getElementStateType(element: Element) {
        const sprite = element.model;
        if (this.getFrozenType(sprite) === "FROZEN") {
            return ElementStateType.UNFROZEN;
        }
        return ElementStateType.NONE;
    }

    protected checkElementHeadState() {
        const game = this.mRoom.game;
        if (game.user && game.user.userData && game.user.userData.isSelfRoom)
            this.checkElementUnfrozenState();
    }

    protected checkElementUnfrozenState() {
        const sns = [];
        const map = this.getMap(ElementStateType.UNFROZEN);
        if (map.size > 0) {
            map.forEach((value) => {
                if (value && value.model && value.model.sn) {
                    sns.push(value.model.sn);
                }
            });
        }
        if (sns.length === 0) return;
        const game = this.roomService.game;
        game.emitter.on(EventType.SEND_FURNITURE_REQUIREMENTS, this.onElementUnfrozenStateHandler, this);
        const mgr = game.getDataMgr<BaseDataManager>(DataMgrType.BaseMgr);
        mgr.query_FURNITURE_UNFROZEN_REQUIREMENTS(sns);
    }
    protected onElementUnfrozenStateHandler(maps: Map<string, op_client.ICountablePackageItem[]>) {
        const bag = this.roomService.game.user.userData.playerBag;
        maps.forEach((value, key) => {
            const eles: Element[] = this.getElementsBySN(ElementStateType.UNFROZEN, key);
            let repair = true;
            for (const item of value) {
                const count = bag.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, item.id, item.subcategory);
                if (item.neededCount > count) repair = false;
            }
            for (const ele of eles) {
                ele.showTopDisplay(repair ? ElementStateType.REPAIR : ElementStateType.UNFROZEN);
            }
        });
    }

    protected getElementsBySN(type: ElementStateType, sn: string) {
        const map = this.getMap(type);
        const eles: Element[] = [];
        map.forEach((temp) => {
            if (temp && temp.model && temp.model.sn === sn) {
                eles.push(temp);
            }
        });
        return eles;
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    protected getFrozenType(sprite: ISprite) {
        let frozenType;
        const arr = sprite.attrs;
        if (arr) {
            arr.forEach((value) => {
                if (value.key === "frozenType") {
                    frozenType = value.value;
                }
            });
        }
        return frozenType;
    }
}
