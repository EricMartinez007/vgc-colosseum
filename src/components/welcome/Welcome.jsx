import "./Welcome.css"

export const Welcome = () => {
    return (
        <div className="welcome-container">
            <header className="page-title">Welcome To VGC Colosseum</header>
            <span className="page-subtitle">May The Odds Be Ever In Your Favor Gladiator</span>
            <img src="/VGC_Colosseum_Final_Logo.png" alt="VGC Colosseum" />
        </div>
    )
}