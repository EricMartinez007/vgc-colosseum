import { useEffect, useState } from "react"
import { getPokemonLearnsets } from "../../services/movesServices"
import { getPokemon } from "../../services/pokemonServices"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"
import "./DamageCalculator.css"
import { calculateStat, calculateDamage } from "../../utils/statUtils"


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

    const handleCalculateDamageResult = () => {
        const result = calculateDamage({
            attacker: selectedAttacker,
            defender: selectedDefender,
            move: selectedMove,
            attackerTypes,
            defenderTypes,
            typeMatchups: allTypeMatchups,
            attackerSpread,
            defenderSpread,
            attackerStages,
            defenderStages,
            weather,
            terrain,
            attackerItem,
            isCritical,
        })
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