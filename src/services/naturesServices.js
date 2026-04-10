export const getAllNatures = () => {
    return fetch(`http://localhost:8088/natures`).then((res) => res.json())
}