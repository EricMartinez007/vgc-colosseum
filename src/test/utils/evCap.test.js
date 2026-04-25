// src/test/utils/evCap.test.js
import { describe, it, expect } from 'vitest'
import { isEvChangeAllowed, calculateNewEvTotal } from '../../utils/statUtils'

// EV Cap Rules 
// Total EVs across all 6 stats cannot exceed 510
// Each individual stat can have at most 252 EVs
// IVs are never capped — only EV fields trigger the check

const EMPTY_SPREAD = {
    hpEv: 0, atkEv: 0, defEv: 0,
    spAtkEv: 0, spDefEv: 0, spdEv: 0
}

const FULL_SPREAD = {
    hpEv: 252, atkEv: 252, defEv: 6,
    spAtkEv: 0, spDefEv: 0, spdEv: 0
} // total = 510

const PARTIAL_SPREAD = {
    hpEv: 252, atkEv: 252, defEv: 0,
    spAtkEv: 0, spDefEv: 0, spdEv: 0
} // total = 504 — 6 EVs remaining

describe('calculateNewEvTotal()', () => {
    it('returns the correct total when adding EVs to an empty spread', () => {
        expect(calculateNewEvTotal(EMPTY_SPREAD, 'hpEv', 252)).toBe(252)
    })

    it('returns the correct total when changing an existing EV value', () => {
        // changing hpEv from 252 to 100 in PARTIAL_SPREAD: 100 + 252 = 352
        expect(calculateNewEvTotal(PARTIAL_SPREAD, 'hpEv', 100)).toBe(352)
    })

    it('returns 510 for a maxed spread with no changes', () => {
        // changing defEv from 6 to 6 — total stays 510
        expect(calculateNewEvTotal(FULL_SPREAD, 'defEv', 6)).toBe(510)
    })

    it('does not double-count the current field value', () => {
        // PARTIAL_SPREAD hpEv is 252, changing to 252 should still be 504
        expect(calculateNewEvTotal(PARTIAL_SPREAD, 'hpEv', 252)).toBe(504)
    })
})

describe('isEvChangeAllowed()', () => {

    // Allowed changes 
    describe('allowed changes', () => {
        it('allows EV change when total stays under 510', () => {
            expect(isEvChangeAllowed(EMPTY_SPREAD, 'hpEv', 252)).toBe(true)
        })

        it('allows EV change when total equals exactly 510', () => {
            // PARTIAL_SPREAD has 504 total, adding 6 to defEv = 510
            expect(isEvChangeAllowed(PARTIAL_SPREAD, 'defEv', 6)).toBe(true)
        })

        it('allows reducing an EV value even on a full spread', () => {
            // FULL_SPREAD has 510 total, reducing hpEv from 252 to 100
            expect(isEvChangeAllowed(FULL_SPREAD, 'hpEv', 100)).toBe(true)
        })

        it('always allows IV changes regardless of EV total', () => {
            expect(isEvChangeAllowed(FULL_SPREAD, 'hpIv', 31)).toBe(true)
            expect(isEvChangeAllowed(FULL_SPREAD, 'atkIv', 0)).toBe(true)
            expect(isEvChangeAllowed(FULL_SPREAD, 'spdIv', 31)).toBe(true)
        })

        it('allows adding 4 EVs (minimum useful investment) on a partial spread', () => {
            expect(isEvChangeAllowed(PARTIAL_SPREAD, 'defEv', 4)).toBe(true)
        })
    })

    // Blocked changes 
    describe('blocked changes', () => {
        it('blocks EV change when total would exceed 510', () => {
            // PARTIAL_SPREAD has 504, trying to add 252 to defEv = 756
            expect(isEvChangeAllowed(PARTIAL_SPREAD, 'defEv', 252)).toBe(false)
        })

        it('blocks EV change when total would be exactly 511', () => {
            // FULL_SPREAD has 510, trying to add 1 more to hpEv
            expect(isEvChangeAllowed(FULL_SPREAD, 'hpEv', 253)).toBe(false)
        })

        it('blocks adding any EVs to a completely maxed spread', () => {
            expect(isEvChangeAllowed(FULL_SPREAD, 'spAtkEv', 1)).toBe(false)
            expect(isEvChangeAllowed(FULL_SPREAD, 'spDefEv', 4)).toBe(false)
            expect(isEvChangeAllowed(FULL_SPREAD, 'spdEv', 252)).toBe(false)
        })

        it('blocks going over 510 even with a small overage', () => {
            // PARTIAL_SPREAD has 504, trying to add 7 to defEv = 511
            expect(isEvChangeAllowed(PARTIAL_SPREAD, 'defEv', 7)).toBe(false)
        })
    })

    // Edge cases 
    describe('edge cases', () => {
        it('allows all changes on a completely empty spread', () => {
            expect(isEvChangeAllowed(EMPTY_SPREAD, 'hpEv', 0)).toBe(true)
            expect(isEvChangeAllowed(EMPTY_SPREAD, 'atkEv', 252)).toBe(true)
        })

        it('handles the classic 252/252/4 spread correctly', () => {
            const spread = { hpEv: 252, atkEv: 252, defEv: 0, spAtkEv: 0, spDefEv: 0, spdEv: 0 }
            // Can add exactly 4 to defEv (total = 508, allowed)
            expect(isEvChangeAllowed(spread, 'defEv', 4)).toBe(true)
            // Cannot add 8 (total = 512, blocked)
            expect(isEvChangeAllowed(spread, 'defEv', 8)).toBe(false)
        })

        it('handles the classic 252/252/4 spread — 4 EV leftover slot', () => {
            const spread = { hpEv: 252, atkEv: 252, defEv: 0, spAtkEv: 0, spDefEv: 0, spdEv: 0 }
            // total = 504, cap is 510, so up to 6 more EVs are allowed
            expect(isEvChangeAllowed(spread, 'spdEv', 4)).toBe(true)
            expect(isEvChangeAllowed(spread, 'spdEv', 6)).toBe(true)   // 510 exactly — allowed
            expect(isEvChangeAllowed(spread, 'spdEv', 7)).toBe(false)  // 511 — blocked
        })
    })
})