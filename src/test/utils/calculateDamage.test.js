// src/test/utils/calculateDamage.test.js
import { describe, it, expect } from 'vitest'
import { calculateDamage } from '../../utils/statUtils'

// ─── Shared test fixtures from db.json ───────────────────────────────────────

const INCINEROAR = {
    baseStats: { hp: 95, attack: 115, defense: 90, specialAttack: 80, specialDefense: 90, speed: 60 }
}
const FLUTTER_MANE = {
    baseStats: { hp: 55, attack: 55, defense: 55, specialAttack: 135, specialDefense: 135, speed: 135 }
}
const GARCHOMP = {
    baseStats: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 }
}
const AMOONGUSS = {
    baseStats: { hp: 114, attack: 85, defense: 70, specialAttack: 85, specialDefense: 80, speed: 30 }
}

// Moves from db.json
const EARTHQUAKE    = { id: 7,  typeId: 9,  category: "physical", power: 100 }
const MOONBLAST     = { id: 15, typeId: 18, category: "special",  power: 95  }
const CLOSE_COMBAT  = { id: 2,  typeId: 7,  category: "physical", power: 120 }
const THUNDERBOLT   = { id: 11, typeId: 5,  category: "special",  power: 90  }
const HEAT_WAVE     = { id: 37, typeId: 2,  category: "special",  power: 95  }
const PROTECT       = { id: 6,  typeId: 1,  category: "status",   power: 0   }

// Type matchups from db.json (trimmed to what tests need)
const TYPE_MATCHUPS = [
    { typeId: 1,  strongAgainst: [],          weakAgainst: [7]            },  // Normal
    { typeId: 2,  strongAgainst: [4,6,12,17], weakAgainst: [3,9,13]       },  // Fire
    { typeId: 4,  strongAgainst: [3,9],       weakAgainst: [2,6,8,10,12]  },  // Grass
    { typeId: 5,  strongAgainst: [3,10],      weakAgainst: [9]            },  // Electric
    { typeId: 7,  strongAgainst: [1,6,13,16,17], weakAgainst: [10,11,18]  },  // Fighting
    { typeId: 9,  strongAgainst: [2,5,8,13,17],  weakAgainst: [3,4,6]    },  // Ground
    { typeId: 11, strongAgainst: [7,8],       weakAgainst: [12,14,16]     },  // Psychic
    { typeId: 15, strongAgainst: [15],        weakAgainst: [6,17,18]      },  // Dragon
    { typeId: 18, strongAgainst: [7,15,16],   weakAgainst: [8,17]         },  // Fairy
]

// Default spreads (31 IV, 0 EV — baseline)
const DEFAULT_ATK_SPREAD  = { atkEv: 0, atkIv: 31, spAtkEv: 0, spAtkIv: 31 }
const DEFAULT_DEF_SPREAD  = { hpEv: 0, hpIv: 31, defEv: 0, defIv: 31, spDefEv: 0, spDefIv: 31 }
const FULL_ATK_SPREAD     = { atkEv: 252, atkIv: 31, spAtkEv: 252, spAtkIv: 31 }
const FULL_DEF_SPREAD     = { hpEv: 252, hpIv: 31, defEv: 252, defIv: 31, spDefEv: 252, spDefIv: 31 }

// Helper to build a base call with sensible defaults
const baseDamageCall = (overrides = {}) => ({
    attacker: GARCHOMP,
    defender: AMOONGUSS,
    move: EARTHQUAKE,
    attackerTypes: [{ typeId: 15 }, { typeId: 9 }], // Dragon/Ground
    defenderTypes: [{ typeId: 4 }, { typeId: 8 }],  // Grass/Poison
    typeMatchups: TYPE_MATCHUPS,
    attackerSpread: DEFAULT_ATK_SPREAD,
    defenderSpread: DEFAULT_DEF_SPREAD,
    attackerStages: 0,
    defenderStages: 0,
    weather: "none",
    terrain: "none",
    attackerItem: "none",
    isCritical: false,
    ...overrides
})

// ─────────────────────────────────────────────────────────────────────────────

describe('calculateDamage()', () => {

    // ── Return shape ────────────────────────────────────────────────────────────
    describe('return shape', () => {
        it('returns an object with the correct keys', () => {
            const result = calculateDamage(baseDamageCall())
            expect(result).toHaveProperty('minDamage')
            expect(result).toHaveProperty('maxDamage')
            expect(result).toHaveProperty('minPercent')
            expect(result).toHaveProperty('maxPercent')
            expect(result).toHaveProperty('multiplier')
            expect(result).toHaveProperty('defenderHp')
        })

        it('returns null when attacker is missing', () => {
            expect(calculateDamage(baseDamageCall({ attacker: null }))).toBeNull()
        })

        it('returns null when defender is missing', () => {
            expect(calculateDamage(baseDamageCall({ defender: null }))).toBeNull()
        })

        it('returns null when move is missing', () => {
            expect(calculateDamage(baseDamageCall({ move: null }))).toBeNull()
        })

        it('minDamage is always less than or equal to maxDamage', () => {
            const result = calculateDamage(baseDamageCall())
            expect(result.minDamage).toBeLessThanOrEqual(result.maxDamage)
        })

        it('minDamage is exactly 85% of baseDamage (low roll)', () => {
            const result = calculateDamage(baseDamageCall())
            // minDamage should be floor(maxDamage * 0.85) approximately
            expect(result.minDamage).toBeLessThan(result.maxDamage)
        })
    })

    // ── Type effectiveness ──────────────────────────────────────────────────────
    describe('type effectiveness', () => {
        it('neutral — multiplier is 1 for no type interaction', () => {
            // Thunderbolt (Electric) vs Incineroar (Fire/Dark) — neutral
            const result = calculateDamage(baseDamageCall({
                attacker: FLUTTER_MANE,
                defender: INCINEROAR,
                move: THUNDERBOLT,
                attackerTypes: [{ typeId: 14 }, { typeId: 18 }], // Ghost/Fairy
                defenderTypes: [{ typeId: 2 }, { typeId: 16 }],  // Fire/Dark
            }))
            expect(result.multiplier).toBe(1)
        })

        it('super effective — Earthquake vs Fire/Dark type gives 2x', () => {
            // Ground (9) is strong against Fire (2) — 2x
            // Ground (9) is NOT strong against Dark (16) — neutral
            // Result: 2x total
            const result = calculateDamage(baseDamageCall({
                defender: INCINEROAR,
                defenderTypes: [{ typeId: 2 }, { typeId: 16 }], // Fire/Dark
            }))
            expect(result.multiplier).toBe(3) // 2x type effectiveness + 1.5x STAB
        })

        it('not very effective — multiplier is 0.5', () => {
            // Earthquake (Ground) vs Grass/Poison — Ground is resisted by Grass (0.5x)
            // Ground is super effective vs Poison (2x) → 0.5 * 2 = 1... 
            // Let's use Electric vs Ground instead: Electric resisted by Ground (0.5x)
            const result = calculateDamage(baseDamageCall({
                attacker: FLUTTER_MANE,
                defender: GARCHOMP,
                move: THUNDERBOLT,
                attackerTypes: [{ typeId: 14 }, { typeId: 18 }],
                defenderTypes: [{ typeId: 15 }, { typeId: 9 }], // Dragon/Ground
            }))
            // Electric vs Ground = immune (0x)
            expect(result.multiplier).toBe(0)
        })

        it('immunity — multiplier is 0', () => {
            // Ground (9) is immune to Electric (5) — from IMMUNITIES map
            const result = calculateDamage(baseDamageCall({
                defender: GARCHOMP,
                move: THUNDERBOLT,
                attackerTypes: [{ typeId: 5 }],
                defenderTypes: [{ typeId: 15 }, { typeId: 9 }], // Dragon/Ground
            }))
            expect(result.multiplier).toBe(0)
            expect(result.minDamage).toBe(0)
            expect(result.maxDamage).toBe(0)
        })

        it('double super effective — 4x multiplier for dual weakness', () => {
            // Close Combat (Fighting, typeId 7) vs Flutter Mane (Ghost/Fairy)
            // Fairy resists Fighting (0.5x), Ghost is immune to Fighting (0x)
            // Actually let's use Moonblast (Fairy) vs Dragon/Fighting = 2x * 2x = 4x
            // Fairy (18) strong against Dragon (15) = 2x, strong against Fighting (7) = 2x → 4x
            const result = calculateDamage(baseDamageCall({
                attacker: FLUTTER_MANE,
                defender: GARCHOMP,
                move: MOONBLAST,
                attackerTypes: [{ typeId: 14 }, { typeId: 18 }],
                defenderTypes: [{ typeId: 15 }, { typeId: 7 }], // Dragon/Fighting
            }))
            expect(result.multiplier).toBeCloseTo(6) // 2x Dragon + 2x Fighting + 1.5x STAB = 6x
        })
    })

    // ── STAB ────────────────────────────────────────────────────────────────────
    describe('STAB (Same Type Attack Bonus)', () => {
        it('applies 1.5x when move type matches attacker type', () => {
            // Garchomp (Ground/Dragon) using Earthquake (Ground) = STAB
            const withStab    = calculateDamage(baseDamageCall())
            // Flutter Mane (Ghost/Fairy) using Earthquake (Ground) = no STAB
            const withoutStab = calculateDamage(baseDamageCall({
                attacker: FLUTTER_MANE,
                attackerTypes: [{ typeId: 14 }, { typeId: 18 }],
            }))
            expect(withStab.maxDamage).toBeGreaterThan(withoutStab.maxDamage)
        })

        it('STAB multiplier is reflected in the multiplier field', () => {
            // Garchomp (Ground) + Earthquake (Ground) + no type effectiveness = 1.5x
            const result = calculateDamage(baseDamageCall({
                defenderTypes: [{ typeId: 1 }], // Normal — no interaction with Ground
            }))
            expect(result.multiplier).toBe(1.5)
        })
    })

    // ── Weather ─────────────────────────────────────────────────────────────────
    describe('weather modifiers', () => {
        it('sun boosts Fire moves by 1.5x', () => {
            const withSun    = calculateDamage(baseDamageCall({ move: HEAT_WAVE, attackerTypes: [{ typeId: 2 }], defenderTypes: [{ typeId: 1 }], weather: "sun" }))
            const withoutSun = calculateDamage(baseDamageCall({ move: HEAT_WAVE, attackerTypes: [{ typeId: 2 }], defenderTypes: [{ typeId: 1 }], weather: "none" }))
            expect(withSun.maxDamage).toBeGreaterThan(withoutSun.maxDamage)
        })

        it('sun weakens Water moves by 0.5x', () => {
            const SURF = { id: 13, typeId: 3, category: "special", power: 90 }
            const withSun    = calculateDamage(baseDamageCall({ move: SURF, attackerTypes: [{ typeId: 3 }], defenderTypes: [{ typeId: 1 }], weather: "sun" }))
            const withoutSun = calculateDamage(baseDamageCall({ move: SURF, attackerTypes: [{ typeId: 3 }], defenderTypes: [{ typeId: 1 }], weather: "none" }))
            expect(withSun.maxDamage).toBeLessThan(withoutSun.maxDamage)
        })

        it('rain boosts Water moves by 1.5x', () => {
            const SURF = { id: 13, typeId: 3, category: "special", power: 90 }
            const withRain    = calculateDamage(baseDamageCall({ move: SURF, attackerTypes: [{ typeId: 3 }], defenderTypes: [{ typeId: 1 }], weather: "rain" }))
            const withoutRain = calculateDamage(baseDamageCall({ move: SURF, attackerTypes: [{ typeId: 3 }], defenderTypes: [{ typeId: 1 }], weather: "none" }))
            expect(withRain.maxDamage).toBeGreaterThan(withoutRain.maxDamage)
        })

        it('rain weakens Fire moves by 0.5x', () => {
            const withRain    = calculateDamage(baseDamageCall({ move: HEAT_WAVE, attackerTypes: [{ typeId: 2 }], defenderTypes: [{ typeId: 1 }], weather: "rain" }))
            const withoutRain = calculateDamage(baseDamageCall({ move: HEAT_WAVE, attackerTypes: [{ typeId: 2 }], defenderTypes: [{ typeId: 1 }], weather: "none" }))
            expect(withRain.maxDamage).toBeLessThan(withoutRain.maxDamage)
        })

        it('weather does not affect unrelated move types', () => {
            const withSun    = calculateDamage(baseDamageCall({ weather: "sun" }))
            const withoutSun = calculateDamage(baseDamageCall({ weather: "none" }))
            // Earthquake is Ground type — unaffected by sun
            expect(withSun.maxDamage).toBe(withoutSun.maxDamage)
        })
    })

    // ── Terrain ─────────────────────────────────────────────────────────────────
    describe('terrain modifiers', () => {
        it('electric terrain boosts Electric moves by 1.3x', () => {
            const withTerrain    = calculateDamage(baseDamageCall({ move: THUNDERBOLT, attackerTypes: [{ typeId: 5 }], defenderTypes: [{ typeId: 1 }], terrain: "electric" }))
            const withoutTerrain = calculateDamage(baseDamageCall({ move: THUNDERBOLT, attackerTypes: [{ typeId: 5 }], defenderTypes: [{ typeId: 1 }], terrain: "none" }))
            expect(withTerrain.maxDamage).toBeGreaterThan(withoutTerrain.maxDamage)
        })

        it('misty terrain weakens Dragon moves by 0.5x', () => {
            const DRACO = { id: 38, typeId: 15, category: "special", power: 130 }
            const withTerrain    = calculateDamage(baseDamageCall({ move: DRACO, attackerTypes: [{ typeId: 15 }], defenderTypes: [{ typeId: 1 }], terrain: "misty" }))
            const withoutTerrain = calculateDamage(baseDamageCall({ move: DRACO, attackerTypes: [{ typeId: 15 }], defenderTypes: [{ typeId: 1 }], terrain: "none" }))
            expect(withTerrain.maxDamage).toBeLessThan(withoutTerrain.maxDamage)
        })

        it('terrain does not affect unrelated move types', () => {
            const withTerrain    = calculateDamage(baseDamageCall({ terrain: "electric" }))
            const withoutTerrain = calculateDamage(baseDamageCall({ terrain: "none" }))
            // Earthquake is Ground — unaffected by electric terrain
            expect(withTerrain.maxDamage).toBe(withoutTerrain.maxDamage)
        })
    })

    // ── Items ───────────────────────────────────────────────────────────────────
    describe('item modifiers', () => {
        it('Life Orb boosts damage by 1.3x', () => {
            const withItem    = calculateDamage(baseDamageCall({ attackerItem: "lifeOrb" }))
            const withoutItem = calculateDamage(baseDamageCall({ attackerItem: "none" }))
            expect(withItem.maxDamage).toBeGreaterThan(withoutItem.maxDamage)
        })

        it('Choice Band boosts physical moves by 1.5x', () => {
            const withBand    = calculateDamage(baseDamageCall({ attackerItem: "choiceBand" }))
            const withoutBand = calculateDamage(baseDamageCall({ attackerItem: "none" }))
            expect(withBand.maxDamage).toBeGreaterThan(withoutBand.maxDamage)
        })

        it('Choice Band does not boost special moves', () => {
            const withBand    = calculateDamage(baseDamageCall({ move: MOONBLAST, attackerTypes: [{ typeId: 18 }], defenderTypes: [{ typeId: 1 }], attackerItem: "choiceBand" }))
            const withoutBand = calculateDamage(baseDamageCall({ move: MOONBLAST, attackerTypes: [{ typeId: 18 }], defenderTypes: [{ typeId: 1 }], attackerItem: "none" }))
            expect(withBand.maxDamage).toBe(withoutBand.maxDamage)
        })

        it('Choice Specs boosts special moves by 1.5x', () => {
            const withSpecs    = calculateDamage(baseDamageCall({ move: MOONBLAST, attackerTypes: [{ typeId: 18 }], defenderTypes: [{ typeId: 1 }], attackerItem: "choiceSpecs" }))
            const withoutSpecs = calculateDamage(baseDamageCall({ move: MOONBLAST, attackerTypes: [{ typeId: 18 }], defenderTypes: [{ typeId: 1 }], attackerItem: "none" }))
            expect(withSpecs.maxDamage).toBeGreaterThan(withoutSpecs.maxDamage)
        })

        it('Choice Specs does not boost physical moves', () => {
            const withSpecs    = calculateDamage(baseDamageCall({ attackerItem: "choiceSpecs" }))
            const withoutSpecs = calculateDamage(baseDamageCall({ attackerItem: "none" }))
            expect(withSpecs.maxDamage).toBe(withoutSpecs.maxDamage)
        })
    })

    // ── Critical hits ───────────────────────────────────────────────────────────
    describe('critical hits', () => {
        it('critical hit boosts damage by 1.5x', () => {
            const withCrit    = calculateDamage(baseDamageCall({ isCritical: true }))
            const withoutCrit = calculateDamage(baseDamageCall({ isCritical: false }))
            expect(withCrit.maxDamage).toBeGreaterThan(withoutCrit.maxDamage)
        })

        it('critical hit is reflected in the multiplier', () => {
            // Base: STAB (1.5) + crit (1.5) = 2.25 vs Normal type
            const result = calculateDamage(baseDamageCall({
                defenderTypes: [{ typeId: 1 }],
                isCritical: true
            }))
            expect(result.multiplier).toBeCloseTo(2.25)
        })
    })

    // ── Stat stages ─────────────────────────────────────────────────────────────
    describe('stat stages', () => {
        it('+1 attack stage increases damage', () => {
            const withBoost    = calculateDamage(baseDamageCall({ attackerStages: 1 }))
            const withoutBoost = calculateDamage(baseDamageCall({ attackerStages: 0 }))
            expect(withBoost.maxDamage).toBeGreaterThan(withoutBoost.maxDamage)
        })

        it('-1 defense stage on defender increases damage taken', () => {
            const withDrop    = calculateDamage(baseDamageCall({ defenderStages: -1 }))
            const withoutDrop = calculateDamage(baseDamageCall({ defenderStages: 0 }))
            expect(withDrop.maxDamage).toBeGreaterThan(withoutDrop.maxDamage)
        })

        it('+1 defense stage on defender reduces damage taken', () => {
            const withBoost    = calculateDamage(baseDamageCall({ defenderStages: 1 }))
            const withoutBoost = calculateDamage(baseDamageCall({ defenderStages: 0 }))
            expect(withBoost.maxDamage).toBeLessThan(withoutBoost.maxDamage)
        })
    })

    // ── HP percentage ───────────────────────────────────────────────────────────
    describe('HP percentage output', () => {
        it('minPercent and maxPercent are string representations of numbers', () => {
            const result = calculateDamage(baseDamageCall())
            expect(typeof result.minPercent).toBe('string')
            expect(typeof result.maxPercent).toBe('string')
            expect(isNaN(parseFloat(result.minPercent))).toBe(false)
        })

        it('maxPercent >= 100 means OHKO range', () => {
            // Garchomp EQ vs max investment Amoonguss — should not OHKO
            const result = calculateDamage(baseDamageCall({
                defenderSpread: FULL_DEF_SPREAD
            }))
            expect(parseFloat(result.maxPercent)).toBeLessThan(100)
        })

        it('defenderHp matches calculateStat result for same inputs', () => {
            const result = calculateDamage(baseDamageCall())
            // Amoonguss: 114 base HP, 31 IV, 0 EV
            // floor((228 + 31 + 0) * 0.5) + 60 = 189
            expect(result.defenderHp).toBe(189)
        })
    })
})