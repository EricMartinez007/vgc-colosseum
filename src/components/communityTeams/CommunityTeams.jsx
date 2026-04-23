import { useEffect, useState } from "react"
import { getAllTeams, getPokemonByTeamId } from "../../services/teamServices"
import { getPokemon } from "../../services/pokemonServices"
import { Link, useNavigate } from "react-router-dom"
import "./CommunityTeams.css"
import { getAllFormats } from "../../services/formatsServices"

export const CommunityTeams = ({ currentUser }) => {
    const navigate = useNavigate()

    const [allTeams, setAllTeams] = useState([])
    const [allPokemon, setAllPokemon] = useState([])
    const [allFormats, setAllFormats] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})
    const [selectedFormat, setSelectedFormat] = useState({})

    //we are first grabbing all the team in the database, then we are using Promise.all to send back all the pokemon fetches all at once before we try to match them with their teams. the double .map here allows for our team[0] to always match with pokemonArray[0]
    useEffect(() => {
        getAllTeams().then((teams) => {
            Promise.all(
                teams.map((team) => getPokemonByTeamId(team.id))
            ).then((pokemonArrays) => {
                const teamsWithPokemon = teams.map((team, index) => ({
                    ...team,
                    pokemon: pokemonArrays[index]
                }))
                setAllTeams(teamsWithPokemon)
            })
        })
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
    }, [])
    
    const handlePokemonSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedPokemon({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedPokemon(matchPokemon)
    }

    const handleFormatSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedFormat({})
            return
        }
        const matchFormat = allFormats.find(format => format.id === parseInt(evt.target.value))
        setSelectedFormat(matchFormat)
    }

    return (
        <main className="page-container">
            <section>
                <h1 className="page-title">Community Teams</h1>
                <span className="page-subtitle">Browse and view teams created by community members!</span>
                <select className="filter-bar" onChange={handlePokemonSelect}>
                    <option value="0">All Pokémon</option>
                    {allPokemon.map((pokemon) => (
                        <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                    ))}
                </select>
                <select className="filter-bar" onChange={handleFormatSelect}>
                    <option value="0">All Formats</option>
                    {allFormats.map((format) => (
                        <option value={format.id} key={format.id}>{format.name}</option>
                    ))}
                </select>
                    <section className="teams-list">
                        {!allTeams.length ? (
                            <p className="empty-msg">No teams created yet.</p>
                        ) : (
                            allTeams
                                .filter(team => {
                                    if (!selectedPokemon.id) return true
                                    return team.pokemon.some(pokemonTeam => pokemonTeam.pokemonId === selectedPokemon.id)
                                })
                                .filter(team => {
                                    if(!selectedFormat.id) return true
                                    return team.formatId === selectedFormat.id
                                })
                                .map((team) => (
                                    <div 
                                        key={team.id} 
                                        className="team-card"
                                        onClick={() => navigate(`/viewteam/${team.id}`)}
                                    >
                                        <div className="team-card-header">
                                            <h3>{team.name}</h3>
                                            <h4>
                                                <Link 
                                                    to={`/profile/${team.userId}`} 
                                                    className="team-trainer-link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {team.user.name}
                                                </Link>
                                            </h4>
                                        </div>
                                        <div className="team-card-sprites">
                                            {team.pokemon.map((pokemonTeam) => (
                                                <img key={pokemonTeam.id} src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                            ))}
                                            <span className="team-likes">❤️{team.likes.length}</span>
                                        </div>
                                    </div>  
                                ))
                        )}
                    </section>
            </section>
        </main>
    )
}