import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonByTeamId, getTeamById } from "../../services/teamServices"
import "./ViewTeam.css"
import { getPokemonMovesByPokemonTeamId } from "../../services/movesServices"
import { createLike, deleteLike } from "../../services/likesServices"
import { createComment, deleteComment, getCommentByTeamId } from "../../services/commentsServices"

export const ViewTeam = ({ currentUser }) => {
    const { teamId } = useParams()
    const navigate = useNavigate()
    
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    const [pokemonMoves, setPokemonMoves] = useState([])
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState({
        userId: currentUser.id,
        teamId: teamId,
        comment: "",
        timestamp: new Date()
    })

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
        getCommentByTeamId(teamId).then((commentsArray) => {
            setComments(commentsArray)
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

    const handleCreateComment = () => {
        createComment(newComment).then(() => {
            getCommentByTeamId(teamId).then((commentsArray) => {
                setComments(commentsArray)

                setNewComment({...newComment, comment: ""})
            })
        })
    }

    const handleDeleteComment = (comment) => {
        deleteComment(comment).then(() => {
            getCommentByTeamId(teamId).then((commentsArray) => {
                setComments(commentsArray)
            })
        })
    }

    const updateNewComment = (evt) => {
        const copy = { ...newComment }
        copy[evt.target.id] = evt.target.value
        setNewComment(copy)
    }

    const getEvsForPokemon = (pokemonTeam) => {
        const evs = [
            {value: pokemonTeam.hpEv, label: "HP"},
            {value: pokemonTeam.atkEv, label: "Atk"},
            {value: pokemonTeam.defEv, label: "Def"},
            {value: pokemonTeam.spAtkEv, label: "SpA"},
            {value: pokemonTeam.spDefEv, label: "SpD"},
            {value: pokemonTeam.spdEv, label: "Spe"}
        ]

        //Filtering out Evs with 0 in them, then mapping into strings, then join
        const evsLine = evs
            .filter(ev => ev.value > 0)
            .map(ev => `${ev.value} ${ev.label}`)
            .join(" / ")

        return `EVs: ${evsLine}`
    }

    const generateShowdownExport = () => {
        return pokemon.map((pokemonTeam, index) => {
            return `${pokemonTeam.pokemon.name} @ ${pokemonTeam.item?.name}
Ability: ${pokemonTeam.ability?.name}
Level: 50
${getEvsForPokemon(pokemonTeam)}
Nature: ${pokemonTeam.nature?.name}
- ${pokemonMoves[index]?.[0]?.move.name}
- ${pokemonMoves[index]?.[1]?.move.name}
- ${pokemonMoves[index]?.[2]?.move.name}
- ${pokemonMoves[index]?.[3]?.move.name}`
        }).join("\n\n")
    }

    const handleCopyToClipboard = () => {
        const exportString = generateShowdownExport()
        navigator.clipboard.writeText(exportString)
        alert("Your team has been copied to your clipboard!")
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
                {parseInt(currentUser.id) === parseInt(team.userId) ? (
                    <></>
                ) : (
                    <>
                    <button 
                    className="btn-like"
                    onClick={handleLike}
                    >
                        {team.likes.find(like => parseInt(like.userId) === parseInt(currentUser.id)) ? "❤️" : "🤍"}
                        {team.likes.length}
                    </button>
                    </>
                )}
                <button
                    className="btn-export"
                    onClick={handleCopyToClipboard}
                >
                    Export to Showdown
                </button>
            </div>
            <div className="comments-container">
                <section className="comments">
                    <h3>Comments</h3>
                    <form className="form-newcomment" onSubmit={handleCreateComment}>
                        <label className="comment-label">Write a comment!</label>
                        <fieldset>
                            <input
                                type="text"
                                id="comment"
                                value={newComment.comment}
                                onChange={updateNewComment}
                                className="form-comment"
                                placeholder="Type your comment here!"
                                required
                                autoFocus
                            />
                        </fieldset>
                        <fieldset>
                            <div className="form-newcomment-buttons">
                                <button className="submit-btn" type="submit">
                                    Post Comment
                                </button>
                            </div>
                        </fieldset>
                    </form>
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p>No comments yet — be the first!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="comment-card">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.user.name}</span>
                                        <span className="comment-timestamp">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="comment-text">{comment.comment}</p>
                                    {parseInt(currentUser.id) === parseInt(comment.userId) && (
                                        <button 
                                            className="btn-delete-comment"
                                            onClick={() => handleDeleteComment(comment)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>  
    )
}