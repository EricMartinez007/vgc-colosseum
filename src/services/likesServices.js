//We are filtering here to keep the Favorites.jsx component cleaner. So we're filtering the posts and spitting out only the post where at least one like belongs to the current user. That's where .some comes into play, it returns true if at least ONE like in the array matches our condition.
export const getFavoriteTeams = (currentUser) => {
    return fetch(`http://localhost:8088/teams?_expand=user&_embed=likes`)
        .then(res => res.json())
        .then(teams => teams.filter(team => 
            team.likes.some(like => like.userId === currentUser.id)
        ))
}

export const createLike = (newLike) => {
    return fetch("http://localhost:8088/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newLike),
  }).then((res) => res.json())
}

export const deleteLike = (likeId) => {
    return fetch (`http://localhost:8088/likes/${likeId}`, {
        method: "DELETE"
    })
}