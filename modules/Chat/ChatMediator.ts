import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client, op_gameconfig, op_gameconfig_01, op_virtual_world} from "pixelpai_proto";
import {MessageType} from "../../common/const/MessageType";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT;

export class ChatMediator extends MediatorBase {
    private get view(): ChatView {
        return this.viewComponent as ChatView;
    }

    public onRegister(): void {
        Globals.MessageCenter.on(MessageType.CHAT_TO, this.onHandleChat, this);
        /// never start
        Globals.MessageCenter.on(MessageType.QCLOUD_AUTH, this.onHandleQcloudAuth, this);
        Globals.MessageCenter.on(MessageType.SCENE_CHANGE_TO, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.on(MessageType.ENTER_SCENE, this.onHandleChangeChatRoom, this);
        /// never end
        this.view.bt.on("up", this.onHandleBt, this);
        this.view.input_tf.focusIn.add(this.onFocusIn, this);
        this.view.input_tf.focusOut.add(this.onFocusOut, this);

        (<any>this.view.input_tf).domElement.element.addEventListener("keydown", this.sayHello.bind(this));
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.ONE, this.handleOne, this);
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.TWO, this.handleTwo, this);
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.THREE, this.handleThree, this);
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.FOUR, this.handleFour, this);
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.FIVE, this.handleFive, this);
        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.SIX, this.handleSix, this);

        super.onRegister();
    }

    private sayHello(event) {
        if (event.keyCode === Phaser.Keyboard.ENTER) {
            this.onHandleBt();
        }
    }

    private onFocusIn(): void {
    }

    private onFocusOut(): void {
    }

    private onHandleChangeChatRoom(): void {
        this.view.exitRoom();
        this.view.playerId = Globals.DataCenter.PlayerData.mainPlayerInfo.id;
        this.view.roomId = Globals.DataCenter.PlayerData.mainPlayerInfo.sceneId;
        this.view.sendGenAuthBuffer();
    }

    private handleOne(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();

        let txt: op_gameconfig_01.Text = new op_gameconfig_01.Text();
        txt.text = "选择角色";
        let txt1: op_gameconfig_01.Text = new op_gameconfig_01.Text();
        txt1.text = "从前有座山山上有座庙，庙里有和尚来？";
        param.text = [txt, txt1];

        Globals.ModuleManager.openModule(ModuleTypeEnum.CONTROLF, param);
    }

    private handleTwo(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();

        param.display = ["lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.png"];

        let animation: op_gameconfig.Animation = new op_gameconfig.Animation();
        animation.baseLoc = "-102,-149";
        animation.collisionArea = "1,1,1,1&1,1,1,1&1,1,1,1&1,1,1,1";
        animation.frame = [0];
        animation.frameRate = 12;
        animation.name = "idle";
        animation.originPoint = [3, 3];
        animation.walkOriginPoint = [3, 3];
        animation.walkableArea = "1,0,0,1&0,0,0,0&0,0,0,0&0,0,0,1";

        let txt: op_gameconfig_01.Text = new op_gameconfig_01.Text();
        txt.text = "这是个炸弹,从前有座山山上有座庙，庙里有和尚来讲故事，我们速度快没时间啊啊啦访问量可问撒旦法文峰";
        param.text = [txt];
        let bt: op_gameconfig_01.Button = new op_gameconfig_01.Button();
        bt.text = "获取";
        param.button = [bt];

        Globals.ModuleManager.openModule(ModuleTypeEnum.ITEMDETAIL, param);
    }

    private handleThree(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();

        let actor: op_client.Actor = new op_client.Actor();
        actor.id = 1;
        actor.name = "剧本角色";
        let avatar: op_gameconfig.Avatar = new op_gameconfig.Avatar();
        avatar.id = "10000";
        avatar.bodyBaseId = avatar.farmBaseId = avatar.barmBaseId = avatar.blegBaseId = avatar.flegBaseId = avatar.headBaseId = avatar.headEyesId = "0001";
        avatar.bodyCostId = avatar.farmCostId = avatar.barmCostId = avatar.blegCostId = avatar.flegCostId = avatar.headHairId = "0005";
        actor.avatar = avatar;
        param.actors = [actor, actor, actor, actor, actor, actor, actor, actor];

        let bt: op_gameconfig_01.Button = new op_gameconfig_01.Button();
        bt.text = "确认投票";
        param.button = [bt];

        param.time = [500];

        Globals.ModuleManager.openModule(ModuleTypeEnum.VOTE, param);
    }

    private handleFour(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();

        let actor: op_client.Actor = new op_client.Actor();
        actor.id = 1;
        actor.name = "剧本角色";
        actor.camp = "真凶";
        let avatar: op_gameconfig.Avatar = new op_gameconfig.Avatar();
        avatar.id = "10000";
        avatar.bodyBaseId = avatar.farmBaseId = avatar.barmBaseId = avatar.blegBaseId = avatar.flegBaseId = avatar.headBaseId = avatar.headEyesId = "0001";
        avatar.bodyCostId = avatar.farmCostId = avatar.barmCostId = avatar.blegCostId = avatar.flegCostId = avatar.headHairId = "0005";
        actor.avatar = avatar;

        let actor1: op_client.Actor = new op_client.Actor();
        actor1.id = 2;
        actor1.name = "剧本角色";
        actor1.camp = "假凶";
        actor1.avatar = avatar;
        param.actors = [actor1, actor, actor1, actor1, actor1, actor, actor1, actor1];

        let txt: op_gameconfig_01.Text = new op_gameconfig_01.Text();
        txt.text = "从前有座山山上有座庙，庙里有和尚来讲故事，我们速度快没时间啊啊啦访问量可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡我们速度快没时间啊啊啦访问量" +
            "可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大" +
            "可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大" +
            "可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大" +
            "可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大" +
            "可问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大" +
            "三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡问撒旦法文峰，斯蒂芬第三方斯蒂芬森大三打打飞机撒富士达撒打飞机爱舒服卡";
        param.text = [txt];

        param.data = [0, 3, 0, 0, 5, 0, 0, 0];

        Globals.ModuleManager.openModule(ModuleTypeEnum.VOTERESULT, param);
    }

    private handleFive(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
        param.id = 1;
        Globals.ModuleManager.openModule(ModuleTypeEnum.STORAGE, param);
    }

    private handleSix(): void {
    }


    public onRemove(): void {
        Globals.MessageCenter.cancel(MessageType.CHAT_TO, this.onHandleChat, this);
        Globals.MessageCenter.cancel(MessageType.QCLOUD_AUTH, this.onHandleQcloudAuth, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_CHANGE_TO, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.cancel(MessageType.ENTER_SCENE, this.onHandleChangeChatRoom, this);
        this.view.bt.cancel("up", this.onHandleBt);
        this.view.input_tf.focusIn.remove(this.onFocusIn, this);
        this.view.input_tf.focusOut.remove(this.onFocusOut, this);

        (<any>this.view.input_tf).domElement.element.removeEventListener("keydown", this.sayHello.bind(this));

        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.ONE, this.handleOne, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.TWO, this.handleTwo, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.THREE, this.handleThree, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.FOUR, this.handleFour, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.FIVE, this.handleFive, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.SIX, this.handleSix, this);
        super.onRemove();
    }

    private onHandleChat(chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT): void {
        this.view.out_tf.text += chat.chatContext + "\n";
        this.view.scroller.scroll();
    }

    private onHandleQcloudAuth(authBuffer: string): void {
        this.view.authBuffer = authBuffer;
    }

    private onHandleBt(): void {
        if (this.view.inputValue === "") {
            return;
        }
        this.view.input_tf.endFocus();
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
        let content: IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
        content.chatChannel = 0;
        content.chatContext = this.view.inputValue;
        this.view.inputValue = "";
        Globals.SocketManager.send(pkt);
        this.view.input_tf.startFocus();
    }
}
