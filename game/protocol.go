package game

// === Client -> Server Messages ===

type ClientMessage struct {
	Type     string   `json:"type"`
	Keys     *KeyState `json:"keys,omitempty"`
	SkillID  string   `json:"skill_id,omitempty"`
	TargetX  float64  `json:"target_x,omitempty"`
	TargetY  float64  `json:"target_y,omitempty"`
	Hero     string   `json:"hero,omitempty"`
	Name     string   `json:"name,omitempty"`
	EquipID  string   `json:"equip_id,omitempty"` // for equip/unequip
	Slot     string   `json:"slot,omitempty"`      // for unequip
}

type KeyState struct {
	W bool `json:"w"`
	A bool `json:"a"`
	S bool `json:"s"`
	D bool `json:"d"`
}

type ClientMessage_Move struct {
	TargetX float64 `json:"target_x"`
	TargetY float64 `json:"target_y"`
}

type ClientMessage_Mouse struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// === Server -> Client Messages ===

type ServerMessage struct {
	Type         string           `json:"type"`
	Tick         uint64           `json:"tick,omitempty"`
	Players      []PlayerState    `json:"players,omitempty"`
	Enemies      []EnemyState     `json:"enemies,omitempty"`
	Effects      []EffectState    `json:"effects,omitempty"`
	DamageNums   []DamageNumber   `json:"damage_nums,omitempty"`
	PlayerID     string           `json:"player_id,omitempty"`
	MapWidth     float64          `json:"map_width,omitempty"`
	MapHeight    float64          `json:"map_height,omitempty"`
	Wave         int              `json:"wave,omitempty"`
	Drops        []GroundDrop     `json:"drops,omitempty"`
	EventName    string           `json:"event,omitempty"`
	EventData    map[string]interface{} `json:"event_data,omitempty"`
}

type PlayerState struct {
	ID        string            `json:"id"`
	Hero      string            `json:"hero"`
	Name      string            `json:"name"`
	X         float64           `json:"x"`
	Y         float64           `json:"y"`
	HP        int               `json:"hp"`
	MaxHP     int               `json:"max_hp"`
	MP        int               `json:"mp"`
	MaxMP     int               `json:"max_mp"`
	Facing    string            `json:"facing"`
	Angle     float64           `json:"angle"`
	Anim      string            `json:"anim"`
	AnimFrame int               `json:"anim_frame"`
	Level     int               `json:"level"`
	Skills    map[string]SkillState  `json:"skills"`
	Attrs     Attributes            `json:"attrs"`
	Equipped  map[string]*Equipment `json:"equipped,omitempty"`
	Inventory []*Equipment          `json:"inventory,omitempty"`
}

type SkillState struct {
	CdRemain float64 `json:"cd_remain"`
	MaxCd    float64 `json:"max_cd"`
}

type EnemyState struct {
	ID       string  `json:"id"`
	Kind     string  `json:"kind"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	HP       int     `json:"hp"`
	MaxHP    int     `json:"max_hp"`
	Anim     string  `json:"anim"`
	Facing   string  `json:"facing"`
}

type EffectState struct {
	ID       string             `json:"id"`
	Kind     string             `json:"kind"`
	X        float64            `json:"x"`
	Y        float64            `json:"y"`
	Age      float64            `json:"age"`
	Duration float64            `json:"duration"`
	Params   map[string]float64 `json:"params"`
}

type DamageNumber struct {
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Value int     `json:"value"`
	Crit  bool    `json:"crit"`
}
