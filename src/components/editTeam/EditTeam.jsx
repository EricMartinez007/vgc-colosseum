import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteTeam, getPokemonByTeamId, getTeamById, updateTeam } from "../../services/teamServices"
import "./EditTeam.css"
import { getPokemonMovesByPokemonTeamId } from "../../services/movesServices"
import { getAllFormats } from "../../services/formatsServices"

export const EditTeam = () => {
    const navigate = useNavigate()
    const { teamId } = useParams()
    
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    const [pokemonMoves, setPokemonMoves] = useState([])
    const [allFormats, setAllFormats] = useState([])
    
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

        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
                
    }, [teamId])

    const handleTeamNameChange = (evt) => {
        const copy = { ...team }
        copy[evt.target.id] = evt.target.value
        setTeam(copy)
    }

    const handleFormatChange = (evt) => {
        setTeam({
        ...team,
        formatId: parseInt(evt.target.value)
        })
    }

    const handleDeleteTeam = () => {
        deleteTeam(team).then(() => {
            navigate(`/myteams`)
        })
    }

    const handleSubmit = (evt) => {
        evt.preventDefault()

        if(pokemon.length !== 6){
            alert("Your team must have exactly 6 Pokémon!")
            return
        }

        updateTeam(team).then(() => {
            navigate(`/myteams`)
        })
    }
    
    if (!team.id) 
        return <div>Loading...</div>

    //pt in the map method stand for pokemonTeam the objs im fetching belong to this array in which im expanding pokemon to access the image and name
    return (
        <div className="page-container">
            <div className="page-banner">
                <h2 className="page-banner-title">⚔️ Edit {team.name}</h2>
            </div>
            <div className="edit-team-layout">
                <div>
                    <h2 className="edit-form-title">Team Details</h2>
                    <form className="form-newteam" onSubmit={handleSubmit}>
                        <h2 className="edit-form-title">Team Name</h2>
                        <fieldset>
                        <div className="form-group">
                            <input
                                    type="text"
                                    id="name"
                                    value={team.name}
                                    onChange={handleTeamNameChange}
                                    className="form-teamname"
                                    placeholder="Change your team's name"
                                    required
                                    autoFocus
                            />
                        </div>
                        </fieldset>
                        <h2 className="edit-form-title">Format</h2>
                        <select className="filter-bar" value={team.formatId} onChange={handleFormatChange}>
                            <option value="0">Select a Format</option>
                                {allFormats.map((format) => (
                                    <option value={format.id} key={format.id}>{format.name}</option>
                                ))}
                        </select>
                        <div className="btn-container">
                            <button type="submit" className="btn-create-team">
                                Save Team
                            </button>
                            <button 
                                type ="button" 
                                className="btn-delete-team"
                                onClick={handleDeleteTeam}
                            >
                                Delete Team
                            </button>
                        </div>
                    </form>
                </div>
                <section className="team-section">
                    <h2 className="edit-form-title">Pokémon Details</h2>
                    <div className="pokemon-list">
                        {/* Array.from creates an array of 6 slots. If a pokemon exists at that index in the array then it renders the pokemon's card, otherwise it renders an empty card with an Add Pokemon button. The _ used in Array.from parameters is a way of telling JavaScript that I know this parameter exists but I don't want to use it */}
                        {Array.from({ length: 6 }, (_, index) => {
                            const pokemonTeam = pokemon[index]
                            return pokemonTeam ? (
                                <div 
                                    key={pokemonTeam.id} 
                                    className="pokemon-card" 
                                    onClick={() => navigate(`/editpokemon/${teamId}/${pokemonTeam.id}`)}
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
                            ) : (
                                <div key={index} className="pokemon-card pokemon-card-empty" onClick={() => navigate(`/addpokemon/${teamId}`)}>
                                    <span>Add Pokémon</span>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>  
    )
}