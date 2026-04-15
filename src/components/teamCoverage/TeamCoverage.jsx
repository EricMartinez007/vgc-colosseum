import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPokemonByTeamId, getTeamById } from "../../services/teamServices"
import { getAllTypes, getPokemonTypeByPokemonId, getTypeMatchups } from "../../services/typeServices"
import "./TeamCoverage.css"

export const TeamCoverage = () => {
    const { teamId } = useParams()
    const navigate = useNavigate()
    
    const [team, setTeam] = useState({})
    const [pokemon, setPokemon] = useState([])
    const [pokemonTypes, setPokemonTypes] = useState([])
    const [allTypes, setAllTypes] = useState([])
    const [allTypeMatchups, setAllTypeMatchups] =useState([])

    useEffect(() => {
            getTeamById(teamId).then((team) => {
                setTeam(team)
            })
            getPokemonByTeamId(teamId).then((pokemonTeamArray) => {
                setPokemon(pokemonTeamArray)
                    // i need to fetch the types for EACH pokemonTeam object!
                    Promise.all(
                        pokemonTeamArray.map((pokemonTeam) => 
                            getPokemonTypeByPokemonId(pokemonTeam.pokemonId)
                        )
                    ).then((allTypesArrays) => {
                        // allTypesArrays is an array of six arrays since there six pokemon on a team, and each inner array has the types for one of those pokemon
                        setPokemonTypes(allTypesArrays)
                    })
            })
            getAllTypes().then((typeArray) => {
                setAllTypes(typeArray)
            })
            getTypeMatchups().then((typeMatchupsArray) => {
                setAllTypeMatchups(typeMatchupsArray)
            })
        }, [teamId])

    const teamHasCoverageAgainst = (typeId) => {
        // We are looping through each pokemon's type. The outer .some loops through each pokemon, while the inner .some loops through each of that pokemon's types (since a pokemon can have two types). Then for each pokemonType we are finding its type matchup in allTypeMatchups and checking if the target typeId is in the strongAgainst array. If ANY pokemon on the team satisfies this condition then .some will return true, meaning the team has coverage against this type.
        return pokemonTypes.some(singlePokemonTypes => 
            singlePokemonTypes.some(pokemonType => {
                const matchups = allTypeMatchups.find(typeMatchup => typeMatchup.typeId === pokemonType.typeId)
                return matchups?.strongAgainst.includes(typeId)
            })
        )
    }

    const teamIsWeakTo = (typeId) => {
        // We are doing the same thing as we did for teamHasCoverageAgainst, but instead of checking the strongAgainst array we are checking if the weakAgainst array includes the target typeId.
        return pokemonTypes.some(singlePokemonTypes => 
            singlePokemonTypes.some(pokemonType => {
                const matchups = allTypeMatchups.find(typeMatchup => typeMatchup.typeId === pokemonType.typeId)
                return matchups?.weakAgainst.includes(typeId)
            })
        )
    }

    if (!team.id || !allTypes.length || !pokemonTypes.length) {
        return (
            <div>
                Loading...   
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-title">{team.name} - Coverage Analysis</h1>
            <span className="page-subtitle">Team by: {team.user.name}</span>
            <div className="view-coverage-layout">
                <section className="coverage-map">
                    <h2>Offensive Coverage</h2>
                    <div className="coverage-list">
                        {allTypes.map((type) => (
                            <div key={type.id} className={`coverage-card ${teamHasCoverageAgainst(type.id) ? "has-coverage" : "no-coverage"}`}>
                                <div className="coverage-card-info">
                                    <div className="card-info-group">
                                        <span>{type.name}: {teamHasCoverageAgainst(type.id) ? "✅" : "❌"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2>Team Vulnerabilities</h2>
                    <div className="coverage-list">
                        {allTypes.map((type) => (
                            <div key={type.id} className={`coverage-card ${teamIsWeakTo(type.id) ? "is-weak" : "not-weak"}`}>
                                <div className="coverage-card-info">
                                    <div className="card-info-group">
                                        <span>{type.name}: {teamIsWeakTo(type.id) ? "⚠️" : "✅"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <div className="btn-container">
                <button
                    className="btn-go-back"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        </div>  
    )
}