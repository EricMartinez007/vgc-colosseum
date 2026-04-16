import { useState } from "react"
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
import { TeamCoverage } from "../teamCoverage/TeamCoverage"
import { DamageCalculator } from "../damageCalculator/DamageCalculator"


export const ApplicationViews = () => {
    // The () => makes useState run the function once to get the initial value so currentUser is populated immediately on the first render and doesn't need to wait for a useEffect. This helps so pages don't get stuck on the loading buffers I have in my code
    const [currentUser, setCurrentUser] = useState(() => {
        const localVgcUser = localStorage.getItem("vgc_user")
        return JSON.parse(localVgcUser)
    })

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <>
                        <NavBar currentUser={currentUser} />
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
                <Route path="profile/:userId" element={<Profile currentUser={currentUser} />} />
                <Route path="editprofile"element={<EditProfile currentUser={currentUser} />} />
                <Route path="teamcoverage/:teamId" element={<TeamCoverage currentUser={currentUser} />} />
                <Route path="damagecalculator" element={<DamageCalculator currentUser={currentUser} />} />
            </Route>
        </Routes>
    )
}