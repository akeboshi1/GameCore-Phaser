export default class RoleAvatarModelVO {
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
        return [this.body_base_id, this.body_spec_id, this.body_wing_id, this.body_tail_id, this.body_cost_id, this.farm_base_id,
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

    public changeAvatarModelByModeVO(value: RoleAvatarModelVO): void {
        if (value.body_base_id >= 0)
            this.body_base_id = value.body_base_id;
        if (value.body_spec_id >= 0)
            this.body_spec_id = value.body_spec_id;
        if (value.body_wing_id >= 0)
            this.body_wing_id = value.body_wing_id;
        if (value.body_tail_id >= 0)
            this.body_tail_id = value.body_tail_id;
        if (value.body_cost_id >= 0)
            this.body_cost_id = value.body_cost_id;
        if (value.farm_base_id >= 0)
            this.farm_base_id = value.farm_base_id;
        if (value.farm_spec_id >= 0)
            this.farm_spec_id = value.farm_spec_id;
        if (value.farm_cost_id >= 0)
            this.farm_cost_id = value.farm_cost_id;
        if (value.barm_base_id >= 0)
            this.barm_base_id = value.barm_base_id;
        if (value.barm_spec_id >= 0)
            this.barm_spec_id = value.barm_spec_id;
        if (value.barm_cost_id >= 0)
            this.barm_cost_id = value.barm_cost_id;
        if (value.bleg_base_id >= 0)
            this.bleg_base_id = value.bleg_base_id;
        if (value.bleg_spec_id >= 0)
            this.bleg_spec_id = value.bleg_spec_id;
        if (value.bleg_cost_id >= 0)
            this.bleg_cost_id = value.bleg_cost_id;
        if (value.fleg_base_id >= 0)
            this.fleg_base_id = value.fleg_base_id;
        if (value.fleg_spec_id >= 0)
            this.fleg_spec_id = value.fleg_spec_id;
        if (value.fleg_cost_id >= 0)
            this.fleg_cost_id = value.fleg_cost_id;
        if (value.head_base_id >= 0)
            this.head_base_id = value.head_base_id;
        if (value.head_hair_id >= 0)
            this.head_hair_id = value.head_hair_id;
        if (value.head_hats_id >= 0)
            this.head_hats_id = value.head_hats_id;
        if (value.head_spec_id >= 0)
            this.head_spec_id = value.head_spec_id;
        if (value.farm_shld_id >= 0)
            this.farm_shld_id = value.farm_shld_id;
        if (value.farm_weap_id >= 0)
            this.farm_weap_id = value.farm_weap_id;
    }
}