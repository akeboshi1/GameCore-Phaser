import {IPageComponent} from "../interfaces/IPageComponent";
import {VisualComponent} from "../../../VisualComponent";

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

    constructor( game: Phaser.Game ) {
        super( game );
        this.preInit();
        this.init();
    }

    protected preInit(): void {
        this.m_FirstBtnPath = "";
        this.m_LeftBtnPath = "";
        this.m_RightBtnPath = "";
        this.m_LastBtnPath = "";
    }

    protected init(): void {
        this.m_FirstBtn = new Phaser.Button(this.game, 0, 0, this.m_FirstBtnPath);
        this.m_LeftBtn = new Phaser.Button(this.game, 50, 0, this.m_LeftBtnPath);
        this.m_Text = new Phaser.Text(this.game, 0, 80, "");
        this.m_RightBtn = new Phaser.Button(this.game, 130, 0, this.m_RightBtnPath);
        this.m_LastBtn = new Phaser.Button(this.game, 180, 0, this.m_LastBtnPath);

        this.m_FirstBtn.onInputDown.add( this.onFirstHandle , this);
        this.m_LeftBtn.onInputDown.add( this.onLeftHandle , this);
        this.m_RightBtn.onInputDown.add( this.onRightHandle , this);
        this.m_LastBtn.onInputDown.add( this.onLastHandle , this);
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
        this.removeAll(true);
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
    }

    public setPagePolicy(needHide: boolean, needLoop: boolean): void {
    }

}