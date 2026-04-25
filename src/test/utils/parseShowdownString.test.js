// src/test/utils/parseShowdownString.test.js
import { describe, it, expect } from 'vitest'
import { parseShowdownString } from '../../utils/statUtils'
 
// Real Showdown export strings to use as test fixtures
const INCINEROAR_BLOCK = `Incineroar @ Sitrus Berry
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 252 Def
Careful Nature
- Fake Out
- Close Combat
- Knock Off
- Protect`
 
const FLUTTER_MANE_BLOCK = `Flutter Mane @ Booster Energy
Ability: Protosynthesis
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
IVs: 0 Atk
- Moonblast
- Dazzling Gleam
- Shadow Ball
- Protect`
 
const URSHIFU_SHOWDOWN_NAME = `Urshifu @ Choice Band
Ability: Unseen Fist
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Wicked Blow
- Close Combat
- Aqua Jet
- Protect`
 
const CALYREX_ICE_SHOWDOWN_NAME = `Calyrex-Ice Rider @ Reins of Unity
Ability: As One (Glastrier)
Level: 50
EVs: 252 HP / 252 Atk / 4 SpD
Brave Nature
IVs: 0 Spe
- Glacial Lance
- Close Combat
- High Horsepower
- Protect`
 
const NO_NATURE_BLOCK = `Garchomp @ Choice Scarf
Ability: Rough Skin
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
- Earthquake
- Rock Slide
- Dragon Claw
- Protect`
 
// A full 2-mon team paste to test multi-block parsing
const TWO_MON_PASTE = `${INCINEROAR_BLOCK}
 
${FLUTTER_MANE_BLOCK}`
 
describe('parseShowdownString()', () => {
 
    // Basic parsing 
    describe('basic parsing', () => {
        it('returns an array with one entry for a single Pokémon block', () => {
            const result = parseShowdownString(INCINEROAR_BLOCK)
            expect(result).toHaveLength(1)
        })
 
        it('parses the Pokémon name correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.pokemonName).toBe("Incineroar")
        })
 
        it('parses the held item correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.itemName).toBe("Sitrus Berry")
        })
 
        it('parses the ability correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.abilityName).toBe("Intimidate")
        })
 
        it('parses the nature correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.natureName).toBe("Careful")
        })
 
        it('parses all 4 moves correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.moves).toEqual(["Fake Out", "Close Combat", "Knock Off", "Protect"])
            expect(mon.moves).toHaveLength(4)
        })
    })
 
    // EV parsing 
    describe('EV parsing', () => {
        it('parses HP EVs correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.evs.hp).toBe(252)
        })
 
        it('parses Attack EVs correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.evs.atk).toBe(4)
        })
 
        it('parses Defense EVs correctly', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.evs.def).toBe(252)
        })
 
        it('parses SpA EVs correctly', () => {
            const [mon] = parseShowdownString(FLUTTER_MANE_BLOCK)
            expect(mon.evs.spAtk).toBe(252)
        })
 
        it('parses Spe EVs correctly', () => {
            const [mon] = parseShowdownString(FLUTTER_MANE_BLOCK)
            expect(mon.evs.spd).toBe(252)
        })
 
        it('defaults missing EVs to 0', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            // SpA, SpD, Spe are not listed → should default to 0
            expect(mon.evs.spAtk).toBe(0)
            expect(mon.evs.spDef).toBe(0)
            expect(mon.evs.spd).toBe(0)
        })
    })
 
    // IV parsing 
    describe('IV parsing', () => {
        it('defaults all IVs to 31 when no IVs line is present', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.ivs.hp).toBe(31)
            expect(mon.ivs.atk).toBe(31)
            expect(mon.ivs.spd).toBe(31)
        })
 
        it('parses 0 Atk IV correctly (Flutter Mane — common for special attackers)', () => {
            const [mon] = parseShowdownString(FLUTTER_MANE_BLOCK)
            expect(mon.ivs.atk).toBe(0)
        })
 
        it('non-listed IVs default to 31 even when IVs line is present', () => {
            const [mon] = parseShowdownString(FLUTTER_MANE_BLOCK)
            // Only Atk IV is listed as 0; all others default to 31
            expect(mon.ivs.hp).toBe(31)
            expect(mon.ivs.spd).toBe(31)
        })
 
        it('parses 0 Spe IV for Trick Room setter (Calyrex-Ice)', () => {
            const [mon] = parseShowdownString(CALYREX_ICE_SHOWDOWN_NAME)
            expect(mon.ivs.spd).toBe(0)
        })
    })
 
    // Name mapping 
    describe('Showdown → DB name mapping', () => {
        it('maps "Urshifu" → "Urshifu-Single"', () => {
            const [mon] = parseShowdownString(URSHIFU_SHOWDOWN_NAME)
            expect(mon.pokemonName).toBe("Urshifu-Single")
        })
 
        it('maps "Calyrex-Ice Rider" → "Calyrex-Ice"', () => {
            const [mon] = parseShowdownString(CALYREX_ICE_SHOWDOWN_NAME)
            expect(mon.pokemonName).toBe("Calyrex-Ice")
        })
 
        it('leaves unmapped names unchanged (e.g. Incineroar stays Incineroar)', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.pokemonName).toBe("Incineroar")
        })
    })
 
    // Missing nature fallback 
    describe('missing nature fallback', () => {
        it('defaults to "Hardy" when Nature line is absent', () => {
            const [mon] = parseShowdownString(NO_NATURE_BLOCK)
            expect(mon.natureName).toBe("Hardy")
        })
 
        it('uses the actual nature when one is present (never overwrites)', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.natureName).toBe("Careful")
            expect(mon.natureName).not.toBe("Hardy")
        })
    })
 
    // Multi-Pokémon paste 
    describe('multi-Pokémon paste', () => {
        it('returns the correct number of Pokémon entries', () => {
            const result = parseShowdownString(TWO_MON_PASTE)
            expect(result).toHaveLength(2)
        })
 
        it('parses both Pokémon names correctly', () => {
            const result = parseShowdownString(TWO_MON_PASTE)
            expect(result[0].pokemonName).toBe("Incineroar")
            expect(result[1].pokemonName).toBe("Flutter Mane")
        })
 
        it('does not bleed data between Pokémon blocks', () => {
            const result = parseShowdownString(TWO_MON_PASTE)
            // Incineroar has 0 SpA EV; Flutter Mane has 252
            expect(result[0].evs.spAtk).toBe(0)
            expect(result[1].evs.spAtk).toBe(252)
        })
 
        it('filters out empty blocks from the paste', () => {
            // Extra blank lines should not create empty entries
            const pasteWithExtraNewlines = `${INCINEROAR_BLOCK}\n\n\n${FLUTTER_MANE_BLOCK}\n\n`
            const result = parseShowdownString(pasteWithExtraNewlines)
            expect(result).toHaveLength(2)
        })
    })
 
    // Return shape 
    describe('return shape', () => {
        it('each entry has all required keys', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon).toHaveProperty('pokemonName')
            expect(mon).toHaveProperty('itemName')
            expect(mon).toHaveProperty('abilityName')
            expect(mon).toHaveProperty('natureName')
            expect(mon).toHaveProperty('evs')
            expect(mon).toHaveProperty('ivs')
            expect(mon).toHaveProperty('moves')
        })
 
        it('evs object has all 6 stat keys', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(mon.evs).toHaveProperty('hp')
            expect(mon.evs).toHaveProperty('atk')
            expect(mon.evs).toHaveProperty('def')
            expect(mon.evs).toHaveProperty('spAtk')
            expect(mon.evs).toHaveProperty('spDef')
            expect(mon.evs).toHaveProperty('spd')
        })
 
        it('moves is always an array', () => {
            const [mon] = parseShowdownString(INCINEROAR_BLOCK)
            expect(Array.isArray(mon.moves)).toBe(true)
        })
    })
})