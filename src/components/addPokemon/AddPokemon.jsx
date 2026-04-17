import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createPokemonTeam, getPokemon } from "../../services/pokemonServices"
import "./AddPokemon.css"
import { getPokemonAbilities } from "../../services/abilitiesServices"
import { getAllNatures } from "../../services/naturesServices"
import { getAllItems } from "../../services/itemsServices"
import { createPokemonMove, getPokemonLearnsets } from "../../services/movesServices"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"

export const AddPokemon = ({ currentUser }) => {
    const navigate = useNavigate()
    const { teamId } = useParams()

    const [allPokemon, setAllPokemon] = useState([])
    const [allNatures, setAllNatures] = useState([])
    const [allItems, setAllItems] = useState([])
    const [allTypes, setAllTypes] = useState([])
    const [allTypeMatchups, setAllTypeMatchups] =useState([])
    const [pokemonTypes, setPokemonTypes] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})
    const [pokemonAbilities, setPokemonAbilities] = useState([])
    const [pokemonLearnset, setPokemonLearnset] = useState([])
    //index 0 = move 1, index 1 = move 2....
    const [selectedMove, setSelectedMove] = useState([0, 0, 0, 0])
    const [newPokemonTeam, setNewPokemonTeam] = useState({
        pokemonId: 0,
        teamId: parseInt(teamId),
        abilityId: 0,
        natureId: 0,
        itemId: 0,
        hpIv: 31,
        atkIv: 31,
        defIv: 31,
        spAtkIv: 31,
        spDefIv: 31,
        spdIv: 31,
        hpEv: 0,
        atkEv: 0,
        defEv: 0,
        spAtkEv: 0,
        spDefEv: 0,
        spdEv: 0
    })

    const getAndSetAllPokemonAbilitiesNaturesItemsMoves = () => {
        getPokemon().then((pokemon) => {
            setAllPokemon(pokemon)
        })
        getAllNatures().then((naturesArray) => {
            setAllNatures(naturesArray)
        })
        getAllItems().then((itemsArray) => {
            setAllItems(itemsArray)
        })
        getTypeMatchups().then((typeMatchupsArray) => {
            setAllTypeMatchups(typeMatchupsArray)
        })
        getAllTypes().then((typesArray) => {
            setAllTypes(typesArray)
        })
    }

    useEffect(() => {
        getAndSetAllPokemonAbilitiesNaturesItemsMoves()
    }, [])

    const handleCreatePokemonTeam = () => {
        if (!newPokemonTeam.pokemonId || !newPokemonTeam.abilityId || !newPokemonTeam.natureId || !newPokemonTeam.itemId) {
            alert("Please select a Pokémon, ability, nature, and item!")
            return
        }

        createPokemonTeam(newPokemonTeam).then((createdPokemonTeam) => {
            //were going to use Promise.all to create all four moves at once, and it needs to be inside of the createdPokemonTeam .then because pokemonMoves requires the pokemonTeamId as a property
            Promise.all(
                selectedMove.map((moveId) =>{
                    return createPokemonMove({
                        pokemonTeamId: createdPokemonTeam.id,
                        moveId: moveId
                    })
                })
            ).then(() => {
                navigate(`/editteam/${teamId}`)
            })
        })
    }

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

        getPokemonAbilities(evt.target.value).then((abilitiesArray) => {
            setPokemonAbilities(abilitiesArray)
        })
        getPokemonLearnsets(evt.target.value).then((movesArray) => {
            setPokemonLearnset(movesArray)
        })

        setNewPokemonTeam({
            ...newPokemonTeam,
            pokemonId: parseInt(evt.target.value)
        })
    }

    const handleAbilitySelect = (evt) => {
        if (evt.target.value === "0") {
            setNewPokemonTeam({
            ...newPokemonTeam,
            abilityId: 0
        })
            return
        }
        setNewPokemonTeam({
            ...newPokemonTeam,
            abilityId: parseInt(evt.target.value)
        })
    }
    
     const handleNatureSelect = (evt) => {
        if (evt.target.value === "0") {
            setNewPokemonTeam({
            ...newPokemonTeam,
            natureId: 0
        })
            return
        }
        setNewPokemonTeam({
            ...newPokemonTeam,
            natureId: parseInt(evt.target.value)
        })
    }

     const handleItemSelect = (evt) => {
        if (evt.target.value === "0") {
            setNewPokemonTeam({
            ...newPokemonTeam,
            itemId: 0
        })
            return
        }
        setNewPokemonTeam({
            ...newPokemonTeam,
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
            const currentTotal = newPokemonTeam.hpEv + newPokemonTeam.atkEv + newPokemonTeam.defEv + newPokemonTeam.spAtkEv + newPokemonTeam.spDefEv + newPokemonTeam.spdEv

            //subtract the current total of the current stat before adding the new value so we don't double count it
            const newTotal = currentTotal - newPokemonTeam[field] + parseInt(value)

            // if we hit a total of 510 in EV points don't update state
            if (newTotal > 510) return
        }
        setNewPokemonTeam({
            ...newPokemonTeam,
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

    // the main difference between .map and .flatMap is that if the item were returning is an array, instead of returning multiple arrays inside of an array( [[4, 2], [6, 10, 3]] ), it will put them all into a single array ( [4, 2, 6, 10, 3] ). If a pokemon has two types then map would return two arrays of numbers inside of an array and we don't want that. 
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

    {selectedPokemon.id && pokemonTypes.length > 0 && (
        <div className="pokemon-display">
            ...Loading...
        </div>
    )}
    
    return (
        <div className="page-container">
            <div className="page-banner">
                <h2 className="page-banner-title">⚔️ Add Pokémon</h2>
            </div>
            <div className="pokemon-form-card">
                <div className="pokemon-form-image">
                    {selectedPokemon.id && (
                        <img src={selectedPokemon.imageUrl} alt="pokemon sprite" />
                    )}
                </div>
                <div className="pokemon-form-dropdowns">
                    <div className="dropdown-group">
                        <label className="dropdown-label label-pokemon">Pokémon</label>
                        <select onChange={handlePokemonSelect}>
                            <option value="0">Select a Pokémon</option>
                            {allPokemon.map((pokemon) => (
                                <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-ability">Ability</label>
                        <select onChange={handleAbilitySelect}>
                            <option value="0">Select an Ability</option>
                            {pokemonAbilities.map((pokemonAbility) => (
                                <option value={pokemonAbility.ability.id} key={pokemonAbility.id}>{pokemonAbility.ability.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 1</label>
                        <select onChange={(evt) => handleMoveSelect(evt, 0)}>
                            <option value="0">Select a Move</option>
                            {pokemonLearnset.map((pokemonMove) => (
                                <option value={pokemonMove.move.id} key={pokemonMove.id}>{pokemonMove.move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 2</label>
                        <select onChange={(evt) => handleMoveSelect(evt, 1)}>
                            <option value="0">Select a Move</option>
                            {pokemonLearnset.map((pokemonMove) => (
                                <option value={pokemonMove.move.id} key={pokemonMove.id}>{pokemonMove.move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-nature">Nature</label>
                        <select onChange={handleNatureSelect}>
                            <option value="0">Select a Nature</option>
                            {allNatures.map((nature) => (
                                <option value={nature.id} key={nature.id}>{nature.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-item">Item</label>
                        <select onChange={handleItemSelect}>
                            <option value="0">Select an Item</option>
                            {allItems.map((item) => (
                                <option value={item.id} key={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 3</label>
                        <select onChange={(evt) => handleMoveSelect(evt, 2)}>
                            <option value="0">Select a Move</option>
                            {pokemonLearnset.map((pokemonMove) => (
                                <option value={pokemonMove.move.id} key={pokemonMove.id}>{pokemonMove.move.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="dropdown-group">
                        <label className="dropdown-label label-move">Move 4</label>
                        <select onChange={(evt) => handleMoveSelect(evt, 3)}>
                            <option value="0">Select a Move</option>
                            {pokemonLearnset.map((pokemonMove) => (
                                <option value={pokemonMove.move.id} key={pokemonMove.id}>{pokemonMove.move.name}</option>
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
                                    value={newPokemonTeam.hpEv}
                                    onChange={(evt) => handleStatChange("hpEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.hpEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.hpIv}
                                    onChange={(evt) => handleStatChange("hpIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.hpIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.hp, newPokemonTeam.hpIv, newPokemonTeam.hpEv, true)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-atk">Atk</span>
                                <span className="value-base">{selectedPokemon.baseStats.attack}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={newPokemonTeam.atkEv}
                                    onChange={(evt) => handleStatChange("atkEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.atkEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.atkIv}
                                    onChange={(evt) => handleStatChange("atkIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.atkIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.attack, newPokemonTeam.atkIv, newPokemonTeam.atkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-def">Def</span>
                                <span className="value-base">{selectedPokemon.baseStats.defense}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={newPokemonTeam.defEv}
                                    onChange={(evt) => handleStatChange("defEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.defEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.defIv}
                                    onChange={(evt) => handleStatChange("defIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.defIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.defense, newPokemonTeam.defIv, newPokemonTeam.defEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spatk">Sp. Atk.</span>
                                <span className="value-base">{selectedPokemon.baseStats.specialAttack}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={newPokemonTeam.spAtkEv}
                                    onChange={(evt) => handleStatChange("spAtkEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.spAtkEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.spAtkIv}
                                    onChange={(evt) => handleStatChange("spAtkIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.spAtkIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.specialAttack, newPokemonTeam.spAtkIv, newPokemonTeam.spAtkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spdef">Sp. Def.</span>
                                <span className="value-base">{selectedPokemon.baseStats.specialDefense}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={newPokemonTeam.spDefEv}
                                    onChange={(evt) => handleStatChange("spDefEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.spDefEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.spDefIv}
                                    onChange={(evt) => handleStatChange("spDefIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.spDefIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.specialDefense, newPokemonTeam.spDefIv, newPokemonTeam.spDefEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spd">Speed</span>
                                <span className="value-base">{selectedPokemon.baseStats.speed}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="252"
                                    value={newPokemonTeam.spdEv}
                                    onChange={(evt) => handleStatChange("spdEv", evt.target.value)}
                                />
                                <span className="ev-value value-ev">{newPokemonTeam.spdEv}</span>
                                <input 
                                    type="range"
                                    min="0"
                                    max="31"
                                    value={newPokemonTeam.spdIv}
                                    onChange={(evt) => handleStatChange("spdIv", evt.target.value)}
                                />
                                <span className="iv-value value-iv">{newPokemonTeam.spdIv}</span>
                                <span className="value-total">{calculateStat(selectedPokemon.baseStats.speed, newPokemonTeam.spdIv, newPokemonTeam.spdEv, false)}</span>
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
                    className="btn-add-pokemon"
                    onClick={handleCreatePokemonTeam}
                >
                     Add Pokémon
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