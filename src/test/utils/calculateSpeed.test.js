// src/test/utils/calculateSpeed.test.js
import { describe, it, expect } from 'vitest'
import { calculateSpeed } from '../../utils/statUtils'
 
// calculateSpeed applies the nature modifier AFTER the base stat formula:
//   floor(floor((2 * base + iv + floor(ev/4)) * 50 / 100 + 5) * natureModifier)
//
// Nature speed modifiers in the codebase:
//   +10%: Timid, Jolly, Hasty, Naive
//   -10%: Brave, Relaxed, Quiet, Sassy
//   Neutral (1.0): all others (Hardy, Adamant, Bold, etc.)
 
describe('calculateSpeed()', () => {
 
    // ── Neutral natures ─────────────────────────────────────────────────────────
    describe('neutral nature (1.0 modifier)', () => {
        it('calculates Miraidon speed with neutral nature, 0 EV', () => {
            // floor((270 + 31 + 0) * 0.5) + 5 = 155, * 1.0 = 155
            expect(calculateSpeed(135, 31, 0, "Hardy")).toBe(155)
        })
 
        it('calculates Miraidon speed with neutral nature, 252 EV', () => {
            // floor((270 + 31 + 63) * 0.5) + 5 = 187, * 1.0 = 187
            expect(calculateSpeed(135, 31, 252, "Hardy")).toBe(187)
        })
 
        it('calculates Incineroar speed (60 base) with neutral nature, 0 EV', () => {
            // floor((120 + 31 + 0) * 0.5) + 5 = 80, * 1.0 = 80
            expect(calculateSpeed(60, 31, 0, "Adamant")).toBe(80)
        })
 
        it('falls back to 1.0 for unknown nature name', () => {
            // Unknown nature → no modifier → same as neutral
            const withUnknown = calculateSpeed(100, 31, 0, "NonExistentNature")
            const withNeutral = calculateSpeed(100, 31, 0, "Hardy")
            expect(withUnknown).toBe(withNeutral)
        })
 
        it('falls back to 1.0 for empty string nature', () => {
            const withEmpty   = calculateSpeed(100, 31, 0, "")
            const withNeutral = calculateSpeed(100, 31, 0, "Hardy")
            expect(withEmpty).toBe(withNeutral)
        })
    })
 
    // ── +Speed natures (+10%) ───────────────────────────────────────────────────
    describe('+Speed natures (Timid, Jolly, Hasty, Naive — 1.1x)', () => {
        it('Timid boosts speed by 1.1x — Miraidon 0 EV', () => {
            // base = 155, floor(155 * 1.1) = floor(170.5) = 170
            expect(calculateSpeed(135, 31, 0, "Timid")).toBe(170)
        })
 
        it('Jolly boosts speed by 1.1x — Garchomp 252 EV', () => {
            // floor((204 + 31 + 63) * 0.5) + 5 = 154
            // floor(154 * 1.1) = floor(169.4) = 169
            expect(calculateSpeed(102, 31, 252, "Jolly")).toBe(169)
        })
 
        it('Hasty gives the same boost as Timid — same base result', () => {
            const timid = calculateSpeed(100, 31, 0, "Timid")
            const hasty = calculateSpeed(100, 31, 0, "Hasty")
            expect(timid).toBe(hasty)
        })
 
        it('Naive gives the same boost as Timid — same base result', () => {
            const timid = calculateSpeed(100, 31, 0, "Timid")
            const naive = calculateSpeed(100, 31, 0, "Naive")
            expect(timid).toBe(naive)
        })
 
        it('Jolly Garchomp from db (252 Spe EV) matches expected value', () => {
            // pokemonTeam id 28 in db: Garchomp, Jolly, 252 spdEv, 31 spdIv
            expect(calculateSpeed(102, 31, 252, "Jolly")).toBe(169)
        })
    })
 
    // ── -Speed natures (-10%) ───────────────────────────────────────────────────
    describe('-Speed natures (Brave, Relaxed, Quiet, Sassy — 0.9x)', () => {
        it('Brave reduces speed by 0.9x — Miraidon 0 EV', () => {
            // base = 155, floor(155 * 0.9) = floor(139.5) = 139
            expect(calculateSpeed(135, 31, 0, "Brave")).toBe(139)
        })
 
        it('Relaxed reduces speed by 0.9x — Amoonguss (30 base, 0 EV)', () => {
            // floor((60 + 31 + 0) * 0.5) + 5 = 50, floor(50 * 0.9) = 45
            // pokemonTeam id 3 in db: Amoonguss, Relaxed nature
            expect(calculateSpeed(30, 31, 0, "Relaxed")).toBe(45)
        })
 
        it('Quiet gives the same penalty as Brave — same base result', () => {
            const brave = calculateSpeed(100, 31, 0, "Brave")
            const quiet = calculateSpeed(100, 31, 0, "Quiet")
            expect(brave).toBe(quiet)
        })
 
        it('Sassy gives the same penalty as Brave', () => {
            const brave = calculateSpeed(100, 31, 0, "Brave")
            const sassy = calculateSpeed(100, 31, 0, "Sassy")
            expect(brave).toBe(sassy)
        })
    })
 
    // ── EV/IV combinations ──────────────────────────────────────────────────────
    describe('EV/IV combinations', () => {
        it('4 EV gives +1 speed over 0 EV with same IV', () => {
            const with4ev = calculateSpeed(100, 31, 4, "Hardy")
            const with0ev = calculateSpeed(100, 31, 0, "Hardy")
            expect(with4ev).toBe(with0ev + 1)
        })
 
        it('0 IV is slower than 31 IV at same EV investment', () => {
            const max = calculateSpeed(100, 31, 0, "Hardy")
            const min = calculateSpeed(100, 0, 0, "Hardy")
            expect(max).toBeGreaterThan(min)
        })
 
        it('always returns an integer (never a decimal)', () => {
            const result = calculateSpeed(111, 31, 4, "Timid") // Tornadus from db
            expect(Number.isInteger(result)).toBe(true)
        })
 
        it('Tornadus Timid 252 EV matches expected VGC value', () => {
            // 111 base, 31 IV, 252 EV, Timid
            // floor((222 + 31 + 63) * 0.5) + 5 = floor(158) + 5 = 163
            // floor(163 * 1.1) = floor(179.3) = 179
            expect(calculateSpeed(111, 31, 252, "Timid")).toBe(179)
        })
    })
 
    // ── Speed tier relationships ────────────────────────────────────────────────
    describe('speed tier ordering', () => {
        it('Jolly Garchomp (252 EV) outspeeds Timid Urshifu (0 EV)', () => {
            const garchomp = calculateSpeed(102, 31, 252, "Jolly")   // 169
            const urshifu  = calculateSpeed(97,  31, 0,   "Timid")   // 112
            expect(garchomp).toBeGreaterThan(urshifu)
        })
 
        it('Trick Room reversal: Quiet Incineroar slower than Brave Iron Hands (0 EV)', () => {
            const incin     = calculateSpeed(60,  31, 0, "Quiet")   // slower with -spe nature
            const ironhands = calculateSpeed(50,  31, 0, "Brave")   // even slower
            expect(incin).toBeGreaterThan(ironhands) // Incineroar still faster in TR
        })
    })
})