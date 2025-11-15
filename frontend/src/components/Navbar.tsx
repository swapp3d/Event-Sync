import React from "react";
import logo from "../assets/NavLogo.svg";

interface NavbarProps {
    onHome: () => void;
    onEvents: () => void;
    onFeedback: () => void;
    onSummary: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
                                           onHome,
                                           onEvents,
                                           onFeedback,
                                           onSummary,
                                       }) => {
    return (
        <header className="nav-shell glass">

            <div className="nav-left" onClick={onHome}>
                <img
                    src={logo}
                    alt="EventSync Logo"
                    className="logo-img"
                />
            </div>
            <nav className="nav-links">
                <button className="nav-link" onClick={onHome}>
                    Home
                </button>
                <button className="nav-link" onClick={onEvents}>
                    Events
                </button>
                <button className="nav-link" onClick={onFeedback}>
                    Feedback
                </button>
                <button className="nav-link" onClick={onSummary}>
                    Summary
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
