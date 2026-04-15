import { useEffect, useState } from "react"
import { getAllMoves } from "../../services/movesServices"
import { getPokemon } from "../../services/pokemonServices"

export const DamageCalculator = () => {
    const [allPokemon, setAllPokemon] = useState([])
    const [allMoves, setAllMoves] = useState([])
    const [selectedAttacker, setSelectedAttacker] = useState({})
    const [selectedDefender, setSelectedDefender] = useState({})
    const [selectedMove, setSelectedMove] = useState({})
    const [attackerSpread, setAttackerSpread] = useState({
        atkEv: 0, atkIv: 31, spAtkEv: 0, spAtkIv: 31
    })
    const [defenderSpread, setDefenderSpread] = useState({
        hpEv: 0, hpIv: 31, defEv: 0, defIv: 31, spDefEv: 0, spDefIv: 31
    })

    useEffect(() => {
        getPokemon().then((pokemonArray) => {
            setAllPokemon(pokemonArray)
        })
        getAllMoves().then((movesArray) => {
            setAllMoves(movesArray)
        })
    }, [])

    const handleAttackerSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedAttacker({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedAttacker(matchPokemon)
    }

    const handleDefenderSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedDefender({})
            return
        }
        const matchPokemon = allPokemon.find(pokemon => pokemon.id === parseInt(evt.target.value))
        setSelectedDefender(matchPokemon)
    }

    const handleMoveSelect = (evt) => {
        if (evt.target.value === "0") {
            setSelectedMove({})
            return
        }
        const matchMove = allMoves.find(move => move.id === parseInt(evt.target.value))
        setSelectedMove(matchMove)
    }

    const handleAttackerSpreadChange = (field, value) => {
        if (field.includes("Ev")) {
            const currentTotal =  attackerSpread.atkEv + attackerSpread.spAtkEv 
            const newTotal = currentTotal - attackerSpread[field] + parseInt(value)
            if (newTotal > 508) return
        }
        setAttackerSpread({
            ...attackerSpread,
            [field]: parseInt(value)
        })
    }

    const handleDefenderSpreadChange = (field, value) => {
        if (field.includes("Ev")) {
            const currentTotal =  defenderSpread.hpEv + defenderSpread.defEv + defenderSpread.spDefEv
            const newTotal = currentTotal - defenderSpread[field] + parseInt(value)
            if (newTotal > 508) return
        }
        setDefenderSpread({
            ...defenderSpread,
            [field]: parseInt(value)
        })
    }

    const calculateDamage = () => {

    }

    return (
        <>Welcome to the Damage Calculator!</>
    )
}