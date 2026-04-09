import { useEffect, useState } from "react"
import { getPokemonByTeamId, getTeamsByUserId } from "../../services/teamServices"
import { Link } from "react-router-dom"
import { getPokemon } from "../../services/pokemonServices"
import "./MyTeams.css"

export const MyTeams = ({ currentUser }) => {
    const [teams, setTeams] = useState([])
    const [allPokemon, setAllPokemon] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})

    //we are first grabbing all the teams made by the user, then we are using Promise.all to send back all the pokemon fetches all at once before we try to match them with their teams. the double .map here allows for our team[0] to always match with pokemonArray[0]
    useEffect(() => {
        getTeamsByUserId(currentUser.id).then((teams) => {
            Promise.all(
                teams.map((team) => getPokemonByTeamId(team.id))
            ).then((pokemonArrays) => {
                const teamsWithPokemon = teams.map((team, index) => ({
                    ...team,
                    pokemon: pokemonArrays[index]
                }))
                setTeams(teamsWithPokemon)
            })
        })
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
    }, [currentUser.id])

    const handlePokemonSelect = (evt) => {
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedPokemon(matchPokemon)
    }
    
    return (
        <main className="page-container">
            <section>
                <h1 className="page-title">My Teams</h1>
                <span className="page-subtitle">View your competitive teams!</span>
                <select className="filter-bar" onChange={handlePokemonSelect}>
                    <option value="0">Select a Pokémon</option>
                    {allPokemon.map((pokemon) => (
                        <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                    ))}
                </select>
                    <section className="teams-list">
                        {!teams.length ? (
                            <p className="empty-msg">No teams created yet.</p>
                        ) : (
                            teams.filter(team => {
                                if (!selectedPokemon.id) return true
                                return team.pokemon.some(pokemonTeam => pokemonTeam.pokemonId === selectedPokemon.id)
                            })
                            .map((team) => (
                                <Link key={team.id} to={`/viewteam/${team.id}`} className="team-card">
                                <h3>{team.name}</h3>
                                    {team.pokemon.map((pokemonTeam) => (
                                        <img key={pokemonTeam.id} src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                    ))}
                                </Link>
                            ))
                        )}
                </section>
            </section>
        </main>
    )
}