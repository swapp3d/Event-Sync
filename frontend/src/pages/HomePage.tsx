import React from "react";

interface HomePageProps {
    onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
    return (
        <section className="page-center">
            <div className="card hero-card glass">
                <h1 className="hero-title">Welcome!</h1>
                <p className="hero-subtitle">Upgrade your event summary with EventSync!</p>
                <button className="btn-primary hero-start" onClick={onStart}>
                    Start
                </button>
            </div>
        </section>
    );
};

export default HomePage;
