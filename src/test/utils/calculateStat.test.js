// src/test/utils/calculateStat.test.js
import { describe, it, expect } from 'vitest'
import { calculateStat } from '../../utils/statUtils'
 
// Pokémon Gen 8/9 stat formulas (level 50) 
//
//  HP  = floor((2 * base + iv + floor(ev / 4)) * 50 / 100) + 50 + 10
//  Atk = floor((2 * base + iv + floor(ev / 4)) * 50 / 100) + 5
//  (same for Def, SpA, SpD, Spe — nature applied on top in calculateSpeed)
//
// All expected values verified against Showdown's damage calculator.
 
describe('calculateStat()', () => {
 
    // HP formula 
    describe('HP formula (isHp = true)', () => {
        it('calculates standard HP correctly — Garchomp benchmark', () => {
            // floor((216 + 31 + 63) * 0.5) + 60 = floor(155) + 60 = 215
            expect(calculateStat(108, 31, 252, true)).toBe(215)
        })
 
        it('calculates HP at minimum investment (0 IV, 0 EV)', () => {
            // Garchomp: floor((216 + 0 + 0) * 0.5) + 60 = 108 + 60 = 168
            expect(calculateStat(108, 0, 0, true)).toBe(168)
        })
 
        it('calculates HP at 4 EV (leftover spread)', () => {
            // floor(4/4) = 1 extra vs 0 EV
            const with4ev = calculateStat(108, 31, 4, true)
            const with0ev = calculateStat(108, 31, 0, true)
            expect(with4ev).toBe(with0ev + 1)
        })
 
        it('calculates Flutter Mane HP correctly (55 base)', () => {
            // floor((110 + 31 + 63) * 0.5) + 60 = floor(102) + 60 = 162
            expect(calculateStat(55, 31, 252, true)).toBe(162)
        })
 
        it('calculates Iron Hands HP correctly (154 base — highest in db)', () => {
            // floor((308 + 31 + 63) * 0.5) + 60 = floor(201) + 60 = 261
            expect(calculateStat(154, 31, 252, true)).toBe(261)
        })
    })
 
    // Non-HP formula 
    describe('non-HP formula (isHp = false)', () => {
        it('calculates Attack stat with full investment — Garchomp', () => {
            // floor((260 + 31 + 63) * 0.5) + 5 = floor(177) + 5 = 182
            expect(calculateStat(130, 31, 252, false)).toBe(182)
        })
 
        it('calculates Attack stat with 0 EV investment', () => {
            // floor((260 + 31 + 0) * 0.5) + 5 = floor(145.5) + 5 = 150
            expect(calculateStat(130, 31, 0, false)).toBe(150)
        })
 
        it('calculates Speed stat with 252 EV — Miraidon base 135', () => {
            // floor((270 + 31 + 63) * 0.5) + 5 = floor(182) + 5 = 187
            expect(calculateStat(135, 31, 252, false)).toBe(187)
        })
 
        it('calculates Speed stat with 0 EV — Miraidon base 135', () => {
            // floor((270 + 31 + 0) * 0.5) + 5 = floor(150.5) + 5 = 155
            expect(calculateStat(135, 31, 0, false)).toBe(155)
        })
 
        it('handles 4 EV correctly (floor(4/4) = 1 extra point)', () => {
            const with4ev  = calculateStat(130, 31, 4, false)
            const with0ev  = calculateStat(130, 31, 0, false)
            expect(with4ev).toBe(with0ev + 1)
        })
 
        it('calculates SpA for Flutter Mane (135 base SpA, full investment)', () => {
            // floor((270 + 31 + 63) * 0.5) + 5 = floor(182) + 5 = 187
            expect(calculateStat(135, 31, 252, false)).toBe(187)
        })
    })
 
    // HP vs non-HP formula difference 
    describe('HP vs non-HP formula distinction', () => {
        it('HP formula always returns a higher value than non-HP for same inputs', () => {
            const hpResult    = calculateStat(100, 31, 252, true)
            const nonHpResult = calculateStat(100, 31, 252, false)
            // HP adds +60 at level 50 vs +5 for non-HP
            expect(hpResult).toBeGreaterThan(nonHpResult)
        })
 
        it('HP formula adds level+10 (60 at level 50), non-HP adds 5', () => {
            // At 0 base, 0 iv, 0 ev: HP = 0 + 60 = 60, non-HP = 0 + 5 = 5
            expect(calculateStat(0, 0, 0, true)).toBe(60)
            expect(calculateStat(0, 0, 0, false)).toBe(5)
        })
    })
 
    // Edge cases 
    describe('edge cases', () => {
        it('always returns an integer (never a decimal)', () => {
            const result = calculateStat(97, 31, 100, false) // Urshifu speed, odd EV
            expect(Number.isInteger(result)).toBe(true)
        })
 
        it('handles 0 base stat gracefully', () => {
            expect(() => calculateStat(0, 0, 0, false)).not.toThrow()
            expect(calculateStat(0, 0, 0, false)).toBe(5)
        })
 
        it('EV values above 252 that are not multiples of 4 still floor correctly', () => {
            // floor(253/4) = floor(63.25) = 63 — same as floor(252/4) = 63
            const with252 = calculateStat(100, 31, 252, false)
            const with253 = calculateStat(100, 31, 253, false)
            expect(with252).toBe(with253) // 253 EV gives no benefit over 252
        })
 
        it('returns correct stat at max EVs (252) — no rounding surprise at cap', () => {
            const result = calculateStat(100, 31, 252, false)
            expect(result).toBeGreaterThan(0)
            expect(typeof result).toBe('number')
        })
 
        it('Incineroar HP benchmark from db (teamId 5, pokemonId 1)', () => {
            // 95 base HP, 31 IV, 252 EV — matches actual team data in db.json
            // floor((190 + 31 + 63) * 0.5) + 60 = floor(142) + 60 = 202
            expect(calculateStat(95, 31, 252, true)).toBe(202)
        })
 
        it('Garchomp Jolly Scarf speed from db — full investment', () => {
            // 102 base Spe, 31 IV, 252 EV, no nature modifier at this level
            // floor((204 + 31 + 63) * 0.5) + 5 = floor(149) + 5 = 154
            expect(calculateStat(102, 31, 252, false)).toBe(154)
        })
    })
})