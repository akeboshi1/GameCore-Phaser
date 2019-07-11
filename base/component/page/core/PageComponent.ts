import {IPageComponent} from "../interfaces/IPageComponent";
import {VisualComponent} from "../../../VisualComponent";
import {UI} from "../../../../Assets";

export class PageComponent extends VisualComponent implements IPageComponent {
    private m_CurIndex: number;
    private m_MaxIndex: number;

    private m_FirstBtn: Phaser.Button;
    private m_LeftBtn: Phaser.Button;
    private m_RightBtn: Phaser.Button;
    private m_LastBtn: Phaser.Button;

    private m_FirstBtnPath: string;
    private m_LeftBtnPath: string;
    private m_RightBtnPath: string;
    private m_LastBtnPath: string;

    private m_Text: Phaser.Text;
    private m_FirstBtnX: number;
    private m_FirstBtnY: number;
    private m_LeftBtnX: number;
    private m_LeftBtnY: number;
    private m_RightBtnX: number;
    private m_RightBtnY: number;
    private m_LastBtnX: number;
    private m_LastBtnY: number;
    private m_Param: any = {
        hadTxt: false,
        isFlip: true,
        FirstBtnPath: "",
        LeftBtnPath: UI.PageBt.getName(),
        RightBtnPath: UI.PageBt.getName(),
        LastBtnPath: "",
        FirstBtnX: 0,
        FirstBtnY: 0,
        LeftBtnX: 0,
        LeftBtnY: 0,
        RightBtnX: 0,
        RightBtnY: 0,
        LastBtnX: 0,
        LastBtnY: 0
    };

    constructor( game: Phaser.Game, param?: any ) {
        super( game );
        if (param) {
            let value: any;
            for (let key in param) {
                value = param[key];
                if (value) {
                    this.m_Param[key] = value;
                }
            }
        }
        this.preInit();
        this.init();
    }

    public get isFlip(): boolean {
        return this.m_Param.isFlip;
    }

    public get hadTxt(): boolean {
        return this.m_Param.hadTxt;
    }

    protected preInit(): void {
        this.m_FirstBtnPath = this.m_Param.FirstBtnPath;
        this.m_LeftBtnPath = this.m_Param.LeftBtnPath;
        this.m_RightBtnPath = this.m_Param.RightBtnPath;
        this.m_LastBtnPath = this.m_Param.LastBtnPath;
        this.m_FirstBtnX = this.m_Param.FirstBtnX;
        this.m_FirstBtnY = this.m_Param.FirstBtnX;
        this.m_LeftBtnX = this.m_Param.LeftBtnX;
        this.m_LeftBtnY = this.m_Param.LeftBtnY;
        this.m_RightBtnX = this.m_Param.RightBtnX;
        this.m_RightBtnY = this.m_Param.RightBtnY;
        this.m_LastBtnX = this.m_Param.LastBtnX;
        this.m_LastBtnY = this.m_Param.LastBtnY;
        this.m_CurIndex = 1;
        this.m_MaxIndex = 1;
    }

    protected init(): void {
        if (this.m_FirstBtnPath) {
            this.m_FirstBtn = this.game.make.button(this.m_FirstBtnX, this.m_FirstBtnY, this.m_FirstBtnPath, null, this
                , 0, 0 , 0);
            this.add(this.m_FirstBtn);
        }
        if (this.m_LeftBtnPath) {
            this.m_LeftBtn = this.game.make.button(this.m_LeftBtnX, this.m_LeftBtnY, this.m_LeftBtnPath, null, this
                , 0, 0 , 0);
            this.add(this.m_LeftBtn);
        }
        if (this.hadTxt) {
            this.m_Text = new Phaser.Text(this.game, 0, 80, "");
        }
        if (this.m_RightBtnPath) {
            this.m_RightBtn = this.game.make.button(this.m_RightBtnX, this.m_RightBtnY, this.m_RightBtnPath, null, this
                , 0, 0 , 0);
            if (this.isFlip) {
                this.m_RightBtn.scale.x = -1;
            }
            this.add(this.m_RightBtn);
        }
        if (this.m_LastBtnPath) {
            this.m_LastBtn = this.game.make.button(this.m_LastBtnX, this.m_LastBtnY, this.m_LastBtnPath, null, this
                , 0, 0 , 0);
            this.add(this.m_LastBtn);
        }

        if (this.m_FirstBtn) {
            this.m_FirstBtn.onInputDown.add(this.onFirstHandle, this);
        }
        if (this.m_LeftBtn) {
            this.m_LeftBtn.onInputDown.add(this.onLeftHandle, this);
        }
        if (this.m_RightBtn) {
            this.m_RightBtn.onInputDown.add(this.onRightHandle, this);
        }
        if (this.m_LastBtn) {
            this.m_LastBtn.onInputDown.add(this.onLastHandle, this);
        }
    }

    protected onFirstHandle(): any {
        this.setCurIndex(1);
    }

    protected onLeftHandle(): any {
        let temp: number = this.curIndex;
        --temp;
        this.setCurIndex(temp);
    }

    protected onRightHandle(): any {
        let temp: number = this.curIndex;
        ++temp;
        this.setCurIndex(temp);
    }

    protected onLastHandle(): any {
        this.setCurIndex(this.maxIndex);
    }

    public get curIndex(): number {
        return this.m_CurIndex;
    }

    public get maxIndex(): number {
        return this.m_MaxIndex;
    }

    public onClear(): void {
    }

    public onDispose() {
        this.m_FirstBtn.onInputDown.remove( this.onFirstHandle , this);
        this.m_LeftBtn.onInputDown.remove( this.onLeftHandle , this);
        this.m_RightBtn.onInputDown.remove( this.onRightHandle , this);
        this.m_LastBtn.onInputDown.remove( this.onLastHandle , this);
        for ( let name in this.signals ) {
            this.signals[name].removeAll( this );
            delete this.signals[name];
        }
    }

    public setCurIndex(index: number): void {
        if ( index <= 0 ) index = 1;
        if ( this.maxIndex > 0 && index > this.maxIndex ) index = this.maxIndex;
        this.m_CurIndex = index;
        if ( this.m_Text ) this.m_Text.text = index + "/" + this.maxIndex;
        this.emit("change", this.curIndex) ;
    }

    public setMaxIndex(index: number): void {
        this.m_MaxIndex = index;
    }

    public setPagePolicy(needHide: boolean, needLoop: boolean): void {
    }

}