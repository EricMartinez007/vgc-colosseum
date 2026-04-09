import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deletePokemonTeam, editPokemonTeam, getPokemon, getPokemonTeamById } from "../../services/pokemonServices"


export const EditPokemon = ({ currentUser }) => {
    const [pokemonTeam, setPokemonTeam] =useState({})
    const [allPokemon, setAllPokemon] = useState([])
    const [selectedPokemon, setSelectedPokemon] = useState({})

    const { teamId, pokemonTeamId } = useParams()

    const navigate = useNavigate()

    // using Promise.all here will allow us to prepopulate the page with the current pokemon's data, but to do this we need to wait until BOTH getPokemon and getPokemonByTeamId fetches are done and then we can set the initial selectedPokemon to the one that matches our pokemonTeam object we fetched 
    useEffect(() => {
        Promise.all([
            getPokemon(),
            getPokemonTeamById(pokemonTeamId)
        ]).then(([pokemonArray, pokemonTeamObj]) => {
            setAllPokemon(pokemonArray)
            setPokemonTeam(pokemonTeamObj)
            const match = pokemonArray.find(pokemon => pokemon.id === pokemonTeamObj.pokemonId)
            setSelectedPokemon(match)
        })
    }, [pokemonTeamId])

    const handlePokemonSelect = (evt) => {
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedPokemon(matchPokemon)
    }

    const handleSaveEdits = () => {
        const editedPokemonTeam = {
            ...pokemonTeam,
            pokemonId: selectedPokemon.id
        }
        editPokemonTeam(editedPokemonTeam).then(() => {
            navigate(`/editteam/${teamId}`)
         })
    }

    const handleDeletePokemon = () => {
        deletePokemonTeam(pokemonTeam).then(() => {
            navigate(`/editteam/${teamId}`)
        })
    }
    // added a value={selectedPokemon.id} to select to prepopulate it with the current pokemon the user is editing 
    return (
        <div className="page-container">
            <h1 className="page-title">Edit Pokémon </h1>
            <span className="page-subtitle">Make edits or remove Pokémon from your team.</span>
            <select value={selectedPokemon.id} onChange={handlePokemonSelect}>
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
                className="btn-save-edits"
                onClick={handleSaveEdits}
            >
                Save Edits
            </button>
            <button
                className="btn-delete-pokemon"
                onClick={handleDeletePokemon}
            >
                Remove From Team
            </button>
        </div>
    )
}