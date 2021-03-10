import { BasicMediator, Game } from "gamecore";
import { GameState, ModuleName } from "structure";
import { Logger } from "utils";

export class PicaBootMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICA_BOOT_NAME, game);
    }

    showLogin() {
        this.game.showMediator(ModuleName.PICA_LOGIN_NAME, true);
    }

    enterGame() {
        this.game.loginEnterWorld();
    }

    show(param?: any): void {
        if (param) this.mShowData = param;
        if (this.mPanelInit && this.mShow) {
            this._show();
            return;
        }
        this.mShow = true;
        this.__exportProperty(async () => {
            await this.referToken();
            this.game.peer.render.showPanel(this.key, param).then(() => {
                this.mView = this.game.peer.render[this.key];
                this.panelInit();
            });
            this.mediatorExport();
        });
    }

    async referToken() {
        const token = await this.game.peer.render.getLocalStorage("token");
        const account = token ? JSON.parse(token) : null;
        if (!account || !account.accessToken) {
            this.showLogin();
            return;
        }
        this.game.peer.state = GameState.RequestToken;
        // this.peer.render[ModuleName.].then((account) => {
        this.game.httpService.refreshToekn(account.refreshToken, account.accessToken)
            .then((response: any) => {
                this.game.peer.state = GameState.GetToken;
                if (response.code === 200) {
                    this.game.peer.render.refreshAccount(response);
                    // this.mAccount.refreshToken(response);
                    // this.loginEnterWorld();
                } else {
                    this.showLogin();
                }
            }).catch((error) => {
                this.game.peer.state = GameState.GetToken;
                Logger.getInstance().error("refreshToken:", error);
                this.game.login();
            });
    }

    public enterWorld(adult: boolean) {
        this.game.peer.httpClockEnable(!adult);
        if (adult) {
            this.destroy();
            this.game.loginEnterWorld();
            return;
        }
        this.game.httpClock.allowLogin(() => { this.game.renderPeer.setInputVisible(true); })
            .then((allow: boolean) => {
                if (allow) {
                    this.destroy();
                    this.game.loginEnterWorld();
                } else {
                    this.game.renderPeer.setInputVisible(false);
                }
            })
            .catch((err) => {
                // this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    public onLoginHandler(phone: string, code: string, areaCode: string) {
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.loginSuc(response.data);
            }
                // localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // const verifiedEnable = CONFIG["verified_enable"];
            //     if (this.verifiedEnable !== undefined && this.verifiedEnable === false) {
            //         this.enterWorld(!this.verifiedEnable);
            //         return;
            //     }
            //     if (data.hasIdentityInfo) {
            //         this.enterWorld(data.adult);
            //     } else {
            //         // TODO
            //         this.game.renderPeer.setInputVisible(false);
            //         this.onShowVerified();
            //     }

            // } else if (response.code >= 400) {
            //     this.onLoginErrorHanler(response.msg || "服务器错误");
            // }
        });
    }

    private loginSuc(data) {
        this.game.renderPeer.setAccount(data);
    }
}
