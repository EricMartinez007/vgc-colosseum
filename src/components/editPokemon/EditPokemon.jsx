import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deletePokemonTeam, editPokemonTeam, getPokemon, getPokemonTeamById } from "../../services/pokemonServices"
import "./EditPokemon.css"
import { getAllAbilities } from "../../services/abilitiesServices"
import { getAllNatures } from "../../services/naturesServices"
import { getAllItems } from "../../services/itemsServices"
import { createPokemonMove, deletePokemonMove, getAllMoves, getPokemonMovesByPokemonTeamId } from "../../services/movesServices"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"


export const EditPokemon = () => {
    const { teamId, pokemonTeamId } = useParams()
    const navigate = useNavigate()
    
    const [pokemonTeam, setPokemonTeam] =useState({})
    const [allPokemon, setAllPokemon] = useState([])
    const [allAbilities, setAllAbilities] = useState([])
    const [allNatures, setAllNatures] = useState([])
    const [allItems, setAllItems] = useState([])
    const [allMoves, setAllMoves] = useState([])
    const [allTypes, setAllTypes] = useState([])
    const [allTypeMatchups, setAllTypeMatchups] =useState([])
    const [pokemonTypes, setPokemonTypes] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})
    //index 0 = move 1, index 1 = move 2....
    const [selectedMove, setSelectedMove] = useState([0, 0, 0, 0])

    

    // using Promise.all here will allow us to prepopulate the page with the current pokemon's data, but to do this we need to wait until BOTH getPokemon and getPokemonByTeamId fetches are done and then we can set the initial selectedPokemon to the one that matches our pokemonTeam object we fetched 
    useEffect(() => {
        Promise.all([
            getPokemon(),
            getPokemonTeamById(pokemonTeamId),
            getAllAbilities(),
            getAllNatures(),
            getAllItems(),
            getAllMoves(),
            getAllTypes(),
            getTypeMatchups(),
            getPokemonMovesByPokemonTeamId(pokemonTeamId)
        ]).then(([pokemonArray, pokemonTeamObj, abilitiesArray, naturesArray, itemsArray, movesArray, typesArray, typeMatchupsArray, existingMoves]) => {
            setAllPokemon(pokemonArray)
            setPokemonTeam(pokemonTeamObj)
            setAllAbilities(abilitiesArray)
            setAllNatures(naturesArray)
            setAllItems(itemsArray)
            setAllMoves(movesArray)
            setAllTypes(typesArray)
            setAllTypeMatchups(typeMatchupsArray)

            getPokemonTypeByPokemonId(pokemonTeamObj.pokemonId).then((pokemonTypeArray) => {
                setPokemonTypes(pokemonTypeArray)
            })
            
            const match = pokemonArray.find(pokemon => pokemon.id === pokemonTeamObj.pokemonId)
            setSelectedPokemon(match)
            
            // convert existing moves to just moveIds
            const moveIds = existingMoves.map(pokemonMove => pokemonMove.moveId)
            setSelectedMove(moveIds)
        })
    }, [pokemonTeamId])

    const handlePokemonSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedPokemon({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedPokemon(matchPokemon)

        getPokemonTypeByPokemonId(evt.target.value).then((typeArray) => {
                    setPokemonTypes(typeArray)
                })
        
                setPokemonTeam({
                    ...pokemonTeam,
                    pokemonId: parseInt(evt.target.value)
                })
    }

    const handleAbilitySelect = (evt) => {
        if (evt.target.value === "0") {
            setPokemonTeam({
            ...pokemonTeam,
            abilityId: 0
        })
            return
        }
        setPokemonTeam({
            ...pokemonTeam,
            abilityId: parseInt(evt.target.value)
        })
    }
    
     const handleNatureSelect = (evt) => {
        if (evt.target.value === "0") {
            setPokemonTeam({
            ...pokemonTeam,
            natureId: 0
        })
            return
        }
        setPokemonTeam({
            ...pokemonTeam,
            natureId: parseInt(evt.target.value)
        })
    }

     const handleItemSelect = (evt) => {
        if (evt.target.value === "0") {
            setPokemonTeam({
            ...pokemonTeam,
            itemId: 0
        })
            return
        }
        setPokemonTeam({
            ...pokemonTeam,
            itemId: parseInt(evt.target.value)
        })
    }

    const handleMoveSelect = (evt, index) => {
        const copy = [...selectedMove]
        copy[index] = parseInt(evt.target.value)
        setSelectedMove(copy)
    }

    const handleStatChange = (field, value) => {
        // adding cap to EVs. only run the cap check for the EV fields
        if (field.includes("Ev")){
            const currentTotal = pokemonTeam.hpEv + pokemonTeam.atkEv + pokemonTeam.defEv + pokemonTeam.spAtkEv + pokemonTeam.spDefEv + pokemonTeam.spdEv

            //subtract the current total of the current stat before adding the new value so we don't double count it
            const newTotal = currentTotal - pokemonTeam[field] + parseInt(value)

            // if we hit a total of 510 in EV points don't update state
            if (newTotal > 510) return
        }
        setPokemonTeam({
            ...pokemonTeam,
            [field]: parseInt(value)
        })
    }

    const calculateStat = (base, iv, ev, isHp) => {
        if (isHp) {
            const totalHpStat = Math.floor(((2 * base + iv + Math.floor(ev/4)) * 50 / 100) + 50 + 10)
            return totalHpStat
        }
        const totalStat = Math.floor(((2 * base + iv + Math.floor(ev/4)) * 50 / 100) + 5)
        return totalStat
    }

    const getStrongAgainstTypes = () => {
        // for each of the pokemon's types
        return pokemonTypes.flatMap((pokemonType) => {
            // find its matchups in the typeMatchups array
            const matchups = allTypeMatchups.find(typeMatchup => typeMatchup.typeId === pokemonType.typeId)
            // only pull the strongAgainst ids and find the their names
            return matchups.strongAgainst.map(typeId => {
                return allTypes.find(type => type.id === typeId)
                
            })
        })
    }

    const getWeakAgainstTypes = () => {
        return pokemonTypes.flatMap((pokemonType) => {
            const matchups = allTypeMatchups.find(typeMatchup => typeMatchup.typeId === pokemonType.typeId)
            return matchups.weakAgainst.map(typeId => {
                return allTypes.find(type => type.id === typeId)
            })
        })
    }

    const handleSaveEdits = () => {
        //edit the pokemonTeam
        editPokemonTeam(pokemonTeam).then(() => {
            // need to fetch existing moves
            getPokemonMovesByPokemonTeamId(pokemonTeamId).then((existingMoves) => {
                // need to delete all existing moves at once
                Promise.all(
                    existingMoves.map((move) => deletePokemonMove(move.id))
                ).then(() => {
                    // need to create all four new moves at once
                    Promise.all(
                        selectedMove.map((moveId) => 
                            createPokemonMove ({
                                pokemonTeamId: pokemonTeam.id,
                                moveId: moveId
                            })
                        )
                    // want to nav back to the editTeam page after all four new moves have been created
                    ).then(() => {
                        navigate(`/editteam/${teamId}`)
                    })
                })
            })
        })       
    }

    const handleDeletePokemon = () => {
        deletePokemonTeam(pokemonTeam).then(() => {
            navigate(`/editteam/${teamId}`)
        })
    }

    if (!pokemonTeam.id || !selectedPokemon.id) 
        return <div>Loading...</div>

    // added a value={selectedPokemon.id} to select to prepopulate it with the current pokemon the user is editing 
    return (
        <div className="page-container">
            <h1 className="page-title">Edit Pokémon </h1>
            <span className="page-subtitle">Edit a Pokémon to your team!</span>
            
            <div className="pokemon-form-card">
                <div className="pokemon-form-image">
                    {selectedPokemon.id && (
                        <img src={selectedPokemon.imageUrl} alt="pokemon sprite" />
                    )}
                </div>
                <div className="pokemon-form-dropdowns">
                    <div className="dropdown-group">
                        <label className="dropdown-label label-pokemon">Pokémon</label>
                        <select value={selectedPokemon.id} onChange={handlePokemonSelect}>
                            <option value="0">Select a Pokémon</option>
                            {allPokemon.map((pokemon) => (
                                <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-ability">Ability</label>
                        <select value={pokemonTeam.abilityId} onChange={handleAbilitySelect}>
                            <option value="0">Select an Ability</option>
                            {allAbilities.map((ability) => (
                                <option value={ability.id} key={ability.id}>{ability.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 1</label>
                        <select value={selectedMove[0]} onChange={(evt) => handleMoveSelect(evt, 0)}>
                            <option value="0">Select a Move</option>
                            {allMoves.map((move) => (
                                <option value={move.id} key={move.id}>{move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 2</label>
                        <select value={selectedMove[1]} onChange={(evt) => handleMoveSelect(evt, 1)}>
                            <option value="0">Select a Move</option>
                            {allMoves.map((move) => (
                                <option value={move.id} key={move.id}>{move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-nature">Nature</label>
                        <select value={pokemonTeam.natureId} onChange={handleNatureSelect}>
                            <option value="0">Select a Nature</option>
                            {allNatures.map((nature) => (
                                <option value={nature.id} key={nature.id}>{nature.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-item">Item</label>
                        <select value={pokemonTeam.itemId} onChange={handleItemSelect}>
                            <option value="0">Select an Item</option>
                            {allItems.map((item) => (
                                <option value={item.id} key={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 3</label>
                        <select value={selectedMove[2]} onChange={(evt) => handleMoveSelect(evt, 2)}>
                            <option value="0">Select a Move</option>
                            {allMoves.map((move) => (
                                <option value={move.id} key={move.id}>{move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 4</label>
                        <select value={selectedMove[3]} onChange={(evt) => handleMoveSelect(evt, 3)}>
                            <option value="0">Select a Move</option>
                            {allMoves.map((move) => (
                                <option value={move.id} key={move.id}>{move.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {selectedPokemon.id && (
                <div className="pokemon-stats-type-card">
                    <div className="pokemon-stats-container">
                        <div className="pokemon-stats-header">
                            <span className="header-stat-name label-stat-name">Pokémon Stats</span>
                            <span className="header-base label-base">Base</span>
                            <span className="header-ev label-ev">EVs</span>
                            <span className="header-iv label-iv">IVs</span>
                            <span className="header-total label-total">Total</span>
                        </div>
                        <ul className="pokemon-stats">
                            <li className="pokemon-stat">
                                <span className="label-hp">Hp</span>
                                <span className="value-base">{selectedPokemon.baseStats.hp}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.hpEv}
                                    onChange={(evt) => handleStatChange("hpEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.hpEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.hpIv}
                                    onChange={(evt) => handleStatChange("hpIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.hpIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.hp, pokemonTeam.hpIv, pokemonTeam.hpEv, true)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-atk">Atk</span>
                                <span className="value-base">{selectedPokemon.baseStats.attack}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.atkEv}
                                    onChange={(evt) => handleStatChange("atkEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.atkEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.atkIv}
                                    onChange={(evt) => handleStatChange("atkIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.atkIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.attack, pokemonTeam.atkIv, pokemonTeam.atkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-def">Def</span>
                                <span className="value-base">{selectedPokemon.baseStats.defense}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.defEv}
                                    onChange={(evt) => handleStatChange("defEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.defEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.defIv}
                                    onChange={(evt) => handleStatChange("defIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.defIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.defense, pokemonTeam.defIv, pokemonTeam.defEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spatk">Sp. Atk.</span>
                                <span className="value-base">{selectedPokemon.baseStats.specialAttack}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.spAtkEv}
                                    onChange={(evt) => handleStatChange("spAtkEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.spAtkEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.spAtkIv}
                                    onChange={(evt) => handleStatChange("spAtkIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.spAtkIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.specialAttack, pokemonTeam.spAtkIv, pokemonTeam.spAtkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spdef">Sp. Def.</span>
                                <span className="value-base">{selectedPokemon.baseStats.specialDefense}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.spDefEv}
                                    onChange={(evt) => handleStatChange("spDefEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.spDefEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.spDefIv}
                                    onChange={(evt) => handleStatChange("spDefIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.spDefIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.specialDefense, pokemonTeam.spDefIv, pokemonTeam.spDefEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spd">Speed</span>
                                <span className="value-base">{selectedPokemon.baseStats.speed}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={pokemonTeam.spdEv}
                                    onChange={(evt) => handleStatChange("spdEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{pokemonTeam.spdEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={pokemonTeam.spdIv}
                                    onChange={(evt) => handleStatChange("spdIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{pokemonTeam.spdIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.speed, pokemonTeam.spdIv, pokemonTeam.spdEv, false)}</span>
                            </li>
                        </ul>
                    </div>
                    <section className="type-display">
                        <div>
                            <h2 className="label-type">Type</h2>
                            <div className="type-badge-container">
                                {pokemonTypes.map((pokemonType) => (
                                <span className="type-badge" key={pokemonType.id}>{pokemonType.type.name}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="label-strong">Strong Against</h2>
                            <div className="type-badge-container">
                            {getStrongAgainstTypes().map((type) => (
                                <span className="type-badge" key={type.id}>{type.name}</span>
                            ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="label-weak">Weak Against</h2>
                            <div className="type-badge-container">
                            {getWeakAgainstTypes().map((type) => (
                                <span className="type-badge" key={type.id}>{type.name}</span>
                            ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}
            <div className="btn-container">
                <button
                    className="btn-save-edits"
                    onClick={handleSaveEdits}
                >
                     Save Edits
                </button>
                <button
                    className="btn-delete-pokemon"
                    onClick={handleDeletePokemon}
                >
                    Remove From Team
                </button>
                <button 
                    className="btn-go-back" 
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        </div>  
    )
}