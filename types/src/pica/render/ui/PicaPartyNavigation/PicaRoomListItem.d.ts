export declare class PicaRoomListItem extends Phaser.GameObjects.Container {
    roomData: any;
    private key;
    private dpr;
    private bg;
    private roomName;
    private imagIcon;
    private ownerName;
    private playerCount;
    constructor(scene: Phaser.Scene, key: string, dpr: number);
    setRoomData(data: any): void;
}
