import { useEffect, useState } from "react"
import { getPokemonByTeamId, getTeamsByUserId } from "../../services/teamServices"
import { Link } from "react-router-dom"
import { getPokemon } from "../../services/pokemonServices"
import "./MyTeams.css"
import { getAllFormats } from "../../services/formatsServices"

export const MyTeams = ({ currentUser }) => {
    const [teams, setTeams] = useState([])
    const [allPokemon, setAllPokemon] = useState([])
    const [allFormats, setAllFormats] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})
    const [selectedFormat, setSelectedFormat] = useState({})

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
        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
    }, [currentUser.id])

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
                <h1 className="page-title myteams-title"> My Teams</h1>
                <span className="page-subtitle myteams-subtitle">View your competitive teams!</span>
                <div className="myteams-container">
                <div className="myteams-banner">
                    <h2 className="myteams-banner-title"> Your Arsenal</h2>
                </div>
                    <div className="myteams-banner-filters">
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
                    </div>
                    <section className="teams-list">
                        {!teams.length ? (
                            <p className="empty-msg">No teams created yet.</p>
                        ) : (
                            teams
                                .filter(team => {
                                    if (!selectedPokemon.id) return true
                                    return team.pokemon.some(pokemonTeam => pokemonTeam.pokemonId === selectedPokemon.id)
                                })
                                .filter(team => {
                                    if(!selectedFormat.id) return true
                                    return team.formatId === selectedFormat.id
                                })
                                .map((team) => (
                                    <Link key={team.id} to={`/viewteam/${team.id}`} className="team-card">
                                        <div className="team-card-header">
                                            <h3>{team.name}</h3>
                                        </div>
                                        <div className="team-card-sprites">
                                            {team.pokemon.map((pokemonTeam) => (
                                                <img key={pokemonTeam.id} src={pokemonTeam.pokemon.imageUrl} alt={pokemonTeam.pokemon.name} />
                                            ))}
                                            <span className="team-likes">❤️{team.likes.length}</span>
                                        </div>
                                    </Link>
                                ))
                        )}
                    </section>
                </div>
            </section>
        </main>
    )
}