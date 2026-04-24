// src/test/utils/teamFilters.test.js
import { describe, it, expect } from 'vitest'
import { filterByPokemon, filterByFormat } from '../../utils/statUtils'

// ─── Fixtures based on db.json ────────────────────────────────────────────────
const TEAMS = [
    {
        id: 1,
        name: "Trick Room Terror",
        formatId: 2,
        pokemon: [
            { pokemonId: 1 },  // Incineroar
            { pokemonId: 12 }, // Iron Hands
            { pokemonId: 7 },  // Amoonguss
            { pokemonId: 38 }, // Porygon2
            { pokemonId: 45 }, // Ursaluna
            { pokemonId: 37 }, // Cresselia
        ]
    },
    {
        id: 2,
        name: "Sun and Guns",
        formatId: 2,
        pokemon: [
            { pokemonId: 2 },  // Flutter Mane
            { pokemonId: 3 },  // Rillaboom
            { pokemonId: 1 },  // Incineroar
            { pokemonId: 40 }, // Torkoal
            { pokemonId: 7 },  // Amoonguss
            { pokemonId: 26 }, // Gholdengo
        ]
    },
    {
        id: 3,
        name: "Sand Offense",
        formatId: 1,
        pokemon: [
            { pokemonId: 9 },  // Garchomp
            { pokemonId: 5 },  // Landorus-T
            { pokemonId: 15 }, // Heatran
            { pokemonId: 8 },  // Chien-Pao
            { pokemonId: 47 }, // Hydreigon
            { pokemonId: 7 },  // Amoonguss
        ]
    },
]

describe('filterByPokemon()', () => {

    // ── No filter ───────────────────────────────────────────────────────────────
    describe('no filter selected', () => {
        it('returns all teams when selectedPokemonId is null', () => {
            expect(filterByPokemon(TEAMS, null)).toHaveLength(3)
        })

        it('returns all teams when selectedPokemonId is 0', () => {
            expect(filterByPokemon(TEAMS, 0)).toHaveLength(3)
        })

        it('returns all teams when selectedPokemonId is undefined', () => {
            expect(filterByPokemon(TEAMS, undefined)).toHaveLength(3)
        })
    })

    // ── Active filter ───────────────────────────────────────────────────────────
    describe('active filter', () => {
        it('returns only teams containing the selected Pokémon', () => {
            // Incineroar (id 1) is on teams 1 and 2
            const result = filterByPokemon(TEAMS, 1)
            expect(result).toHaveLength(2)
            expect(result.map(t => t.id)).toEqual([1, 2])
        })

        it('returns all 3 teams when filtering by Amoonguss (on every team)', () => {
            // Amoonguss (id 7) appears on all 3 teams
            const result = filterByPokemon(TEAMS, 7)
            expect(result).toHaveLength(3)
        })

        it('returns only 1 team when filtering by a unique Pokémon', () => {
            // Torkoal (id 40) only on Sun and Guns
            const result = filterByPokemon(TEAMS, 40)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Sun and Guns")
        })

        it('returns empty array when no teams contain the selected Pokémon', () => {
            // pokemonId 999 doesn't exist in any team
            const result = filterByPokemon(TEAMS, 999)
            expect(result).toHaveLength(0)
        })

        it('returns the correct team object (not just id)', () => {
            const result = filterByPokemon(TEAMS, 40)
            expect(result[0]).toHaveProperty('name', 'Sun and Guns')
            expect(result[0]).toHaveProperty('formatId', 2)
        })
    })
})

describe('filterByFormat()', () => {

    // ── No filter ───────────────────────────────────────────────────────────────
    describe('no filter selected', () => {
        it('returns all teams when selectedFormatId is null', () => {
            expect(filterByFormat(TEAMS, null)).toHaveLength(3)
        })

        it('returns all teams when selectedFormatId is 0', () => {
            expect(filterByFormat(TEAMS, 0)).toHaveLength(3)
        })

        it('returns all teams when selectedFormatId is undefined', () => {
            expect(filterByFormat(TEAMS, undefined)).toHaveLength(3)
        })
    })

    // ── Active filter ───────────────────────────────────────────────────────────
    describe('active filter', () => {
        it('returns only Doubles teams (formatId 2)', () => {
            const result = filterByFormat(TEAMS, 2)
            expect(result).toHaveLength(2)
            expect(result.map(t => t.name)).toEqual(["Trick Room Terror", "Sun and Guns"])
        })

        it('returns only Singles teams (formatId 1)', () => {
            const result = filterByFormat(TEAMS, 1)
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe("Sand Offense")
        })

        it('returns empty array when no teams match the format', () => {
            const result = filterByFormat(TEAMS, 999)
            expect(result).toHaveLength(0)
        })
    })

    // ── Combined filters ────────────────────────────────────────────────────────
    describe('combining both filters', () => {
        it('filters by Pokémon then format correctly', () => {
            // Incineroar (1) is on teams 1 and 2, both Doubles (formatId 2)
            const byPokemon = filterByPokemon(TEAMS, 1)
            const byFormat  = filterByFormat(byPokemon, 2)
            expect(byFormat).toHaveLength(2)
        })

        it('Amoonguss + Singles returns only Sand Offense', () => {
            // Amoonguss (7) is on all 3 teams, but only 1 is Singles
            const byPokemon = filterByPokemon(TEAMS, 7)
            const byFormat  = filterByFormat(byPokemon, 1)
            expect(byFormat).toHaveLength(1)
            expect(byFormat[0].name).toBe("Sand Offense")
        })

        it('returns empty array when combined filters match nothing', () => {
            // Torkoal (40) is only on Sun and Guns (Doubles), not Singles
            const byPokemon = filterByPokemon(TEAMS, 40)
            const byFormat  = filterByFormat(byPokemon, 1)
            expect(byFormat).toHaveLength(0)
        })
    })
})