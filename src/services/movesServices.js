export const getAllPokemonMoves = () => {
    return fetch(`http://localhost:8088/pokemonMoves?_expand=move`).then((res) => res.json())
}

export const getAllMoves = () => {
    return fetch(`http://localhost:8088/moves`).then((res) => res.json())
}

export const getPokemonMovesByPokemonTeamId = (pokemonTeamId) => {
    return fetch(`http://localhost:8088/pokemonMoves?pokemonTeamId=${pokemonTeamId}&_expand=move`).then((res) => res.json())
}

export const createPokemonMove = (newPokemonMove) => {
    return fetch("http://localhost:8088/pokemonMoves", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPokemonMove),
  }).then((res) => res.json())
}

export const deletePokemonMove = (pokemonMoveId) => {
    return fetch(`http://localhost:8088/pokemonMoves/${pokemonMoveId}`, {
    method: "DELETE"
    })
}

export const getPokemonLearnsets = (pokemonId) => {
    return fetch(`http://localhost:8088/pokemonLearnsets?pokemonId=${pokemonId}&_expand=move`).then((res) => res.json())
}