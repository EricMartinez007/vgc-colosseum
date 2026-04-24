import { useEffect, useState } from "react"
import { getPokemonLearnsets } from "../../services/movesServices"
import { getPokemon } from "../../services/pokemonServices"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"
import "./DamageCalculator.css"
import { calculateStat, getStageMultiplier } from "../../utils/statUtils"

const immunities = {
    1: [14],   // Normal immune to Ghost
    7: [14],   // Fighting immune to Ghost
    9: [5],    // Ground immune to Electric
    14: [1, 7], // Ghost immune to Normal/Fighting
    17: [8],   // Steel immune to Poison
    18: [15],  // Fairy immune to Dragon
}

export const DamageCalculator = () => {
    const [allPokemon, setAllPokemon] = useState([])
    const [allTypes, setAllTypes] = useState([])
    const [allTypeMatchups, setAllTypeMatchups] = useState([])
    const [selectedAttacker, setSelectedAttacker] = useState({})
    const [selectedDefender, setSelectedDefender] = useState({})
    const [selectedMove, setSelectedMove] = useState({})
    const [attackerTypes, setAttackerTypes] = useState([])
    const [defenderTypes, setDefenderTypes] = useState([])
    const [pokemonLearnset, setPokemonLearnset] = useState([])
    const [attackerSpread, setAttackerSpread] = useState({
        atkEv: 0, atkIv: 31, spAtkEv: 0, spAtkIv: 31
    })
    const [defenderSpread, setDefenderSpread] = useState({
        hpEv: 0, hpIv: 31, defEv: 0, defIv: 31, spDefEv: 0, spDefIv: 31
    })
    const [damageResult, setDamageResult] = useState(null)
    const [attackerStages, setAttackerStages] = useState(0)
    const [defenderStages, setDefenderStages] = useState(0)
    const [weather, setWeather] = useState("none")
    const [terrain, setTerrain] = useState("none")
    const [attackerItem, setAttackerItem] = useState("none")
    const [isCritical, setIsCritical] = useState(false)

    useEffect(() => {
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
        getAllTypes().then((typesArray) => {
            setAllTypes(typesArray)
        })
        getTypeMatchups().then((typeMatchupsArray) => {
            setAllTypeMatchups(typeMatchupsArray)
        })
    }, [])

    const handleAttackerSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedAttacker({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedAttacker(matchPokemon)
        getPokemonTypeByPokemonId(parseInt(evt.target.value)).then((typesArray) => {
            setAttackerTypes(typesArray)
        })
        getPokemonLearnsets(evt.target.value).then((movesArray) => {
            setPokemonLearnset(movesArray)
        })
    }

    const handleDefenderSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedDefender({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedDefender(matchPokemon)
        getPokemonTypeByPokemonId(parseInt(evt.target.value)).then((typesArray) => {
            setDefenderTypes(typesArray)
        })
    }

    const handleMoveSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedMove({})
            return
        }
        const matchLearnset = pokemonLearnset.find(pokemonMove => pokemonMove.move.id === parseInt(evt.target.value))
            setSelectedMove(matchLearnset.move)
    }

    const handleWeatherSelect = (evt) => {
        setWeather(evt.target.value)
    }

    const handleTerrainSelect = (evt) => {
        setTerrain(evt.target.value)
    }

    const handleItemSelect = (evt) => {
        setAttackerItem(evt.target.value)
    }

    const handleCriticalToggle = () => {
        setIsCritical(!isCritical)
    }

    const handleAttackerSpreadChange = (field, value) => {
        // Only cap EVs, IVs can be freely set from 0-31
        if (field.includes("Ev")) {
            const currentTotal =  attackerSpread.atkEv + attackerSpread.spAtkEv 
            const newTotal = currentTotal - attackerSpread[field] + parseInt(value)
            if (newTotal > 508) return
        }
        // This will update for both EVs and IVs (EVs go through stat check first)
        setAttackerSpread({
            ...attackerSpread,
            [field]: parseInt(value)
        })
    }

    const handleDefenderSpreadChange = (field, value) => {
        if (field.includes("Ev")) {
            const currentTotal =  defenderSpread.hpEv + defenderSpread.defEv + defenderSpread.spDefEv
            const newTotal = currentTotal - defenderSpread[field] + parseInt(value)
            if (newTotal > 508) return
        }
        setDefenderSpread({
            ...defenderSpread,
            [field]: parseInt(value)
        })
    }

 

    // Needed MAJOR help with this function. Not afraid to admit it lol 
    const calculateDamage = () => {
        if (!selectedAttacker.id || !selectedDefender.id || !selectedMove.id) return null 

        let multiplier = 1

        // First we need to calculate type effectiveness multiplier
        defenderTypes.forEach((defenderType) => {
            const defTypeId = defenderType.typeId

            if (immunities[defTypeId]?.includes(selectedMove.typeId)) {
                multiplier *= 0
                return
            }

            // Find the MOVE'S type matchup
            const matchup = allTypeMatchups.find(matchups => matchups.typeId === selectedMove.typeId)

            // Does the move's type hit the defender's type super effectively?
            if (matchup?.strongAgainst.includes(defTypeId)) {
                multiplier *= 2
            // Does the defender's type resist the move's type?
            } else if (matchup?.weakAgainst.includes(defTypeId)) {
                multiplier *= 0.5
            }
        })

        // Check for STAB, if the move's type matches any of the attacker's types, multiply damage by 1.5x
        const hasStab = attackerTypes.some(attackerType => attackerType.typeId === selectedMove.typeId)
        if (hasStab) multiplier *= 1.5

        // Weather modifier
        if (weather === "sun" && selectedMove.typeId === 2) multiplier *= 1.5      // Fire in sun
        if (weather === "sun" && selectedMove.typeId === 3) multiplier *= 0.5      // Water in sun
        if (weather === "rain" && selectedMove.typeId === 3) multiplier *= 1.5     // Water in rain
        if (weather === "rain" && selectedMove.typeId === 2) multiplier *= 0.5     // Fire in rain

        // Terrain modifier
        if (terrain === "electric" && selectedMove.typeId === 5) multiplier *= 1.3
        if (terrain === "grassy" && selectedMove.typeId === 4) multiplier *= 1.3
        if (terrain === "psychic" && selectedMove.typeId === 11) multiplier *= 1.3
        if (terrain === "misty" && selectedMove.typeId === 15) multiplier *= 0.5

        // Item modifier
        if (attackerItem === "lifeOrb") multiplier *= 1.3
        if (attackerItem === "choiceBand" && selectedMove.category === "physical") multiplier *= 1.5
        if (attackerItem === "choiceSpecs" && selectedMove.category === "special") multiplier *= 1.5

        // Critical hit
        if (isCritical) multiplier *= 1.5

        // Now we determine the attack and defense stats based on move category (physical or special). If its physical use attack and defense stats, if its special then use special attack and special defense stats
        const attackStat = selectedMove.category ===  "physical"
            ? calculateStat(selectedAttacker.baseStats.attack, attackerSpread.atkIv, attackerSpread.atkEv, false)
            : calculateStat(selectedAttacker.baseStats.specialAttack, attackerSpread.spAtkIv, attackerSpread.spAtkEv, false)

        const defenseStat = selectedMove.category === "physical"
            ? calculateStat(selectedDefender.baseStats.defense, defenderSpread.defIv, defenderSpread.defEv, false)
            : calculateStat(selectedDefender.baseStats.specialDefense, defenderSpread.spDefIv, defenderSpread.spDefEv, false)

        const defenderHp = calculateStat(selectedDefender.baseStats.hp, defenderSpread.hpIv, defenderSpread.hpEv, true)

        const adjustedAttackStat = Math.floor(attackStat * getStageMultiplier(attackerStages))
        const adjustedDefenseStat = Math.floor(defenseStat * getStageMultiplier(defenderStages))

        // Base Damage formula 
        const baseDamage = Math.floor(Math.floor(Math.floor(2 * 50 / 5 + 2) * selectedMove.power * adjustedAttackStat / adjustedDefenseStat) / 50 + 2)

        // Apply rolls (0.85 to 1.0) and multiplier (moves can have between a high roll (100%) and low roll (85%) for damage)
        const minDamage = Math.floor(Math.floor(baseDamage * 0.85) * multiplier)
        const maxDamage = Math.floor(baseDamage * multiplier)

        // Calculate the percentage of defender's HP will be lost. Divides damage by defender's total HP to show what percentage of their health is taken. "Does this OHKO?"
        const minPercent = ((minDamage / defenderHp) * 100).toFixed(1)
        const maxPercent = ((maxDamage / defenderHp) * 100).toFixed(1)

        return { minDamage, maxDamage, minPercent, maxPercent, multiplier, defenderHp }
    }

    const handleCalculateDamageResult = () => {
        const result = calculateDamage()
        setDamageResult(result)
    }

    return (
        <div className="page-container">
            <h1 className="page-title damage-calc-title">💥 Damage Calculator</h1>
            <span className="page-subtitle damage-calc-subtitle">Calculate damage between any two Pokémon!</span>
            <div className="calc-layout">
    
                <div className="calc-attacker">
                    <div className="calc-attacker-banner">
                        <h2 className="calc-banner-title">⚔️ The Attacker</h2>
                    </div>
                    <div className="calc-inner">
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-pokemon">Pokémon Select</label>
                            <select onChange={handleAttackerSelect}>
                                <option value="0">Choose A Pokémon</option>
                                {allPokemon.map((pokemon) => (
                                    <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedAttacker.id && (
                            <div className="dc-stats-container">
                                <div className="dc-stats-header">
                                    <span className="dc-header-stat-name">Stats</span>
                                    <span className="dc-header-base dc-label-base">Base</span>
                                    <span className="dc-header-ev dc-label-ev">EVs</span>
                                    <span className="dc-header-iv dc-label-iv">IVs</span>
                                    <span className="dc-header-total dc-label-total">Total</span>
                                </div>
                                <ul className="dc-pokemon-stats">
                                    <li className="dc-pokemon-stat">
                                        <span className="label-atk">Atk</span>
                                        <span className="dc-value-base">{selectedAttacker.baseStats.attack}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="252"
                                            value={attackerSpread.atkEv}
                                            onChange={(evt) => handleAttackerSpreadChange("atkEv", evt.target.value)}
                                        />
                                        <span className="dc-ev-value dc-value-ev">{attackerSpread.atkEv}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="31"
                                            value={attackerSpread.atkIv}
                                            onChange={(evt) => handleAttackerSpreadChange("atkIv", evt.target.value)}
                                        />
                                        <span className="dc-iv-value dc-value-iv">{attackerSpread.atkIv}</span>
                                        <span className="dc-value-total">{calculateStat(selectedAttacker.baseStats.attack, attackerSpread.atkIv, attackerSpread.atkEv, false)}</span>
                                    </li>
                                    <li className="dc-pokemon-stat">
                                        <span className="label-spatk">Sp. Atk.</span>
                                        <span className="dc-value-base">{selectedAttacker.baseStats.specialAttack}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="252"
                                            value={attackerSpread.spAtkEv}
                                            onChange={(evt) => handleAttackerSpreadChange("spAtkEv", evt.target.value)}
                                        />
                                        <span className="dc-ev-value dc-value-ev">{attackerSpread.spAtkEv}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="31"
                                            value={attackerSpread.spAtkIv}
                                            onChange={(evt) => handleAttackerSpreadChange("spAtkIv", evt.target.value)}
                                        />
                                        <span className="dc-iv-value dc-value-iv">{attackerSpread.spAtkIv}</span>
                                        <span className="dc-value-total">{calculateStat(selectedAttacker.baseStats.specialAttack, attackerSpread.spAtkIv, attackerSpread.spAtkEv, false)}</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                        <label className="dc-dropdown-label label-stages">Attacker Stages</label>
                        <select 
                            defaultValue="0"
                            onChange={(evt) => setAttackerStages(parseInt(evt.target.value))}>
                            {Array.from({length: 13}, (_, i) => i - 6).map(stage => (
                                <option key={stage} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="calc-conditions">
                    <div className="calc-conditions-banner">
                        <h2 className="calc-banner-title">⚡ Combat Variables</h2>
                    </div>
                    <div className="calc-inner">
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-move">Move Select</label>
                            <select value={selectedMove.id || "0"} onChange={handleMoveSelect}>
                                <option value="0">Choose a Move</option>
                                {pokemonLearnset.map((pokemonMove) => (
                                    <option value={pokemonMove.move.id} key={pokemonMove.id}>{pokemonMove.move.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-weather">Weather Select</label>
                            <select onChange={handleWeatherSelect}>
                                <option value="none">No Weather</option>
                                <option value="sun">Sun</option>
                                <option value="rain">Rain</option>
                            </select>
                        </div>
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-terrain">Terrain Select</label>
                            <select onChange={handleTerrainSelect}>
                                <option value="none">No Terrain</option>
                                <option value="electric">Electric</option>
                                <option value="grassy">Grassy</option>
                                <option value="psychic">Psychic</option>
                                <option value="misty">Misty</option>
                            </select>
                        </div>
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-atk-item">Attacker Item Select</label>
                            <select onChange={handleItemSelect}>
                                <option value="none">No Damage Mult Item</option>
                                <option value="lifeOrb">Life Orb</option>
                                <option value="choiceBand">Choice Band</option>
                                <option value="choiceSpecs">Choice Specs</option>
                            </select>
                        </div>
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-crit">Critical Hit</label>
                            <div className="toggle-container" onClick={handleCriticalToggle}>
                                <div className={`toggle-switch ${isCritical ? "toggle-on" : ""}`}>
                                    <div className="toggle-knob"></div>
                                </div>
                                <span className="toggle-label">{isCritical ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="calc-defender">
                    <div className="calc-defender-banner">
                        <h2 className="calc-banner-title">🛡️ The Defender</h2>
                    </div>
                    <div className="calc-inner">
                        <div className="dc-dropdown-group">
                            <label className="dc-dropdown-label label-pokemon">Pokémon Select</label>
                            <select onChange={handleDefenderSelect}>
                                <option value="0">Choose A Pokémon</option>
                                {allPokemon.map((pokemon) => (
                                    <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedDefender.id && (
                            <div className="dc-stats-container">
                                <div className="dc-stats-header">
                                    <span className="dc-header-stat-name">Stats</span>
                                    <span className="dc-header-base dc-label-base">Base</span>
                                    <span className="dc-header-ev dc-label-ev">EVs</span>
                                    <span className="dc-header-iv dc-label-iv">IVs</span>
                                    <span className="dc-header-total dc-label-total">Total</span>
                                </div>
                                <ul className="dc-pokemon-stats">
                                    <li className="dc-pokemon-stat">
                                        <span className="label-hp">Hp</span>
                                        <span className="dc-value-base">{selectedDefender.baseStats.hp}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="252"
                                            value={defenderSpread.hpEv}
                                            onChange={(evt) => handleDefenderSpreadChange("hpEv", evt.target.value)}
                                        />
                                        <span className="dc-ev-value dc-value-ev">{defenderSpread.hpEv}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="31"
                                            value={defenderSpread.hpIv}
                                            onChange={(evt) => handleDefenderSpreadChange("hpIv", evt.target.value)}
                                        />
                                        <span className="dc-iv-value dc-value-iv">{defenderSpread.hpIv}</span>
                                        <span className="dc-value-total">{calculateStat(selectedDefender.baseStats.hp, defenderSpread.hpIv, defenderSpread.hpEv, true)}</span>
                                    </li>
                                    <li className="dc-pokemon-stat">
                                        <span className="label-def">Def</span>
                                        <span className="dc-value-base">{selectedDefender.baseStats.defense}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="252"
                                            value={defenderSpread.defEv}
                                            onChange={(evt) => handleDefenderSpreadChange("defEv", evt.target.value)}
                                        />
                                        <span className="dc-ev-value dc-value-ev">{defenderSpread.defEv}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="31"
                                            value={defenderSpread.defIv}
                                            onChange={(evt) => handleDefenderSpreadChange("defIv", evt.target.value)}
                                        />
                                        <span className="dc-iv-value dc-value-iv">{defenderSpread.defIv}</span>
                                        <span className="dc-value-total">{calculateStat(selectedDefender.baseStats.defense, defenderSpread.defIv, defenderSpread.defEv, false)}</span>
                                    </li>
                                    <li className="dc-pokemon-stat">
                                        <span className="label-spdef">Sp. Def.</span>
                                        <span className="dc-value-base">{selectedDefender.baseStats.specialDefense}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="252"
                                            value={defenderSpread.spDefEv}
                                            onChange={(evt) => handleDefenderSpreadChange("spDefEv", evt.target.value)}
                                        />
                                        <span className="dc-ev-value dc-value-ev">{defenderSpread.spDefEv}</span>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="31"
                                            value={defenderSpread.spDefIv}
                                            onChange={(evt) => handleDefenderSpreadChange("spDefIv", evt.target.value)}
                                        />
                                        <span className="dc-iv-value dc-value-iv">{defenderSpread.spDefIv}</span>
                                        <span className="dc-value-total">{calculateStat(selectedDefender.baseStats.specialDefense, defenderSpread.spDefIv, defenderSpread.spDefEv, false)}</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                        <label className="dc-dropdown-label label-stages">Defender Stages</label>
                        <select 
                            defaultValue="0"
                            onChange={(evt) => setDefenderStages(parseInt(evt.target.value))}>
                            {Array.from({length: 13}, (_, i) => i - 6).map(stage => (
                                <option key={stage} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="dc-btn-container">
                <button
                    className="dc-btn-calculate-dmg"
                    onClick={handleCalculateDamageResult}
                >
                    Calculate Damage
                </button>
            </div>
            
            <div className="dc-results">
                <div className="dc-results-banner">
                    <h2 className="calc-banner-title">💥 Damage Report</h2>
                </div>
                <div className="dc-results-inner">
                    {damageResult ? (
                        <>
                            <p className="type-effectiveness">
                                {damageResult.multiplier === 0 ? "🚫 Immune!" :
                                damageResult.multiplier >= 3 ? "🔥 Super Effective! (3x+)" :
                                damageResult.multiplier >= 2 ? "⚡ Super Effective! (2x)" :
                                damageResult.multiplier >= 1.5 ? "✨ Super Effective! (1.5x)" :
                                damageResult.multiplier < 1 && damageResult.multiplier > 0 ? "❄️ Not Very Effective..." :
                                "➡️ Normal Effectiveness"}
                            </p>
                            <p className={`damage-result ${
                                damageResult.maxPercent >= 100 ? "result-ohko" :
                                damageResult.minPercent >= 50 ? "result-2hko" : "result-safe"
                            }`}>
                                {damageResult.minDamage} - {damageResult.maxDamage} ({damageResult.minPercent}% - {damageResult.maxPercent}%)
                                <span className="result-label">
                                    {damageResult.maxPercent >= 100 ? "💀 OHKO!" :
                                    damageResult.minPercent >= 50 ? "⚠️ 2HKO Range" : "✅ Safe"}
                                </span>
                            </p>
                        </>
                    ) : (
                        <p className="dc-results-placeholder">Select a Pokémon, move, and defender to calculate damage!</p>
                    )}
                </div>
            </div>
        </div>
    )
}