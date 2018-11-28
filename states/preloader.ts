import {Atlases, Avatar, UI} from "../Assets";
import * as Assets from "../Assets";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../protocol/protocols";
import Globals from "../Globals";
export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        this.loadImages();
        this.loadJsons();
        this.loadAtlases();
        this.loadAvatar();
    }

    public init(): void {
        // Setup your loading screen and preload sprite (if you want a loading progress indicator) here

        this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadBar);
        this.preloadBarSprite.anchor.setTo(0, 0.5);
        this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;

        this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadFrame);
        this.preloadFrameSprite.anchor.setTo(0.5);

        this.game.load.setPreloadSprite(this.preloadBarSprite);

    }

    public create(): void {
        this.startGame();
    }

    private loadImages(): void {
        this.game.load.image(UI.ImageBg.getName(), UI.ImageBg.getPNG());
        this.game.load.image(UI.ImageMenuBag.getName(), UI.ImageMenuBag.getPNG());
    }

    private loadJsons(): void {
        // for (let i of Assets.Jsons.JsonMap.getLoadList()) {
        //     this.game.load.json(i + "_json", Assets.Jsons.JsonMap.getJSON(i));
        // }
    }

    private loadAtlases() {
        this.game.load.spritesheet(UI.SpriteSheetsCloseBtn.getName(), UI.SpriteSheetsCloseBtn.getPNG(), UI.SpriteSheetsCloseBtn.getFrameWidth(), UI.SpriteSheetsCloseBtn.getFrameHeight(), UI.SpriteSheetsCloseBtn.getFrameMax());
        this.game.load.spritesheet(UI.SpriteSheetsBlueBtn.getName(), UI.SpriteSheetsBlueBtn.getPNG(), UI.SpriteSheetsBlueBtn.getFrameWidth(), UI.SpriteSheetsBlueBtn.getFrameHeight(), UI.SpriteSheetsBlueBtn.getFrameMax());
    }

    private loadAvatar(): void {
        this.game.load.binary(Assets.Avatar.AvatarBone.getSkeName(), Assets.Avatar.AvatarBone.getSkeUrl());
    }

    private startGame(): void {
        this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadTitle(): void {
        Globals.SocketManager.addHandler(new Handler(this.game));
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
        Globals.SocketManager.send(pkt);
    }
}

class Handler extends PacketHandler {
    private game: Phaser.Game;
    constructor( game: Phaser.Game ) {
        super();
        this.game = game;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.handleSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onErrorHandler);
    }

    private onErrorHandler(packet: PBpacket) {
        let err: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(`error[${err.responseStatus}]: ${err.msg}`);
    }

    private handleSelectCharacter(packet: PBpacket): void {
        this.game.state.start("selectrole");
    }
}
