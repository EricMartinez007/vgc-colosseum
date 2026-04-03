import { Route, Routes } from "react-router-dom"
import { Login } from "./components/auth/Login"
import { Register } from "./components/auth/Register"
import { ApplicationViews } from "./components/views/ApplicationViews"
import { LoggedIn } from "./components/views/LoggedIn"

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      <Route 
        path="*" 
        element={
          //Checks if the user has logged in first
          <LoggedIn>
            {/* ApplicationViews is the CHILD component of Authorized */}
            <ApplicationViews/>
          </LoggedIn>
        } 
      />
    </Routes>
  )
}