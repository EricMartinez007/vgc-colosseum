import { useEffect, useState } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import { Welcome } from "../welcome/Welcome"
import { CommunityTeams } from "../communityTeams/CommunityTeams"
import { ViewTeam } from "../viewTeam/ViewTeam"
import { ViewPokemon } from "../viewPokemon/ViewPokemon"
import { MyTeams } from "../myTeams/MyTeams"
import { Favorites } from "../favorites/Favorites"
import { NewTeam } from "../newTeam/NewTeam"
import { Profile } from "../profile/Profile"
import { EditTeam } from "../editTeam/EditTeam"
import { EditPokemon } from "../editPokemon/EditPokemon"
import { EditProfile } from "../editProfile/EditProfile"
import { AddPokemon } from "../addPokemon/AddPokemon"
import { NavBar } from "../nav/NavBar"


export const ApplicationViews = () => {
    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        const localVgcUser = localStorage.getItem("vgc_user")
        const vgcUserObj = JSON.parse(localVgcUser)

        setCurrentUser(vgcUserObj)
    }, [])

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <>
                        <NavBar />
                        <Outlet />
                    </>
                }
            >
                <Route index element={<Welcome />} />
                <Route path="communityteams" element={<CommunityTeams currentUser={currentUser} />} />
                <Route path="viewteam/:teamId" element={<ViewTeam currentUser={currentUser} />} />
                <Route path="editteam/:teamId" element={<EditTeam currentUser={currentUser} />} />
                <Route path="viewpokemon/:teamId/:pokemonTeamId" element={<ViewPokemon currentUser={currentUser} />} />
                <Route path="editpokemon/:teamId/:pokemonTeamId" element={<EditPokemon currentUser={currentUser} />} />
                <Route path="myteams" element={<MyTeams currentUser={currentUser} />} />
                <Route path="favorites" element={<Favorites currentUser={currentUser} />} />
                <Route path="newteam" element={<NewTeam currentUser={currentUser} />} />
                <Route path="addpokemon/:teamId" element={<AddPokemon currentUser={currentUser} />} />
                <Route path="profile" element={<Profile currentUser={currentUser} />} />
                <Route path="editprofile"element={<EditProfile currentUser={currentUser} />} />
            </Route>
        </Routes>
    )
}