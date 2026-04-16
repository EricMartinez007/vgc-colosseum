import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUser, getUserByEmail } from "../../services/userServices"
import "./Register.css"

export const Register = (props) => {
  const [user, setUser] = useState({
    email: "",
    name: "",
  })
  let navigate = useNavigate()

  const registerNewUser = () => {
    createUser(user).then((createdUser) => {
      if (createdUser.hasOwnProperty("id")) {
        localStorage.setItem(
          "vgc_user",
          JSON.stringify({
            id: createdUser.id,
          })
        )

        navigate("/")
      }
    })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    getUserByEmail(user.email).then((response) => {
      if (response.length > 0) {
        // Duplicate email. No good.
        window.alert("Account with that email address already exists")
      } else {
        // Good email, create user.
        registerNewUser()
      }
    })
  }

  const updateUser = (evt) => {
    const copy = { ...user }
    copy[evt.target.id] = evt.target.value
    setUser(copy)
  }

  return (
      <main className="container-login">
          <img className="auth-logo" src="/VGC_Colosseum_Final_Logo.png" alt="VGC Colosseum" />
          <h1>VGC Colosseum</h1>
          <form className="form-login" onSubmit={handleRegister}>
              <h2>Gladiator Registration</h2>
              <fieldset>
                  <label>Name</label>
                  <input
                      onChange={updateUser}
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="Enter your name"
                      required
                      autoFocus
                  />
              </fieldset>
              <fieldset>
                  <label>Email Address</label>
                  <input
                      onChange={updateUser}
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Email address"
                      required
                  />
              </fieldset>
              <fieldset>
                  <button className="login-btn" type="submit">Register</button>
              </fieldset>
          </form>
          <Link to="/login" className="register-link">Already a gladiator? Sign in!</Link>
      </main>
  )
}