import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonTeamById } from "../../services/pokemonServices"
import { getTeamById } from "../../services/teamServices"
import "./ViewPokemon.css"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"
import { getPokemonMovesByPokemonTeamId } from "../../services/movesServices"

export const ViewPokemon = () => {
    const { teamId, pokemonTeamId } = useParams()
    const navigate = useNavigate()
    
    const [pokemonTeam, setPokemonTeam] = useState({})
    const [team, setTeam] = useState({})
    const [pokemonMoves, setPokemonMoves] = useState([])
    const [pokemonTypes, setPokemonTypes] = useState([])
    const [allTypes, setAllTypes] = useState([])
    const [allTypeMatchups, setAllTypeMatchups] =useState([])

    useEffect(() => {
         Promise.all([
            getPokemonTeamById(pokemonTeamId),
            getTeamById(teamId),
            getAllTypes(),
            getTypeMatchups(),
            getPokemonMovesByPokemonTeamId(pokemonTeamId)
        ]).then(([ pokemonTeamObj, teamObj, typesArray, typeMatchupsArray, existingMoves]) => {
            setPokemonTeam(pokemonTeamObj)
            setTeam(teamObj)
            setAllTypes(typesArray)
            setAllTypeMatchups(typeMatchupsArray)
            setPokemonMoves(existingMoves)
    
            getPokemonTypeByPokemonId(pokemonTeamObj.pokemonId).then((pokemonTypeArray) => {
                setPokemonTypes(pokemonTypeArray)
            })    
        })
    }, [pokemonTeamId, teamId])

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

    if (!pokemonTeam.id || !team.id) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-container vp-page">
            <h1 className="page-title">
                {team.user.name}'s {pokemonTeam.pokemon.name}
            </h1>
            <span className="page-subtitle">
                This Pokémon is part of {team.user.name}'s {team.name}
            </span>
            
            <div className="pokemon-form-card">
                <div className="pokemon-form-image">
                    {pokemonTeam.id && (
                        <img src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                    )}
                </div>
                <div className="pokemon-form-info">
                    <div className="card-info-group">
                        <span className="card-label card-label-pokemon">Pokémon</span>
                        <span className="card-info-value">{pokemonTeam.pokemon.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-ability">Ability</span>
                        <span className="card-info-value">{pokemonTeam.ability?.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-move">Move 1</span>
                        <span className="card-info-value">{pokemonMoves[0]?.move.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-move">Move 2</span>
                        <span className="card-info-value">{pokemonMoves[1]?.move.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-nature">Nature</span>
                        <span className="card-info-value">{pokemonTeam.nature?.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-item">Item</span>
                        <span className="card-info-value">{pokemonTeam.item?.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-move">Move 3</span>
                        <span className="card-info-value">{pokemonMoves[2]?.move.name}</span>
                    </div>
                    <div className="card-info-group">
                        <span className="card-label card-label-move">Move 4</span>
                        <span className="card-info-value">{pokemonMoves[3]?.move.name}</span>
                    </div>
                </div>
            </div>
            
            {pokemonTeam.id && (
                <div className="pokemon-stats-type-card">
                    <div className="pokemon-stats-container">
                        <div className="pokemon-stats-header">
                            <span className="vp-stat-name label-stat-name">Stats</span>
                            <span className="vp-base label-base">Base</span>
                            <span className="vp-ev label-ev">EVs</span>
                            <span className="vp-iv label-iv">IVs</span>
                            <span className="vp-total label-total">Total</span>
                        </div>
                        <ul className="pokemon-stats">
                            <li className="pokemon-stat">
                                <span className="label-hp">Hp</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.hp}</span>
                                <span className="ev-value value-ev">{pokemonTeam.hpEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.hpIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.hp, pokemonTeam.hpIv, pokemonTeam.hpEv, true)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-atk">Atk</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.attack}</span>
                                <span className="ev-value value-ev">{pokemonTeam.atkEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.atkIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.attack, pokemonTeam.atkIv, pokemonTeam.atkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-def">Def</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.defense}</span>
                                <span className="ev-value value-ev">{pokemonTeam.defEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.defIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.defense, pokemonTeam.defIv, pokemonTeam.defEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spatk">Sp. Atk.</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.specialAttack}</span>
                                <span className="ev-value value-ev">{pokemonTeam.spAtkEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.spAtkIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.specialAttack, pokemonTeam.spAtkIv, pokemonTeam.spAtkEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spdef">Sp. Def.</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.specialDefense}</span>
                                <span className="ev-value value-ev">{pokemonTeam.spDefEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.spDefIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.specialDefense, pokemonTeam.spDefIv, pokemonTeam.spDefEv, false)}</span>
                            </li>
                            <li className="pokemon-stat">
                                <span className="label-spd">Speed</span>
                                <span className="value-base">{pokemonTeam.pokemon.baseStats.speed}</span>
                                <span className="ev-value value-ev">{pokemonTeam.spdEv}</span>
                                <span className="iv-value value-iv">{pokemonTeam.spdIv}</span>
                                <span className="value-total">{calculateStat(pokemonTeam.pokemon.baseStats.speed, pokemonTeam.spdIv, pokemonTeam.spdEv, false)}</span>
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
                    className="btn-go-back" 
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        </div>  
    )
}