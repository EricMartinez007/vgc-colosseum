import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonTeamById } from "../../services/pokemonServices"
import { getTeamById } from "../../services/teamServices"
import "./ViewPokemon.css"

export const ViewPokemon = ({ currentUser }) => {
    const [pokemonTeam, setPokemonTeam] = useState({})
    const [team, setTeam] = useState({})

    const { teamId, pokemonTeamId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        getPokemonTeamById(pokemonTeamId).then((pokemonTeamObj) => {
            setPokemonTeam(pokemonTeamObj)
        })
        getTeamById(teamId).then((teamObj) => {
            setTeam(teamObj)
        })
    }, [pokemonTeamId, teamId])

    if (!pokemonTeam.id || !team.id) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-container">
            <h1 className="page-title">
                {team.user.name}'s {pokemonTeam.pokemon.name}
            </h1>
            <span className="page-subtitle">
                This Pokémon is part of {team.user.name}'s {team.name}
            </span>
            <div className="pokemon-display">
                <img 
                    src={pokemonTeam.pokemon.imageUrl} 
                    alt={pokemonTeam.pokemon.name} 
                />
                <div>
                    <h2>{pokemonTeam.pokemon.name}</h2>
                    <ul className="pokemon-stats">
                        <li className="pokemon-stat">
                            Hp: {pokemonTeam.pokemon.baseStats.hp}
                        </li>
                        <li className="pokemon-stat">
                            Atk: {pokemonTeam.pokemon.baseStats.attack}
                        </li>
                        <li className="pokemon-stat">
                            Def: {pokemonTeam.pokemon.baseStats.defense}
                        </li>
                        <li className="pokemon-stat">
                            Sp.Atk: {pokemonTeam.pokemon.baseStats.specialAttack}
                        </li>
                        <li className="pokemon-stat">
                            Sp.Def: {pokemonTeam.pokemon.baseStats.specialDefense}
                        </li>
                        <li className="pokemon-stat">
                            Speed: {pokemonTeam.pokemon.baseStats.speed}
                        </li>
                    </ul>
                </div>
            </div>
            <button
                className="btn-go-back"
                onClick={() => navigate(-1)}
            >
                Go Back To Team
            </button>
        </div>
    )
}