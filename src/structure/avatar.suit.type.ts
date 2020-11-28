import { op_gameconfig } from "pixelpai_proto";
import { IAvatar } from "./dragonbones";
export class AvatarSuitType {
    static avatarSuit: AvatarSuitType;
    static createAvatar(suits: AvatarSuit[], avatar?: op_gameconfig.Avatar) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || new op_gameconfig.Avatar();
        for (const suit of suits) {
            const suitType = this.avatarSuit;
            const slots = suitType[suit.suit_type];
            for (const slot of slots) {
                avatar[slot] = suit.sn;
            }
        }
        return avatar;
    }

    static createAvatarBySn(suit_type: string, sn: string, avatar?: op_gameconfig.Avatar) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || new op_gameconfig.Avatar();
        const suitType = this.avatarSuit;
        const slots = suitType[suit_type];
        for (const slot of slots) {
            avatar[slot] = sn;
        }
        return avatar;
    }

    static createHasBaseAvatar(suits: AvatarSuit[]) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar = this.createBaseAvatar();
        for (const suit of suits) {
            const suitType = this.avatarSuit;
            const slots = suitType[suit.suit_type];
            for (const slot of slots) {
                avatar[slot] = suit.sn;
            }
        }
        return avatar;
    }

    static createHasBaseAvatarBySn(suit_type: string, sn: string) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar = this.createBaseAvatar();
        const suitType = this.avatarSuit;
        const slots = suitType[suit_type];
        for (const slot of slots) {
            avatar[slot] = sn;
        }
        return avatar;
    }

    static createBaseAvatar() {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar = new op_gameconfig.Avatar(this.avatarSuit.baseSlots);
        return avatar;
    }
    public costume = ["bodyCostId", "bodyDresId", "farmCostId", "barmCostId", "flegCostId", "blegCostId"];
    public hair = ["headHairId", "headBackId"];
    public eye = ["headEyesId"];
    public mouse = ["headMousId"];
    public hat = ["headHatsId"];
    public mask = ["headMaskId"];
    public face = ["headFaceId"];
    public weapon = ["farmWeapId", "barmWeapId"];
    public shield = ["farmShldId", "barmShldId"];
    public tail = ["bodyTailId"];
    public wing = ["bodyWingId"];
    public helmet = ["headSpecId"];
    public shell = ["bodySpecId", "farmSpecId", "barmSpecId", "flegSpecId", "blegSpecId"];
    public baseSlots: IAvatar = {
        id: "10000",
        barmBaseId: "0001",
        blegBaseId: "0001",
        bodyBaseId: "0001",
        farmBaseId: "0001",
        flegBaseId: "0001",
        headBaseId: "0001",
        headHairId: "5cd28238fb073710972a73c2",
        headEyesId: "5cd28238fb073710972a73c2",
        headMousId: "5cd28238fb073710972a73c2",
        bodyCostId: "5cd28238fb073710972a73c2"
    };
    public baseSuitType = `[{"count":1,"id":"10001","sn":"5cd28238fb073710972a73c2","suit_type":"costume"},{"count":1,"id":"10002","sn":"5cd28238fb073710972a73c2","suit_type":"eye"},{"count":1,"id":"1003","sn":"5cd28238fb073710972a73c2","suit_type":"hair"},{"count":1,"id":"10004","sn":"5cd28238fb073710972a73c2","suit_type":"mouse"}]`;
}
export class SuitAlternativeType {
    public static suitAlternative: SuitAlternativeType;
    public static checkAlternative(target: string, source: string) {
        this.suitAlternative = this.suitAlternative || new SuitAlternativeType();
        const maskType: number = this.suitAlternative[target];
        const sourceType: number = this.suitAlternative[source];
        const value = maskType & sourceType;
        return value === maskType || value === sourceType;
    }
    public costume = 0x000001;
    public hair = 0x000002;
    public eye = 0x000004;
    public mouse = 0x000008;
    public hat = 0x000010;
    public mask = 0x000020;
    public face = 0x000040;
    public weapon = 0x000080;
    public shield = 0x000100;
    public tail = 0x000200;
    public wing = 0x000400;
    public helmet = 0x0007e;
    public shell = 0x000601;
}
export interface AvatarSuit {
    id: string;
    sn: string;
    suit_type: string;
}
