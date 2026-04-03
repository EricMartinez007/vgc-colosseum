export const getUserByEmail= (email) => {
    return fetch(`http://localhost:8088/users?email=${email}`).then((res) => res.json())
}

export const createUser = (newUser) => {
  return fetch("http://localhost:8088/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  }).then((res) => res.json())
}