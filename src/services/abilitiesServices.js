export const getAllAbilities = () => {
    return fetch(`http://localhost:8088/abilities`).then((res) => res.json())
}

export const getPokemonAbilities = (pokemonId) => {
    return fetch(`http://localhost:8088/pokemonAbilities?pokemonId=${pokemonId}&_expand=ability`).then((res) => res.json())
}