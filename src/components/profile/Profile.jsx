import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserById } from "../../services/userServices"
import { getTeamsByUserId } from "../../services/teamServices"
import "./Profile.css"
import { getPokemon } from "../../services/pokemonServices"

export const Profile = ({ currentUser }) => {
    const [user, setUser] = useState({})
    const [teams, setTeams] = useState([])
    const [allPokemon, setAllPokemon] = useState([])

    const navigate = useNavigate()

    const getAndSetUserAndTeams = () =>{
        getUserById(currentUser.id).then((userObj) => {
            setUser(userObj)
        })
        getTeamsByUserId(currentUser.id).then((teams) => {
            setTeams(teams)
        })
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
    }

    useEffect(() => {
            getAndSetUserAndTeams()
    }, [])
    
    const getMostUsedPokemon = () => {
        if(!teams.length || !allPokemon.length) return null
        
        // Puts all pokemon from each team into one big array
        const allPokemonTeams = teams.flatMap(team => team.pokemonTeams)
        
        if(!allPokemonTeams.length) return null
        
        // Reduce here loops through every pokemonTeam object and builds a count object (total), the || 0 means that if this pokemonId hasn't been seen yet, start count from 0. [{ 1:2, 12:1, 7:2 }]
        const counts = allPokemonTeams.reduce((total, pokemonTeam) => {
            total[pokemonTeam.pokemonId] = (total[pokemonTeam.pokemonId] || 0) + 1
            return total
        }, {})
        
        // This one is a weird one, but Object.keys is returning the pokemonTeam.pokemonId ["1", "12", "7"] without the count. Then .reduce will compare the count results for two items at a time: counts["1"] is 2 and counts["12"] is 1, so 2>1, keep "1". the ? a:b mean if count[a] > count[b] return a, otherwise return b. This will go through each comparison until only one is left. Like a tournament arc lol
        const mostUsedId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
        
        // Find the pokemon object that has the same id as the id returned by mostUsedId
        const mostUsedPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(mostUsedId))
        return mostUsedPokemon
    }

    if (!user.id) {
        return (
            <div>
                Loading...   
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Profile</h1>
            <section className="profile-section">
                <h2 className="profile-name">{user.name}</h2>
                
                <div className="profile-stats">
                    <div className="profile-stat-card">
                        <span className="profile-stat-label">Email: </span>
                        <span className="profile-stat-value">{user.email}</span>
                    </div>
                    <div className="profile-stat-card">
                        <span className="profile-stat-label">Teams Made: </span>
                        <span className="profile-stat-value">{teams.length}</span>
                    </div>
                    {getMostUsedPokemon() && (
                        <div className="profile-stat-card">
                            <span className="profile-stat-label">Most Used Pokémon: </span>
                            <img src={getMostUsedPokemon().imageUrl} alt={getMostUsedPokemon().name} />
                            <span className="profile-stat-value">{getMostUsedPokemon().name}</span>
                        </div>
                    )}
                </div>

                <div className="profile-buttons">
                    <button 
                        className="edit-btn"
                        type="button"
                        onClick={() => navigate(`/editprofile`)}
                    >
                        Edit Profile
                    </button> 
                </div>
            </section>
        </div>
)
}