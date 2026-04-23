import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getUserByEmail } from "../../services/userServices"
import "./Login.css"

export const Login = () => {
    const [email, setEmail] = useState("")
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()

        getUserByEmail(email).then((foundUsers) => {
        if (foundUsers.length === 1) {
            const user = foundUsers[0]
            localStorage.setItem(
                "vgc_user",
                JSON.stringify({
                    id: user.id,
                })
            )

            navigate("/")
        } else {
            window.alert("Invalid login")
        }
        })
    }

    return (
        <main className="container-login">
            <img className="auth-logo" src="/VGC_Colosseum_Final_Logo.png" alt="VGC Colosseum" />
            <h1>VGC Colosseum</h1>
            <form className="form-login" onSubmit={handleLogin}>
                <h2>Enter The Colosseum</h2>
                <fieldset>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(evt) => setEmail(evt.target.value)}
                            className="form-control"
                            placeholder="Enter your email"
                            required
                            autoFocus
                        />
                    </div>
                </fieldset>
                <fieldset>
                    <button className="login-btn" type="submit">Sign In</button>
                </fieldset>
            </form>
            <Link to="/register" className="register-link">Not a Dominus yet? Register here!</Link>
        </main>
    )
}