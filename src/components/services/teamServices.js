export const createTeam = (newTeam) => {
  return fetch("http://localhost:8088/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTeam),
  }).then((res) => res.json())
}

//Finds and returns the obj that has a matching teamId to the current teamId in the URL params 
export const getTeamById = (teamId) => {
    return fetch(`http://localhost:8088/teams/${teamId}`).then((res) => res.json())
}

//Need to filter through all objs in pokemonTeams since we can have multiple hits matching the current teamId in the URL params
export const getPokemonByTeamId = (teamId) => {
    return fetch(`http://localhost:8088/pokemonTeams?teamId=${teamId}&_expand=pokemon`).then((res) => res.json())
}

export const updateTeam = (team) => {
    return fetch(`http://localhost:8088/teams/${team.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(team),
  }).then((res) => res.json())
}

export const deleteTeam = (team) => {
    return fetch(`http://localhost:8088/teams/${team.id}`, {
    method: "DELETE"
    })
}