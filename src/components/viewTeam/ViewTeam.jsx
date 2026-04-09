import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonByTeamId, getTeamById } from "../../services/teamServices"

export const ViewTeam = ({ currentUser }) => {
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])

    const { teamId } = useParams()

    const navigate = useNavigate()
    
    const getAndSetTeamAndPokemon = () => {
        getTeamById(teamId).then((team) => {
            setTeam(team)
        })
        getPokemonByTeamId(teamId).then((pokemonArray) => {
            setPokemon(pokemonArray)
        })
    } 

    useEffect(() => {
        getAndSetTeamAndPokemon()
    }, [])

    if (!team.id) {
        return (
            <div>
                Loading...   
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-title">({team.name})</h1>
            <span className="page-subtitle">Team made by: {team.user.name}</span>
            <div className="team-layout">
                <section className="team-section">
                    <h2>Pokemon</h2>
                    <div className="pokemon-list">
                        {pokemon.map((pt) => (
                            <div key={pt.id} className="pokemon-card">
                                <img src={pt.pokemon.imageUrl} alt={pt.pokemon.name} />
                                <span>{pt.pokemon.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            {currentUser.id === team.userId && (
                <button
                    className="btn-add-pokemon"
                    onClick={() => navigate(`/editteam/${teamId}`)}
                >
                    Edit Team
                </button>
            )}
            <button
                className="btn-add-pokemon"
                onClick={() => navigate(-1)}
            >
                Go Back
            </button>
        </div>  
    )
}