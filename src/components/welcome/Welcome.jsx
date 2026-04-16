import { Link } from "react-router-dom"
import "./Welcome.css"

export const Welcome = () => {
    return (
        <div className="welcome-container">
            <div className="welcome-hero">
                <img 
                    className="welcome-logo" 
                    src="/VGC_Colosseum_Final_Logo.png" 
                    alt="VGC Colosseum" 
                />
                <h1 className="welcome-title">VGC Colosseum</h1>
                <div className="welcome-taglines">
                    <p className="welcome-tagline">The ultimate competitive Pokémon team builder</p>
                    <p className="welcome-tagline welcome-tagline-secondary">May the odds be ever in your favor Gladiator</p>
                </div>
                <Link to="/communityteams" className="welcome-cta">Enter The Colosseum</Link>
            </div>

            <div className="welcome-features">
                <div className="welcome-feature-card">
                    <span className="welcome-feature-icon">🏆</span>
                    <h3>Build Teams</h3>
                    <p>Create competitive VGC teams with EV/IV optimization and live stat calculations</p>
                </div>
                <div className="welcome-feature-card">
                    <span className="welcome-feature-icon">⚔️</span>
                    <h3>Damage Calculator</h3>
                    <p>Calculate damage with full type effectiveness, STAB, weather, terrain and more</p>
                </div>
                <div className="welcome-feature-card">
                    <span className="welcome-feature-icon">🗺️</span>
                    <h3>Coverage Analysis</h3>
                    <p>Analyze your team's offensive coverage and defensive vulnerabilities</p>
                </div>
                <div className="welcome-feature-card">
                    <span className="welcome-feature-icon">❤️</span>
                    <h3>Community</h3>
                    <p>Share teams, like your favorites, and leave comments for other trainers</p>
                </div>
            </div>
        </div>
    )
}