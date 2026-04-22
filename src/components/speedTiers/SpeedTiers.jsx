import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonByTeamId, getTeamById } from "../../services/teamServices"
import { getAllNatures } from "../../services/naturesServices"
import "./SpeedTiers.css"
import { getPokemon } from "../../services/pokemonServices"

const natureSpeedModifier = {
    "Timid": 1.1,
    "Jolly": 1.1,
    "Hasty": 1.1,
    "Naive": 1.1,
    "Brave": 0.9,
    "Relaxed": 0.9,
    "Quiet": 0.9,
    "Sassy": 0.9
}

export const SpeedTiers = () => {
    const { teamId } = useParams()
    const navigate = useNavigate()

    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    const [allNatures, setAllNatures] = useState([])
    const [allPokemon, setAllPokemon] = useState([])

    useEffect(() => {
        getTeamById(teamId).then((team) => {
            setTeam(team)
        })
        getPokemonByTeamId(teamId).then((pokemonTeamArray) => {
            setPokemon(pokemonTeamArray)
        })
        getAllNatures().then((naturesArray) => {
            setAllNatures(naturesArray)
        })
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
    }, [teamId])

    const calculateSpeed = (pokemonTeam) => {
        const baseSpeed = pokemonTeam.pokemon.baseStats.speed
        const iv = pokemonTeam.spdIv
        const ev = pokemonTeam.spdEv
        const natureName = pokemonTeam.nature?.name
        const natureModifier = natureSpeedModifier[natureName] || 1.0

        return Math.floor(
            Math.floor((2 * baseSpeed + iv + Math.floor(ev / 4)) * 50 / 100 + 5) * natureModifier
        )
    }

    const calculateBaseSpeed = (pokemon) => {
        const baseSpeed = pokemon.baseStats.speed
        const iv = 31
        const ev = 0

        return Math.floor(
            Math.floor((2 * baseSpeed + iv + Math.floor(ev / 4)) * 50 / 100 + 5)
        )
    }

    if (!team.id || !pokemon.length || !allPokemon.length) {
        return <div>Loading...</div>
    }

    const combinedSpeedList = [
        // All database pokemon with isOnTeam: false
        ...allPokemon.map(pokemon => ({
            id: pokemon.id,
            name: pokemon.name,
            imageUrl: pokemon.imageUrl,
            speed: calculateBaseSpeed(pokemon),
            nature: "Neutral",
            isOnTeam: false
        })),
        // Team pokemon with isOnTeam: true
        ...pokemon.map(pokemonTeam => ({
            id: pokemonTeam.id,
            name: pokemonTeam.pokemon.name,
            imageUrl: pokemonTeam.pokemon.imageUrl,
            speed: calculateSpeed(pokemonTeam),
            nature: pokemonTeam.nature?.name,
            isOnTeam: true
        }))
    ].sort((a, b) => b.speed - a.speed)

    return (
        <div className="page-container">
            <h1 className="page-title">{team.name} - Speed Tiers</h1>
            <span className="page-subtitle">Team by: {team.user?.name}</span>
            <div className="speed-tier-layout">
                <section>
                    <h2>Speed Tier List</h2>
                    <p className="speed-tier-note">
                        ⚡ Database Pokémon are shown with 0 EVs, 31 IVs, and a neutral nature for baseline comparison. Your team's Pokémon reflect their actual spreads.
                    </p>
                    <div className="speed-tier-list">
                        {combinedSpeedList.map((pokemon, index) => (
                        <div key={`${pokemon.isOnTeam ? 'team' : 'db'}-${pokemon.id}`} 
                            className={`speed-tier-card ${pokemon.isOnTeam ? "speed-tier-card-team" : ""}`}>
                            <span className="speed-tier-rank">#{index + 1}</span>
                            <img src={pokemon.imageUrl} alt={pokemon.name} />
                            <span className="speed-tier-name">{pokemon.name}</span>
                            <span className="speed-tier-nature">{pokemon.nature}</span>
                            <span className="speed-tier-stat">{pokemon.speed}</span>
                        </div>
                    ))}
                    </div>
                </section>
            </div>
            <div className="btn-container">
                <button className="btn-go-back" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        </div>
    )
}