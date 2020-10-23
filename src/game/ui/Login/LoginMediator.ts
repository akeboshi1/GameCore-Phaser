import { RENDER_PEER } from "structureinterface";
import { Logger } from "../../../utils/log";
import { Game } from "../../game";
import { BasicMediator } from "../basic/basic.mediator";

export class LoginMediator extends BasicMediator {
    public static NAME: string = "Login";
    private verifiedEnable: boolean = false;
    constructor(game: Game) {
        super(game);
    }

    show() {
        //    this.game.peer.remote[RENDER_PEER].Render.showLogin();
        this.__exportProperty(() => {
            // this.mCreateRole = new CreateRole(this.game);
            // this.mCreateRole.start();
            this.game.renderPeer.showLogin();
        });
    }

    login(phone, code, areaCode) {
        this.onLoginHandler(phone, code, areaCode);
    }

    destroy() {
        super.destroy();
    }

    public onFetchCodeHandler(phone: string, areaCode: string) {
        this.game.httpService.requestPhoneCode(phone, areaCode);
    }

    public enterGame(adult: boolean) {
        this.game.peer.httpClockEnable(!adult);
        if (adult) {
            this.destroy();
            this.game.loginEnterWorld();
            return;
        }
        this.game.httpClock.allowLogin(() => { this.game.peer.remote[RENDER_PEER].Render.setInputVisible(true); })
            .then((allow: boolean) => {
                if (allow) {
                    this.destroy();
                    this.game.loginEnterWorld();
                } else {
                    this.game.peer.remote[RENDER_PEER].Render.setInputVisible(false);
                }
            })
            .catch((err) => {
                this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    public onLoginHandler(phone: string, code: string, areaCode: string) {
        this.game.peer.remote[RENDER_PEER].Render.setLoginEnable(true);
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.game.peer.remote[RENDER_PEER].Render.setAccount(data);
                // localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // const verifiedEnable = CONFIG["verified_enable"];
                if (this.verifiedEnable !== undefined && this.verifiedEnable === false) {
                    this.enterGame(!this.verifiedEnable);
                    return;
                }
                if (data.hasIdentityInfo) {
                    this.enterGame(data.adult);
                } else {
                    // TODO
                    this.game.peer.remote[RENDER_PEER].Render.setInputVisible(false);
                    this.onShowVerified();
                }

            } else if (response.code >= 400) {
                this.onLoginErrorHanler(response.msg || "服务器错误");
            }
            this.game.peer.remote[RENDER_PEER].Render.setLoginEnable(true);
        });
    }

    public onShowVerified() {
        this.game.peer.remote[RENDER_PEER].Render.onShowVerified();
    }

    public onShowErrorHandler(error, okText?: string) {
        this.game.peer.remote[RENDER_PEER].Render.onShowErrorHandler(error, okText);
    }

    public onLoginErrorHanler(error: string, okText?: string) {
        this.game.peer.remote[RENDER_PEER].Render.setInputVisible(false);
        this.game.peer.remote[RENDER_PEER].Render.onLoginErrorHanler(error, okText);
    }

    public onVerifiedHandler(name: string, idcard: string) {
        this.game.httpService.verified(name, idcard).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201 || code === 0) {
                // this.enterGame(data.adult);
                this.enterGame(true);
            } else if (code === 10001 || code >= 400) {
                // 验证失败
                this.game.peer.remote[RENDER_PEER].Render.setVerifiedEnable(false);
                this.onShowErrorHandler("[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]", "重新认证");
            }
        });
    }
}
