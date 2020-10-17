import { RENDER_PEER } from "../../../structureinterface/worker.name";
import { Logger } from "../../../utils/log";
import { Game } from "../../game";
import { BasicMediator } from "../basic/basic.mediator";

export class LoginMediator extends BasicMediator {
    public static NAME: string = "Login";
    private verifiedEnable: boolean = false;
    constructor(private game: Game) {
        super();
    }

    show() {
       this.game.peer.remote[RENDER_PEER].showPanel(LoginMediator.NAME);
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
            this.game.peer.remote[RENDER_PEER].enterGame();
            return;
        }
        this.game.httpClock.allowLogin(() => { this.game.peer.remote[RENDER_PEER].setInputVisible(true); })
            .then((allow: boolean) => {
                if (allow) {
                    this.destroy();
                    this.game.peer.remote[RENDER_PEER].enterGame();
                } else {
                    this.game.peer.remote[RENDER_PEER].setInputVisible(false);
                }
            })
            .catch((err) => {
                this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    public onLoginHandler(phone: string, code: string, areaCode: string) {
        this.game.peer.remote[RENDER_PEER].setLoginEnable(true);
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.game.peer.remote[RENDER_PEER].account.setAccount(data);
                localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // const verifiedEnable = CONFIG["verified_enable"];
                if (this.verifiedEnable !== undefined && this.verifiedEnable === false) {
                    this.enterGame(!this.verifiedEnable);
                    return;
                }
                if (data.hasIdentityInfo) {
                    this.enterGame(data.adult);
                } else {
                    this.game.peer.remote[RENDER_PEER].setInputVisible(false);
                    this.onShowVerified();
                }

            } else if (response.code >= 400) {
                this.onLoginErrorHanler(response.msg || "服务器错误");
            }
            this.game.peer.remote[RENDER_PEER].setLoginEnable(true);
        });
    }

    public onShowVerified() {
        this.game.peer.remote[RENDER_PEER].onShowVerified();
    }

    public onShowErrorHandler(error, okText?: string) {
        this.game.peer.remote[RENDER_PEER].onShowErrorHandler(error, okText);
    }

    public onLoginErrorHanler(error: string, okText?: string) {
        this.game.peer.remote[RENDER_PEER].setInputVisible(false);
        this.game.peer.remote[RENDER_PEER].onLoginErrorHanler(error, okText);
    }

    public onVerifiedHandler(name: string, idcard: string) {
        this.game.httpService.verified(name, idcard).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201 || code === 0) {
                // this.enterGame(data.adult);
                this.enterGame(true);
            } else if (code === 10001 || code >= 400) {
                // 验证失败
                this.game.peer.remote[RENDER_PEER].setVerifiedEnable(false);
                this.onShowErrorHandler("[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]", "重新认证");
            }
        });
    }
}
