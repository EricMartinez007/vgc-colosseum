export const getAllFormats = () => {
    return fetch(`http://localhost:8088/formats`).then((res) => res.json())
}