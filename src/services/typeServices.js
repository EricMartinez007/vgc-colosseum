export const getPokemonTypeByPokemonId = (pokemonId) => {
    return fetch(`http://localhost:8088/pokemonTypes?pokemonId=${pokemonId}&_expand=type`).then((res) => res.json())
}

export const getTypeMatchups = () => {
     return fetch(`http://localhost:8088/typeMatchups`).then((res) => res.json())
}

export const getAllTypes = () => {
    return fetch(`http://localhost:8088/types`).then((res) => res.json())
}