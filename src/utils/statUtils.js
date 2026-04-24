// src/utils/statUtils.js
// Pure functions extracted from DamageCalculator.jsx and SpeedTiers.jsx
 
// ─── Nature modifiers ───────────────────────────────────────────────────────
export const NATURE_SPEED_MODIFIERS = {
    "Timid":   1.1,
    "Jolly":   1.1,
    "Hasty":   1.1,
    "Naive":   1.1,
    "Brave":   0.9,
    "Relaxed": 0.9,
    "Quiet":   0.9,
    "Sassy":   0.9,
}
 
// ─── Stat Calculation ────────────────────────────────────────────────────────
/**
 * Calculates a single Pokémon stat at level 50.
 * @param {number} base - Base stat value
 * @param {number} iv   - Individual value (0-31)
 * @param {number} ev   - Effort value (0-252)
 * @param {boolean} isHp - true → use HP formula, false → use non-HP formula
 * @returns {number} Final stat (integer, floored)
 */
export const calculateStat = (base, iv, ev, isHp) => {
    if (isHp) {
        return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * 50 / 100) + 50 + 10)
    }
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * 50 / 100) + 5)
}
 
// ─── Speed Calculation ───────────────────────────────────────────────────────
/**
 * Calculates a Pokémon's final Speed stat at level 50, including nature modifier.
 * @param {number} baseSpeed  - Base Speed stat
 * @param {number} iv         - Speed IV (0-31)
 * @param {number} ev         - Speed EV (0-252)
 * @param {string} natureName - Nature name string (e.g. "Jolly", "Brave")
 * @returns {number} Final Speed stat (integer, floored)
 */
export const calculateSpeed = (baseSpeed, iv, ev, natureName) => {
    const natureModifier = NATURE_SPEED_MODIFIERS[natureName] || 1.0
    return Math.floor(
        Math.floor((2 * baseSpeed + iv + Math.floor(ev / 4)) * 50 / 100 + 5) * natureModifier
    )
}
 
// ─── Stage Multiplier ────────────────────────────────────────────────────────
/**
 * Returns the stat stage multiplier for a given stage (-6 to +6).
 * @param {number} stage - Stat stage
 * @returns {number} Multiplier
 */
export const getStageMultiplier = (stage) => {
    if (stage > 0) return (2 + stage) / 2
    return 2 / (2 + Math.abs(stage))
}
 
// ─── Team Grade ──────────────────────────────────────────────────────────────
/**
 * Grades a team's type coverage from S to F.
 * @param {number} criticalCount - Types where 3+ Pokémon are weak
 * @param {number} warningCount  - Types where exactly 2 Pokémon are weak
 * @param {number} coverageCount - Number of types the team hits super effectively
 * @returns {string} Grade letter: S | A | B | C | D | F
 */
export const teamGrade = (criticalCount, warningCount, coverageCount) => {
    let score = 100
    score -= criticalCount * 12
    score -= warningCount * 4
    score += coverageCount * 1
 
    if (score >= 95) return "S"
    if (score >= 75) return "A"
    if (score >= 58) return "B"
    if (score >= 40) return "C"
    if (score >= 25) return "D"
    return "F"
}
 
// ─── Showdown Parser ─────────────────────────────────────────────────────────
const NAME_MAP = {
    "Urshifu":               "Urshifu-Single",
    "Calyrex-Ice Rider":     "Calyrex-Ice",
    "Calyrex-Shadow Rider":  "Calyrex-Shadow",
    "Zacian-Crowned Sword":  "Zacian-Crowned",
    "Zamazenta-Crowned Shield": "Zamazenta-Crowned",
}
 
/**
 * Parses a Pokémon Showdown export string into an array of Pokémon objects.
 * @param {string} showdownString - Raw Showdown paste
 * @returns {Array} Parsed team array
 */
export const parseShowdownString = (showdownString) => {
    const cleanedString = showdownString
        .split("\n")
        .map(line => line.trim())
        .join("\n")
 
    const blocks = cleanedString.split("\n\n").filter(block => block.trim() !== "")
 
    return blocks.map(block => {
        const lines = block.split("\n")
        const [pokemonName, itemName] = lines[0].split("@")
        const cleanPokemonName = NAME_MAP[pokemonName.trim()] || pokemonName.trim()
        const cleanItemName = itemName ? itemName.trim() : ""
 
        let abilityName = ""
        let natureName = ""
        let moves = []
        let evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 }
        let ivs = { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spd: 31 }
 
        lines.slice(1).forEach(line => {
            if (line.startsWith("Ability:")) abilityName = line.split(":")[1].trim()
            if (line.endsWith(" Nature")) natureName = line.replace(" Nature", "").trim()
            if (line.startsWith("EVs:")) {
                const evParts = line.split(":")[1].split("/")
                evParts.forEach(part => {
                    const [amount, statName] = part.trim().split(" ")
                    if (statName === "HP")  evs.hp    = parseInt(amount)
                    if (statName === "Atk") evs.atk   = parseInt(amount)
                    if (statName === "Def") evs.def   = parseInt(amount)
                    if (statName === "SpA") evs.spAtk = parseInt(amount)
                    if (statName === "SpD") evs.spDef = parseInt(amount)
                    if (statName === "Spe") evs.spd   = parseInt(amount)
                })
            }
            if (line.startsWith("IVs:")) {
                const ivParts = line.split(":")[1].split("/")
                ivParts.forEach(part => {
                    const [amount, statName] = part.trim().split(" ")
                    if (statName === "HP")  ivs.hp    = parseInt(amount)
                    if (statName === "Atk") ivs.atk   = parseInt(amount)
                    if (statName === "Def") ivs.def   = parseInt(amount)
                    if (statName === "SpA") ivs.spAtk = parseInt(amount)
                    if (statName === "SpD") ivs.spDef = parseInt(amount)
                    if (statName === "Spe") ivs.spd   = parseInt(amount)
                })
            }
            if (line.startsWith("-")) moves.push(line.slice(2).trim())
        })
 
        return {
            pokemonName: cleanPokemonName,
            itemName: cleanItemName,
            abilityName,
            natureName: natureName || "Hardy",
            evs,
            ivs,
            moves,
        }
    })
}

// ─── Immunities ──────────────────────────────────────────────────────────────
export const IMMUNITIES = {
    1:  [14],    // Normal immune to Ghost
    7:  [14],    // Fighting immune to Ghost
    9:  [5],     // Ground immune to Electric
    14: [1, 7],  // Ghost immune to Normal/Fighting
    17: [8],     // Steel immune to Poison
    18: [15],    // Fairy immune to Dragon
}

// ─── Damage Calculation ──────────────────────────────────────────────────────
export const calculateDamage = ({
    attacker,
    defender,
    move,
    attackerTypes,
    defenderTypes,
    typeMatchups,
    attackerSpread,
    defenderSpread,
    attackerStages = 0,
    defenderStages = 0,
    weather = "none",
    terrain = "none",
    attackerItem = "none",
    isCritical = false,
}) => {
    if (!attacker || !defender || !move) return null

    let multiplier = 1

    // Type effectiveness
    defenderTypes.forEach((defenderType) => {
        const defTypeId = defenderType.typeId

        if (IMMUNITIES[defTypeId]?.includes(move.typeId)) {
            multiplier *= 0
            return
        }

        const matchup = typeMatchups.find(m => m.typeId === move.typeId)
        if (matchup?.strongAgainst.includes(defTypeId)) {
            multiplier *= 2
        } else if (matchup?.weakAgainst.includes(defTypeId)) {
            multiplier *= 0.5
        }
    })

    // STAB
    const hasStab = attackerTypes.some(t => t.typeId === move.typeId)
    if (hasStab) multiplier *= 1.5

    // Weather
    if (weather === "sun"  && move.typeId === 2) multiplier *= 1.5
    if (weather === "sun"  && move.typeId === 3) multiplier *= 0.5
    if (weather === "rain" && move.typeId === 3) multiplier *= 1.5
    if (weather === "rain" && move.typeId === 2) multiplier *= 0.5

    // Terrain
    if (terrain === "electric" && move.typeId === 5)  multiplier *= 1.3
    if (terrain === "grassy"   && move.typeId === 4)  multiplier *= 1.3
    if (terrain === "psychic"  && move.typeId === 11) multiplier *= 1.3
    if (terrain === "misty"    && move.typeId === 15) multiplier *= 0.5

    // Item
    if (attackerItem === "lifeOrb")                                     multiplier *= 1.3
    if (attackerItem === "choiceBand"  && move.category === "physical") multiplier *= 1.5
    if (attackerItem === "choiceSpecs" && move.category === "special")  multiplier *= 1.5

    // Crit
    if (isCritical) multiplier *= 1.5

    // Stats
    const attackStat = move.category === "physical"
        ? calculateStat(attacker.baseStats.attack,        attackerSpread.atkIv,   attackerSpread.atkEv,   false)
        : calculateStat(attacker.baseStats.specialAttack, attackerSpread.spAtkIv, attackerSpread.spAtkEv, false)

    const defenseStat = move.category === "physical"
        ? calculateStat(defender.baseStats.defense,        defenderSpread.defIv,   defenderSpread.defEv,   false)
        : calculateStat(defender.baseStats.specialDefense, defenderSpread.spDefIv, defenderSpread.spDefEv, false)

    const defenderHp = calculateStat(defender.baseStats.hp, defenderSpread.hpIv, defenderSpread.hpEv, true)

    const adjustedAttackStat  = Math.floor(attackStat  * getStageMultiplier(attackerStages))
    const adjustedDefenseStat = Math.floor(defenseStat * getStageMultiplier(defenderStages))

    // Base damage formula
    const baseDamage = Math.floor(
        Math.floor(Math.floor(2 * 50 / 5 + 2) * move.power * adjustedAttackStat / adjustedDefenseStat) / 50 + 2
    )

    const minDamage = Math.floor(Math.floor(baseDamage * 0.85) * multiplier)
    const maxDamage = Math.floor(baseDamage * multiplier)

    const minPercent = ((minDamage / defenderHp) * 100).toFixed(1)
    const maxPercent = ((maxDamage / defenderHp) * 100).toFixed(1)

    return { minDamage, maxDamage, minPercent, maxPercent, multiplier, defenderHp }
}