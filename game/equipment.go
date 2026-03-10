package game

import (
	"fmt"
	"math/rand"
)

// Rarity levels
const (
	RarityCommon    = 0 // 白色
	RarityUncommon  = 1 // 绿色
	RarityRare      = 2 // 蓝色
	RarityEpic      = 3 // 紫色
	RarityLegendary = 4 // 橙色
)

var RarityNames = []string{"普通", "优秀", "稀有", "史诗", "传说"}
var RarityColors = []string{"#cccccc", "#44ff44", "#4488ff", "#bb44ff", "#ff8800"}

// Equipment slots
const (
	SlotWeapon  = "weapon"
	SlotArmor   = "armor"
	SlotHelmet  = "helmet"
	SlotBoots   = "boots"
	SlotRing    = "ring"
	SlotAmulet  = "amulet"
)

var AllSlots = []string{SlotWeapon, SlotArmor, SlotHelmet, SlotBoots, SlotRing, SlotAmulet}
var SlotNames = map[string]string{
	SlotWeapon: "武器",
	SlotArmor:  "铠甲",
	SlotHelmet: "头盔",
	SlotBoots:  "战靴",
	SlotRing:   "戒指",
	SlotAmulet: "项链",
}

// Equipment base name templates per slot
var EquipNames = map[string][]string{
	SlotWeapon: {"铁剑", "战斧", "重锤", "长戟", "符文刃", "屠龙剑", "裁决之刃"},
	SlotArmor:  {"皮甲", "锁子甲", "板甲", "龙鳞甲", "圣光铠", "暗影胸甲"},
	SlotHelmet: {"铁盔", "角盔", "王冠", "战争面具", "天罚冠"},
	SlotBoots:  {"布靴", "皮靴", "铁靴", "疾风之靴", "飞行靴"},
	SlotRing:   {"铜戒", "银戒", "金戒", "符文之戒", "龙骨指环"},
	SlotAmulet: {"骨链", "银链", "宝石坠", "星辉项链", "圣者遗物"},
}

// Equipment holds a generated item
type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Slot   string `json:"slot"`
	Rarity int    `json:"rarity"`
	Level  int    `json:"level"`

	// Bonus stats (only non-zero stats matter)
	ATK       int     `json:"atk,omitempty"`
	DEF       int     `json:"def,omitempty"`
	MaxHP     int     `json:"max_hp,omitempty"`
	MaxMP     int     `json:"max_mp,omitempty"`
	ATKSpeed  float64 `json:"atk_speed,omitempty"`
	MoveSpeed float64 `json:"move_speed,omitempty"`
	CritRate  float64 `json:"crit_rate,omitempty"`
	CritDmg   float64 `json:"crit_dmg,omitempty"`
	HPRegen   float64 `json:"hp_regen,omitempty"`
	MPRegen   float64 `json:"mp_regen,omitempty"`
	Armor     int     `json:"armor,omitempty"`
	Dodge     float64 `json:"dodge,omitempty"`
	LifeSteal float64 `json:"life_steal,omitempty"`
	CDReduce  float64 `json:"cd_reduce,omitempty"`
	DmgBonus  float64 `json:"dmg_bonus,omitempty"`
	DmgReduce float64 `json:"dmg_reduce,omitempty"`
}

// GroundDrop is an item lying on the ground
type GroundDrop struct {
	ID       string    `json:"id"`
	Equip    Equipment `json:"equip"`
	Position Vec2      `json:"-"`
	X        float64   `json:"x"`
	Y        float64   `json:"y"`
	Age      float64   `json:"-"` // time on ground
}

// GenerateEquipment creates a random equipment piece
func GenerateEquipment(level int, rarity int) Equipment {
	slot := AllSlots[rand.Intn(len(AllSlots))]
	return GenerateEquipmentForSlot(slot, level, rarity)
}

func GenerateEquipmentForSlot(slot string, level int, rarity int) Equipment {
	names := EquipNames[slot]
	// Higher rarity picks from later names
	nameIdx := rarity
	if nameIdx >= len(names) {
		nameIdx = len(names) - 1
	}
	baseName := names[nameIdx]

	// Rarity multiplier: common=1.0, uncommon=1.5, rare=2.0, epic=3.0, legendary=5.0
	rarityMult := []float64{1.0, 1.5, 2.0, 3.0, 5.0}[rarity]
	levelMult := 1.0 + float64(level-1)*0.15

	e := Equipment{
		ID:     nextID("eq"),
		Name:   fmt.Sprintf("%s", baseName),
		Slot:   slot,
		Rarity: rarity,
		Level:  level,
	}

	// Each slot has primary stats + random bonus stats
	switch slot {
	case SlotWeapon:
		e.ATK = int(float64(10+rand.Intn(8)) * rarityMult * levelMult)
		if rand.Float64() < 0.4 {
			e.CritRate = roundF(float64(1+rand.Intn(3)) * rarityMult * 0.01)
		}
		if rand.Float64() < 0.3 {
			e.CritDmg = roundF(float64(5+rand.Intn(10)) * rarityMult * 0.01)
		}
		if rand.Float64() < 0.2 {
			e.ATKSpeed = roundF(float64(2+rand.Intn(3)) * rarityMult * 0.01)
		}
		if rarity >= RarityEpic && rand.Float64() < 0.5 {
			e.LifeSteal = roundF(float64(1+rand.Intn(3)) * 0.01)
		}

	case SlotArmor:
		e.DEF = int(float64(8+rand.Intn(6)) * rarityMult * levelMult)
		e.MaxHP = int(float64(20+rand.Intn(30)) * rarityMult * levelMult)
		if rand.Float64() < 0.3 {
			e.Armor = int(float64(3+rand.Intn(5)) * rarityMult * levelMult)
		}
		if rand.Float64() < 0.3 {
			e.DmgReduce = roundF(float64(1+rand.Intn(2)) * rarityMult * 0.01)
		}

	case SlotHelmet:
		e.DEF = int(float64(4+rand.Intn(4)) * rarityMult * levelMult)
		e.MaxHP = int(float64(10+rand.Intn(20)) * rarityMult * levelMult)
		if rand.Float64() < 0.4 {
			e.HPRegen = roundF(float64(1+rand.Intn(3)) * rarityMult * levelMult)
		}
		if rand.Float64() < 0.3 {
			e.MPRegen = roundF(float64(1+rand.Intn(2)) * rarityMult * levelMult)
		}

	case SlotBoots:
		e.MoveSpeed = roundF(float64(5+rand.Intn(10)) * rarityMult * levelMult)
		e.Dodge = roundF(float64(1+rand.Intn(2)) * rarityMult * 0.01)
		if rand.Float64() < 0.3 {
			e.DEF = int(float64(2+rand.Intn(3)) * rarityMult * levelMult)
		}

	case SlotRing:
		// Rings are versatile - random offensive stats
		e.ATK = int(float64(3+rand.Intn(5)) * rarityMult * levelMult)
		if rand.Float64() < 0.5 {
			e.CritRate = roundF(float64(1+rand.Intn(3)) * rarityMult * 0.01)
		}
		if rand.Float64() < 0.4 {
			e.DmgBonus = roundF(float64(1+rand.Intn(3)) * rarityMult * 0.01)
		}
		if rand.Float64() < 0.3 {
			e.CDReduce = roundF(float64(1+rand.Intn(3)) * rarityMult * 0.01)
		}

	case SlotAmulet:
		// Amulets give mixed stats
		e.MaxMP = int(float64(5+rand.Intn(10)) * rarityMult * levelMult)
		e.MPRegen = roundF(float64(1+rand.Intn(3)) * rarityMult * levelMult)
		if rand.Float64() < 0.4 {
			e.MaxHP = int(float64(10+rand.Intn(15)) * rarityMult * levelMult)
		}
		if rand.Float64() < 0.3 {
			e.HPRegen = roundF(float64(1+rand.Intn(2)) * rarityMult * levelMult)
		}
		if rand.Float64() < 0.3 {
			e.CDReduce = roundF(float64(1+rand.Intn(2)) * rarityMult * 0.01)
		}
	}

	return e
}

func roundF(v float64) float64 {
	return float64(int(v*100)) / 100
}

// RollDrop determines if an enemy drops equipment and what rarity
func RollDrop(enemyKind string, wave int) *Equipment {
	// Drop chance by enemy type
	dropChance := 0.0
	baseLvl := 1
	switch enemyKind {
	case "skeleton":
		dropChance = 0.12
		baseLvl = 1
	case "orc":
		dropChance = 0.18
		baseLvl = 2
	case "demon":
		dropChance = 0.25
		baseLvl = 3
	case "boss":
		dropChance = 0.80
		baseLvl = 5
	}

	if rand.Float64() > dropChance {
		return nil
	}

	// Level scales with wave
	level := baseLvl + wave/2
	if level > 30 {
		level = 30
	}

	// Roll rarity
	rarity := rollRarity(enemyKind, wave)

	eq := GenerateEquipment(level, rarity)
	return &eq
}

func rollRarity(enemyKind string, wave int) int {
	r := rand.Float64()
	waveBonus := float64(wave) * 0.005 // higher waves = better drops

	switch enemyKind {
	case "boss":
		// Boss always drops at least rare
		if r < 0.05+waveBonus {
			return RarityLegendary
		} else if r < 0.25+waveBonus {
			return RarityEpic
		}
		return RarityRare
	default:
		if r < 0.01+waveBonus*0.5 {
			return RarityLegendary
		} else if r < 0.05+waveBonus {
			return RarityEpic
		} else if r < 0.15+waveBonus {
			return RarityRare
		} else if r < 0.40 {
			return RarityUncommon
		}
		return RarityCommon
	}
}
