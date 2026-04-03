import { Navigate, useLocation } from "react-router-dom"

// We can access child components the same way we access props. Child components are passed to our props as a key/value pair where
// children is the key.


//This function will be specifically used to wrap ApplicationView in our App.jsx to let React know that the local state has been updated and to direct the user to the to the index route. This also allows LoggedIn to be re-used later in the application and protect any route wrapped in it.  

export const LoggedIn = ({ children }) => {
  let location = useLocation()

  // Check if user is logged in. If they are, render the CHILD components (in this case, the ApplicationViews component)
  if (localStorage.getItem("vgc_user")) {
    return children
  }
  // If the user is NOT logged in, redirect them to the login page using the Navigate component from react-router-dom
  else {
    return <Navigate to={`/login`} state={{ from: location }} replace />
  }
}