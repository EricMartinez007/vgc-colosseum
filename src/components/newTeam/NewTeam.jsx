import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createTeam } from "../../services/teamServices"
import "./NewTeam.css"
import { getAllFormats } from "../../services/formatsServices"
import { createPokemonTeam, getPokemon } from "../../services/pokemonServices"
import { getPokemonAbilities } from "../../services/abilitiesServices"
import { createPokemonMove, getPokemonLearnsets } from "../../services/movesServices"
import { getAllNatures } from "../../services/naturesServices"
import { getAllItems } from "../../services/itemsServices"

export const NewTeam = ({ currentUser }) => {
    const navigate = useNavigate()
    
    const [allPokemon, setAllPokemon] = useState([])
    const [allFormats, setAllFormats] = useState([])
    const [allNatures, setAllNatures] = useState([])
    const [allItems, setAllItems] = useState([])
    const [mascot, setMascot] = useState({})
    const [newTeam, setNewTeam] = useState({
        name: "",
        userId: currentUser.id,
        formatId: 1
    })
    const [showdownInput, setShowdownInput] = useState("")
    const [importTeam, setImportTeam] = useState({
        name: "",
        userId: currentUser.id,
        formatId: 1
    })

    useEffect(() => {
        getAllFormats().then((formatsArray) => {
            setAllFormats(formatsArray)
        })
        getPokemon().then((pokemonArray) => {
            const random = pokemonArray[Math.floor(Math.random() * pokemonArray.length)]
            setMascot(random)
            setAllPokemon(pokemonArray)
        })
        getAllNatures().then((naturesArray) => {
            setAllNatures(naturesArray)
        })
        getAllItems().then((itemsArray) => {
            setAllItems(itemsArray)
        })
    }, [])

    // Needed help with this one, showdown import is tricky. We take a Showdown format string and split it into individual Pokemon blocks, extracting each component (name, item, ability, nature, EVs, IVs, and moves) and return an array of Pokemon objects with the parsed data. 
    const parseShowdownString = (showdownString) => {
        // Showdown's import was a little different so I needed to clean it up so it wouldn't crash 
        const cleanedString = showdownString
            .split("\n")
            .map(line => line.trim())
            .join("\n")
        
        // Showdown has different names for these pokemon so it will crash if it cant find the "correct" names in the database
        const nameMap = {
            "Urshifu": "Urshifu-Single",
            "Calyrex-Ice Rider": "Calyrex-Ice",
            "Calyrex-Shadow Rider": "Calyrex-Shadow",
            "Zacian-Crowned Sword": "Zacian-Crowned",
            "Zamazenta-Crowned Shield": "Zamazenta-Crowned",
        }

        // Showdown has an extra blank block that was causing a crash 
        const blocks = cleanedString.split("\n\n").filter(block => block.trim() !== "")

        return blocks.map(block => {
            const lines = block.split("\n")
            const [pokemonName, itemName] = lines[0].split("@")
            const cleanPokemonName = nameMap[pokemonName.trim()] || pokemonName.trim()
            const cleanItemName = itemName.trim()

            let abilityName = ""
            let natureName = ""
            let moves = []
            let evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 }
            let ivs = { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spd: 31 }

            // We are starting at index 1 since line 0 contains the Pokemon name and item which we already parsed above. Each remaining line is checked to extract ability, nature, EVs, IVs, and moves
            lines.slice(1).forEach(line => {
                if (line.startsWith("Ability:")) {
                    abilityName = line.split(":")[1].trim()
                }
                if (line.startsWith("Nature:")) {
                    natureName = line.split(":")[1].trim()
                }
                if (line.startsWith("EVs:")) {
                    const evParts = line.split(":")[1].split("/")
                    evParts.forEach(part => {
                        const [amount, statName] = part.trim().split(" ")
                        if (statName === "HP") evs.hp = parseInt(amount)
                        if (statName === "Atk") evs.atk = parseInt(amount)
                        if (statName === "Def") evs.def = parseInt(amount)
                        if (statName === "SpA") evs.spAtk = parseInt(amount)
                        if (statName === "SpD") evs.spDef = parseInt(amount)
                        if (statName === "Spe") evs.spd = parseInt(amount)
                    })
                }
                if (line.startsWith("IVs:")) {
                    const ivParts = line.split(":")[1].split("/")
                    ivParts.forEach(part => {
                        const [amount, statName] = part.trim().split(" ")
                        if (statName === "HP") ivs.hp = parseInt(amount)
                        if (statName === "Atk") ivs.atk = parseInt(amount)
                        if (statName === "Def") ivs.def = parseInt(amount)
                        if (statName === "SpA") ivs.spAtk = parseInt(amount)
                        if (statName === "SpD") ivs.spDef = parseInt(amount)
                        if (statName === "Spe") ivs.spd = parseInt(amount)
                    })
                }
                if (line.startsWith("-")) {
                    moves.push(line.slice(2).trim())
                }
            })

            // Sometimes Showdown's pokemon don't have a nature written so I added a safety to assign one if there is not one listed. Otherwise it would cause a crash
            return {
                pokemonName: cleanPokemonName,
                itemName: cleanItemName,
                abilityName,
                natureName: natureName || "Hardy",
                evs,
                ivs,
                moves
            }
        })
    }

    const updateNewTeam = (evt) => {
        const copy = { ...newTeam }
        copy[evt.target.id] = evt.target.value
        setNewTeam(copy)
    }

    const handleFormatSelect = (evt) => {
        setNewTeam({
            ...newTeam,
            formatId: parseInt(evt.target.value)
        })
    }

    const handleSubmit = (evt) => {
        evt.preventDefault()
        createTeam(newTeam).then((createdTeam) => {
            navigate(`/editteam/${createdTeam.id}`)
        })
    }

    const updateImportTeam = (evt) => {
        const copy = { ...importTeam }
        copy[evt.target.id] = evt.target.value
        setImportTeam(copy)
    }

    const handleImportFormatSelect = (evt) => {
        setImportTeam({
            ...importTeam,
            formatId: parseInt(evt.target.value)
        })
    }
    
    // Needed help with this one too, showdown import is very tricky lol. We are creating a new team by importing a parsed Showdown string. First we parse the raw string into useable data by invoking the parseShowdownString function, then we create the team in the database. For each Pokemon on the team we have to: 1. Match the Pokemon, ability, nature, item, and move names to their respective IDs in the database, 2. Build a Pokemon Team object with all the matched IDs and EV/IV spreads, 3. Create the Pokemon entry first (createPokemonTeam) so we get back a pokemonTeamId, 4. Then create each move separately (createPokemonMove) since moves require a pokemonTeamId to link them to the correct Pokemon in the database
    const handleShowdownSubmit = (evt) => {
        evt.preventDefault()
        const parsedTeam = parseShowdownString(showdownInput)

        createTeam(importTeam).then(async (createdTeam) => {
            for (const parsedPokemon of parsedTeam) {
                const matchedPokemon = allPokemon.find(pokemon => pokemon.name === parsedPokemon.pokemonName)
                
                const [abilities, moves] = await Promise.all([
                    getPokemonAbilities(matchedPokemon.id),
                    getPokemonLearnsets(matchedPokemon.id)
                ])

                const matchedAbility = abilities.find(pokemonAbility => pokemonAbility.ability.name === parsedPokemon.abilityName)
                const matchedNature = allNatures.find(nature => nature.name === parsedPokemon.natureName)
                const matchedItem = allItems.find(item => item.name === parsedPokemon.itemName)
                const matchedMoves = moves.filter(pokemonMove => parsedPokemon.moves.includes(pokemonMove.move.name))

                const pokemonTeamObj = {
                    pokemonId: matchedPokemon.id,
                    teamId: createdTeam.id,
                    abilityId: matchedAbility?.abilityId,
                    natureId: matchedNature?.id,
                    itemId: matchedItem?.id,
                    hpIv: parsedPokemon.ivs.hp,
                    atkIv: parsedPokemon.ivs.atk,
                    defIv: parsedPokemon.ivs.def,
                    spAtkIv: parsedPokemon.ivs.spAtk,
                    spDefIv: parsedPokemon.ivs.spDef,
                    spdIv: parsedPokemon.ivs.spd,
                    hpEv: parsedPokemon.evs.hp,
                    atkEv: parsedPokemon.evs.atk,
                    defEv: parsedPokemon.evs.def,
                    spAtkEv: parsedPokemon.evs.spAtk,
                    spDefEv: parsedPokemon.evs.spDef,
                    spdEv: parsedPokemon.evs.spd
                }

                const createdPokemonTeam = await createPokemonTeam(pokemonTeamObj)

                for (const matchedMove of matchedMoves) {
                    await createPokemonMove({
                        pokemonTeamId: createdPokemonTeam.id,
                        moveId: matchedMove.moveId
                    })
                }
            }
            navigate(`/editteam/${createdTeam.id}`)
})
    } 
    
    return (
        <main className="page-container">
            <h1 className="page-title">✨ Create a New Team</h1>
            <span className="page-subtitle">Build a new competitive team!</span>
            <div className="newteam-layout">
                
                {mascot.id && (
                    <div className="newteam-mascot">
                        <img
                            className="mascot-sprite"
                            src={mascot.imageUrl}
                            alt={mascot.name}
                        />
                        <p className="mascot-name">{mascot.name}</p>
                        <p className="mascot-flavor">Your partner for today!</p>
                        <p className="mascot-tip">💡 Every champion starts with a single team!</p>
                    </div>
                )}

                <form className="form-newteam" onSubmit={handleSubmit}>
                    <div className="newteam-banner">
                        <h2 className="newteam-banner-title">⚔️ New Team</h2>
                    </div>
                    <fieldset>
                        <h2 className="new-form-title">Team Name</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                id="name"
                                value={newTeam.name}
                                onChange={updateNewTeam}
                                className="form-teamname"
                                placeholder="Enter a team name"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="format-select">
                            <h2 className="new-form-title">Format</h2>
                            <select className="filter-bar" onChange={handleFormatSelect}>
                                <option value="0">Select a Format</option>
                                {allFormats.map((format) => (
                                    <option value={format.id} key={format.id}>{format.name}</option>
                                ))}
                            </select>
                        </div>
                    </fieldset>
                    <button type="submit" className="btn-create-team">
                        Create Team
                    </button>
                </form>

                <form className="form-showdown-import" onSubmit={handleShowdownSubmit}>
                    <div className="import-banner">
                        <h2 className="import-banner-title">⚔️ Import Showdown Team!</h2>
                    </div>
                    <fieldset>
                        <h2 className="new-form-title">Team Name</h2>
                        <div className="form-group">
                            <input
                                type="text"
                                id="name"
                                value={importTeam.name}
                                onChange={updateImportTeam}
                                className="form-teamname"
                                placeholder="Enter a team name"
                                required
                            />
                        </div>
                        <div className="format-select">
                            <h2 className="new-form-title">Format</h2>
                            <select className="filter-bar" onChange={handleImportFormatSelect}>
                                <option value="0">Select a Format</option>
                                {allFormats.map((format) => (
                                    <option value={format.id} key={format.id}>{format.name}</option>
                                ))}
                            </select>
                        </div>
                        <h2 className="import-title">Showdown Import</h2>
                        <div className="form-group">
                            <textarea
                                type="text"
                                id="showdownInput"
                                value={showdownInput}
                                onChange={(evt) => setShowdownInput(evt.target.value)}
                                className="form-showdown-import"
                                placeholder="Paste Showdown Team Here"
                                required
                            />
                        </div>
                    </fieldset>
                    <button type="submit" className="btn-create-team">
                        Import Team
                    </button>
                </form>
            </div>
        </main>
    )
}