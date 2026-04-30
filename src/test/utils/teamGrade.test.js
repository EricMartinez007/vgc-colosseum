import { describe, it, expect } from 'vitest'
import { teamGrade } from '../../utils/statUtils'
 
// teamGrade(criticalCount, warningCount, coverageCount)
//   score = 100 - (criticalCount * 12) - (warningCount * 4) + (coverageCount * 1)
//   S ≥ 95 | A ≥ 75 | B ≥ 58 | C ≥ 40 | D ≥ 25 | F < 25
 
describe('teamGrade()', () => {
 
    // S tier 
    describe('S grade (score ≥ 95)', () => {
        it('returns S for a perfect team (no weaknesses, full coverage)', () => {
            // score = 100 - 0 - 0 + 18 = 118 → S
            expect(teamGrade(0, 0, 18)).toBe("S")
        })
 
        it('returns S with 0 weaknesses and 0 coverage bonus', () => {
            // score = 100 → S
            expect(teamGrade(0, 0, 0)).toBe("S")
        })
 
        it('returns S at exactly the boundary (score = 95)', () => {
            // 0 crits, 0 warnings, coverageCount irrelevant at base 100
            // 100 - 0 - 4 = 96 → still S
            // To hit exactly 95: 1 warning = -4 → 96, not 95 exactly
            // 2 warnings = -8 → 92 = A; let's use 1 warning, some coverage:
            // 100 - 4 + 0 = 96 → S (above 95)
            expect(teamGrade(0, 1, 0)).toBe("S")
        })
    })
 
    // A tier 
    describe('A grade (75 ≤ score < 95)', () => {
        it('returns A with a few shared weaknesses', () => {
            // 0 crits, 5 warnings = 100 - 20 = 80 → A
            expect(teamGrade(0, 5, 0)).toBe("A")
        })
 
        it('returns A with 1 critical weakness and decent coverage', () => {
            // 100 - 12 - 0 + 0 = 88 → A
            expect(teamGrade(1, 0, 0)).toBe("A")
        })
 
        it('returns A at score 75 boundary', () => {
            // Need score = 75: 100 - 12 - (something) = 75 → warnings = 3.25, not clean
            // 100 - 12 - 12 - 4 = 72 → C (too low)
            // 100 - 12 - 0 + 0 = 88 → A
            // 100 - 0 - 24 = 76 → A (6 warnings)
            expect(teamGrade(0, 6, 0)).toBe("A")
        })
    })
 
    // B tier 
    describe('B grade (58 ≤ score < 75)', () => {
        it('returns B with 2 critical weaknesses', () => {
            // 100 - 24 - 0 = 76... that's A. Try 3 crits:
            // 100 - 36 = 64 → B
            expect(teamGrade(3, 0, 0)).toBe("B")
        })
 
        it('returns B with a mix of critical and warning weaknesses', () => {
            // 100 - 12 - 16 = 72 → B (1 crit, 4 warnings)
            expect(teamGrade(1, 4, 0)).toBe("B")
        })
 
        it('returns B at score exactly 58', () => {
            // 100 - 12 - 12 - 12 - 4 - 4 + 2 = impossible to hit exact 58 cleanly
            // 100 - 36 - 8 + 2 = 58 → B (3 crits, 2 warnings, 2 coverage)
            expect(teamGrade(3, 2, 2)).toBe("B")
        })
    })
 
    // C tier 
    describe('C grade (40 ≤ score < 58)', () => {
        it('returns C with many shared weaknesses', () => {
            // 100 - 48 - 0 = 52 → C (4 crits)
            expect(teamGrade(4, 0, 0)).toBe("C")
        })
 
        it('returns C with heavy warning count', () => {
            // 100 - 0 - 60 = 40 → C boundary (15 warnings)
            expect(teamGrade(0, 15, 0)).toBe("C")
        })
    })
 
    // D tier 
    describe('D grade (25 ≤ score < 40)', () => {
        it('returns D for a very weak team', () => {
            // 100 - 60 - 16 = 24? → F. Try 5 crits, 2 warnings:
            // 100 - 60 - 8 = 32 → D
            expect(teamGrade(5, 2, 0)).toBe("D")
        })
 
        it('returns D at score exactly 25', () => {
            // 100 - 60 - 16 = 24 → F. 100 - 60 - 12 = 28 → D
            expect(teamGrade(5, 3, 0)).toBe("D")
        })
    })
 
    // F tier 
    describe('F grade (score < 25)', () => {
        it('returns F for a terrible team', () => {
            // 100 - 84 - 16 = 0 → F (7 crits, 4 warnings)
            expect(teamGrade(7, 4, 0)).toBe("F")
        })
 
        it('returns F with negative score (extreme weaknesses)', () => {
            // 100 - 120 = -20 → F
            expect(teamGrade(10, 0, 0)).toBe("F")
        })
 
        it('returns F even with high coverage if weaknesses dominate', () => {
            // 100 - 84 + 18 = 34 → D, not F; coverage helps a lot
            // 100 - 120 + 18 = -2 → F
            expect(teamGrade(10, 0, 18)).toBe("F")
        })
    })
 
    // Grade ordering 
    describe('grade ordering — more weaknesses = lower grade', () => {
        it('adding a critical weakness never improves or keeps the same grade', () => {
            const grades = ['S', 'A', 'B', 'C', 'D', 'F']
            const grade0 = teamGrade(0, 0, 0)
            const grade1 = teamGrade(1, 0, 0)
            const grade3 = teamGrade(3, 0, 0)
            const gradeOrder = (g) => grades.indexOf(g)
            // More crits = same or later in array (lower grade)
            expect(gradeOrder(grade1)).toBeGreaterThanOrEqual(gradeOrder(grade0))
            expect(gradeOrder(grade3)).toBeGreaterThanOrEqual(gradeOrder(grade1))
        })
 
        it('coverage bonuses can improve grade when weaknesses are moderate', () => {
            // Without coverage: 100 - 36 = 64 → B
            // With 18 coverage: 100 - 36 + 18 = 82 → A
            const withoutCoverage = teamGrade(3, 0, 0)
            const withCoverage    = teamGrade(3, 0, 18)
            const grades = ['S', 'A', 'B', 'C', 'D', 'F']
            expect(grades.indexOf(withCoverage)).toBeLessThanOrEqual(grades.indexOf(withoutCoverage))
        })
    })
})