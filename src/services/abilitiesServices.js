export const getAllAbilities = () => {
    return fetch(`http://localhost:8088/abilities`).then((res) => res.json())
}