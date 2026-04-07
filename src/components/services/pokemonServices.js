export const getPokemon = () => {
    return fetch(`http://localhost:8088/pokemon`).then((res) => res.json())
}

export const createPokemonTeam = (newPokemonToTeam) => {
    return fetch("http://localhost:8088/pokemonTeams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPokemonToTeam),
  }).then((res) => res.json())
}