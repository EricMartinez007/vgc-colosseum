import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonByTeamId, getTeamById, updateTeam } from "../../services/teamServices"
import "./ViewTeam.css"
import { getPokemonMovesByPokemonTeamId } from "../../services/movesServices"
import { createLike, deleteLike } from "../../services/likesServices"

export const ViewTeam = ({ currentUser }) => {
    const { teamId } = useParams()
    const navigate = useNavigate()
    
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    const [pokemonMoves, setPokemonMoves] = useState([])

    useEffect(() => {
        getTeamById(teamId).then((team) => {
            setTeam(team)
        })
        getPokemonByTeamId(teamId).then((pokemonTeamArray) => {
            setPokemon(pokemonTeamArray)
                // i need to fetch the moves for EACH pokemonTeam object!
                Promise.all(
                    pokemonTeamArray.map((pokemonTeam) => 
                        getPokemonMovesByPokemonTeamId(pokemonTeam.id)
                    )
                ).then((allMovesArrays) => {
                    // allMovesArrays is an array of six arrays since there six pokemon on a team, and each inner array has the moves for one of those pokemon
                    setPokemonMoves(allMovesArrays)
                })
            })
    }, [teamId])

    const handleLike = () => {
        const existingLike = team.likes.find(like => like.userId === currentUser.id)

        const newLike = {
            userId: currentUser.id,
            teamId: parseInt(teamId)
        }

        if(!existingLike) {
            createLike(newLike).then(() => {
                getTeamById(teamId).then((updateTeam) => {
                    setTeam(updateTeam)
                })
            })
        }else {
            deleteLike(existingLike.id).then(() => {
                getTeamById(teamId).then((updateTeam) => {
                    setTeam(updateTeam)
                })
            })
        }
    }

    if (!team.id) {
        return (
            <div>
                Loading...   
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-title">{team.name}</h1>
            <span className="page-subtitle">Team made by: {team.user.name}</span>
            <div className="view-team-layout">
                <section className="team-section">
                    <h2>Pokémon</h2>
                    <div className="pokemon-list">
                        {pokemon.map((pokemonTeam, index) => (
                            <div 
                                key={pokemonTeam.id} 
                                className="pokemon-card" 
                                onClick={() => navigate(`/viewpokemon/${teamId}/${pokemonTeam.id}`)}
                             >
                                <img src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                <div className="pokemon-card-info">
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
                                        <span className="card-info-value">{pokemonMoves[index]?.[0]?.move.name}</span>
                                    </div>
                                    <div className="card-info-group">
                                        <span className="card-label card-label-move">Move 2</span>
                                        <span className="card-info-value">{pokemonMoves[index]?.[1]?.move.name}</span>
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
                                        <span className="card-info-value">{pokemonMoves[index]?.[2]?.move.name}</span>
                                    </div>
                                    <div className="card-info-group">
                                        <span className="card-label card-label-move">Move 4</span>
                                        <span className="card-info-value">{pokemonMoves[index]?.[3]?.move.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <div className="btn-container">
                {currentUser.id === team.userId && (
                    <button
                        className="btn-edit-team"
                        onClick={() => navigate(`/editteam/${teamId}`)}
                    >
                        Edit Team
                    </button>
                )}
                <button
                    className="btn-go-back"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
                <button 
                    className="btn-like"
                    onClick={handleLike}
                >
                    {team.likes.find(like => parseInt(like.userId) === parseInt(currentUser.id)) ? "❤️" : "🤍"}
                    {team.likes.length}
                </button>
                
            </div>
        </div>  
    )
}