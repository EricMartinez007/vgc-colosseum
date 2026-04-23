import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getUserById } from "../../services/userServices"
import { getPokemonByTeamId, getTeamsByUserId } from "../../services/teamServices"
import "./Profile.css"
import { getPokemon } from "../../services/pokemonServices"

export const Profile = ({ currentUser }) => {
    const { userId } = useParams()
    
    const [user, setUser] = useState({})
    const [teams, setTeams] = useState([])
    const [allPokemon, setAllPokemon] = useState([])
    const [totalLikesReceived, setTotalLikesReceived] = useState(0)

    const navigate = useNavigate()

    const getAndSetUserAndTeams = () =>{
        getUserById(parseInt(userId)).then((userObj) => {
            setUser(userObj)
        })
        getTeamsByUserId(parseInt(userId)).then((teams) => {
            Promise.all(
                teams.map((team) => getPokemonByTeamId(team.id))
            ).then((pokemonArrays) => {
                const teamsWithPokemon = teams.map((team, index) => ({
                    ...team,
                    pokemonTeams: pokemonArrays[index]
                }))
                setTeams(teamsWithPokemon)
                const total = teamsWithPokemon.reduce((sum, team) => sum + (team.likes?.length || 0), 0)
                setTotalLikesReceived(total)
            })
        })
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
    }

    useEffect(() => {
            getAndSetUserAndTeams()
    }, [userId])
    
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
            <h1 className="page-title">Trainer Card</h1>
            <span className="page-subtitle">Dominus Stats</span>
            <div className="profile-layout">
                <section className="profile-section">
                    <div className="profile-banner">
                        {getMostUsedPokemon() && (
                            <img
                                className="profile-avatar"
                                src={getMostUsedPokemon().imageUrl}
                                alt={getMostUsedPokemon().name}
                            />
                        )}
                        <h2 className="profile-name">⚔️ {user.name}</h2>
                    </div>
                    <div className="profile-stats">
                        <div className="profile-stat-card">
                            <span className="profile-stat-label">📧 Email</span>
                            <span className="profile-stat-value">{user.email}</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-label">🏆 Arsenals</span>
                            <span className="profile-stat-value">{teams.length}</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-label">👑 Glory Points</span>
                            <span className="profile-stat-value">{totalLikesReceived}</span>
                        </div>
                        {getMostUsedPokemon() && (
                            <div className="profile-stat-card">
                                <span className="profile-stat-label">⭐ Most Used</span>
                                <img src={getMostUsedPokemon().imageUrl} alt={getMostUsedPokemon().name} />
                                <span className="profile-stat-value">{getMostUsedPokemon().name}</span>
                            </div>
                        )}
                    </div>
                    <div className="profile-buttons">
                        {parseInt(currentUser.id) === parseInt(userId) && (
                            <button 
                                className="edit-btn"
                                type="button"
                                onClick={() => navigate(`/editprofile`)}
                            >
                                Edit Profile
                            </button> 
                        )}
                    </div>
                </section>

                {/* My Teams Preview */}
                <section className="profile-teams-preview">
                    <div className="profile-teams-banner">
                        <h2 className="profile-teams-title">My Teams</h2>
                    </div>
                    {teams.length === 0 ? (
                        <p className="profile-no-teams">No teams created yet!</p>
                    ) : (
                        teams.map((team) => (
                            <div 
                                key={team.id} 
                                className="profile-team-card"
                                onClick={() => navigate(`/viewteam/${team.id}`)}
                            >
                                <span className="profile-team-name">{team.name}</span>
                                <div className="profile-team-sprites">
                                    {team.pokemonTeams?.slice(0, 6).map((pt) => (
                                        pt.pokemon && <img key={pt.id} src={pt.pokemon.imageUrl} alt={pt.pokemon.name} />
                                    ))}
                                </div>
                                <span className="profile-team-likes">❤️ {team.likes?.length || 0}</span>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    )
}