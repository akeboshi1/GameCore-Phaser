import {op_gameconfig} from "../../../protocol/protocols";

export default class RoleAvatarModelVO {
    public id: number;
    public dirable: number[];

    public body_base_id: number = 0;
    public body_spec_id: number = 0;
    public body_wing_id: number = 0;
    public body_tail_id: number = 0;
    public body_cost_id: number = 0;

    public farm_base_id: number = 0;
    public farm_spec_id: number = 0;
    public farm_cost_id: number = 0;

    public barm_base_id: number = 0;
    public barm_spec_id: number = 0;
    public barm_cost_id: number = 0;

    public bleg_base_id: number = 0;
    public bleg_spec_id: number = 0;
    public bleg_cost_id: number = 0;

    public fleg_base_id: number = 0;
    public fleg_spec_id: number = 0;
    public fleg_cost_id: number = 0;

    public head_base_id: number = 0;
    public head_hair_id: number = 0;
    public head_hats_id: number = 0;
    public head_spec_id: number = 0;
    public head_eyes_id: number = 0;
    public head_mous_id: number = 0;
    public head_mask_id: number = 0;

    public farm_shld_id: number = 0;
    public farm_weap_id: number = 0;

    public constructor() {
    }

    public get sign(): string {
        return [this.id, this.body_base_id, this.body_spec_id, this.body_wing_id, this.body_tail_id, this.body_cost_id, this.farm_base_id,
            this.farm_spec_id, this.farm_cost_id, this.barm_base_id, this.barm_spec_id, this.barm_cost_id, this.bleg_base_id,
            this.bleg_spec_id, this.bleg_cost_id, this.fleg_base_id, this.fleg_spec_id, this.fleg_cost_id, this.head_base_id,
            this.head_hair_id, this.head_hats_id, this.head_spec_id, this.farm_shld_id, this.farm_weap_id].toString();
    }

    public test(): void {
        this.body_base_id = 1;
        this.body_spec_id = 0;
        this.body_wing_id = 0;
        this.body_tail_id = 0;

        this.farm_base_id = 1;
        this.farm_spec_id = 0;

        this.barm_base_id = 1;
        this.barm_spec_id = 0;

        this.bleg_base_id = 1;
        this.bleg_spec_id = 0;

        this.fleg_base_id = 1;
        this.fleg_spec_id = 0;

        this.head_base_id = 1;
        this.head_hats_id = 0;
        this.head_spec_id = 0;
        this.head_eyes_id = 1;
        this.head_mous_id = 0;
        this.head_mask_id = 0;

        this.farm_shld_id = 0;
        this.farm_weap_id = 0;

        this.body_cost_id = this.farm_cost_id = this.barm_cost_id = this.bleg_cost_id = this.fleg_cost_id = this.head_hair_id = 5;
    }

    public changeAvatarModelByModeVO(value: op_gameconfig.IAvatar): void {
        this.id = value.id;
        this.dirable = value.dirable;

        if (value.bodyBaseId >= 0)
            this.body_base_id = value.bodyBaseId;
        if (value.bodySpecId >= 0)
            this.body_spec_id = value.bodySpecId;
        if (value.bodyWingId >= 0)
            this.body_wing_id = value.bodyWingId;
        if (value.bodyTailId >= 0)
            this.body_tail_id = value.bodyTailId;
        if (value.bodyCostId >= 0)
            this.body_cost_id = value.bodyCostId;
        if (value.farmBaseId >= 0)
            this.farm_base_id = value.farmBaseId;
        if (value.farmSpecId >= 0)
            this.farm_spec_id = value.farmSpecId;
        if (value.farmCostId >= 0)
            this.farm_cost_id = value.farmCostId;
        if (value.barmBaseId >= 0)
            this.barm_base_id = value.barmBaseId;
        if (value.barmSpecId >= 0)
            this.barm_spec_id = value.barmSpecId;
        if (value.barmCostId >= 0)
            this.barm_cost_id = value.barmCostId;
        if (value.blegBaseId >= 0)
            this.bleg_base_id = value.blegBaseId;
        if (value.blegSpecId >= 0)
            this.bleg_spec_id = value.blegSpecId;
        if (value.blegCostId >= 0)
            this.bleg_cost_id = value.blegCostId;
        if (value.flegBaseId >= 0)
            this.fleg_base_id = value.flegBaseId;
        if (value.flegSpecId >= 0)
            this.fleg_spec_id = value.flegSpecId;
        if (value.flegCostId >= 0)
            this.fleg_cost_id = value.flegCostId;
        if (value.headBaseId >= 0)
            this.head_base_id = value.headBaseId;
        if (value.headHairId >= 0)
            this.head_hair_id = value.headHairId;
        if (value.headHatsId >= 0)
            this.head_hats_id = value.headHatsId;
        if (value.headSpecId >= 0)
            this.head_spec_id = value.headSpecId;
        if (value.farmShldId >= 0)
            this.farm_shld_id = value.farmShldId;
        if (value.farmWeapId >= 0)
            this.farm_weap_id = value.farmWeapId;
    }
}