export const getCommentByTeamId = (teamId) => {
    return fetch(`http://localhost:8088/comments?teamId=${teamId}&_expand=user`).then((res) => res.json())
}

export const createComment = (newComment) => {
  return fetch("http://localhost:8088/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newComment),
  }).then((res) => res.json())
}

export const deleteComment = (comment) => {
    return fetch(`http://localhost:8088/comments/${comment.id}`, {
    method: "DELETE"
    })
}