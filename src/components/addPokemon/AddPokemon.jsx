import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createPokemonTeam, getPokemon } from "../services/pokemonServices"

export const AddPokemon = ({ currentUser }) => {
    const [allPokemon, setAllPokemon] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})

    const navigate = useNavigate()
    
    const { teamId } = useParams()

    const getAndSetAllPokemon = () => {
        getPokemon().then((pokemon) => {
            setAllPokemon(pokemon)
        })
    }

    useEffect(() => {
        getAndSetAllPokemon()
    }, [])

    const handleCreatePokemonTeam = () => {
        const newPokemonTeam = {
            pokemonId: selectedPokemon.id,
            teamId: parseInt(teamId)
        }
        createPokemonTeam(newPokemonTeam).then(() => {
            navigate(`/editteam/${teamId}`)
        })
    }

    const handlePokemonSelect = (evt) => {
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedPokemon(matchPokemon)
    }
    
    return (
        <div className="page-container">
            <h1 className="page-title">Add Pokémon </h1>
            <span className="page-subtitle">Add a Pokémon to your team!</span>
            <select onChange={handlePokemonSelect}>
                <option value="0">Select a Pokémon</option>
                {allPokemon.map((pokemon) => (
                    <option value={pokemon.id} key={pokemon.id}>{pokemon.name}</option>
                ))}
            </select>
            {selectedPokemon.id && (
                <div>
                    <img src={selectedPokemon.imageUrl} alt={'pokemon sprite'} />
                    <ul className="pokemon-stats">
                        <li className="pokemon-stat">
                            Hp:{selectedPokemon.baseStats.hp}
                        </li>
                          <li className="pokemon-stat">
                            Atk:{selectedPokemon.baseStats.attack}
                        </li>
                          <li className="pokemon-stat">
                            Def:{selectedPokemon.baseStats.defense}
                        </li>
                          <li className="pokemon-stat">
                            Sp.Atk:{selectedPokemon.baseStats.specialAttack}
                        </li>
                          <li className="pokemon-stat">
                            Sp.Def:{selectedPokemon.baseStats.specialDefense}
                        </li>
                          <li className="pokemon-stat">
                            Speed:{selectedPokemon.baseStats.speed}
                        </li>
                    </ul>
                </div>
            )}
            <button
                className="btn-add-pokemon"
                onClick={handleCreatePokemonTeam}
            >
                Add Pokémon
            </button>
        </div>
    )
}