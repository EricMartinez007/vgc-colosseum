import { useEffect, useState } from "react"
import { getPokemonByTeamId, getTeamsByUserId } from "../../services/teamServices"
import { Link } from "react-router-dom"

export const MyTeams = ({ currentUser }) => {
    const [teams, setTeams] = useState([])

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
    }, [currentUser.id])
    
    return (
        <main className="page-container">
            <section>
                <h1 className="page-title">My Teams</h1>
                <span className="page-subtitle">View your competitive teams!</span>
                    <section className="teams-list">
                        {!teams.length ? (
                            <p className="empty-msg">No teams created yet.</p>
                        ) : (
                            teams.map((team) => (
                                <div key={team.id} className="team-card">
                                    <h3>{team.name}</h3>
                                    <Link to={`/viewteam/${team.id}`}>
                                        {team.pokemon.map((pokemonTeam) => (
                                            <img key={pokemonTeam.id} src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                        ))}
                                    </Link>
                                </div>  
                            ))
                        )}
                </section>
            </section>
        </main>
    )
}