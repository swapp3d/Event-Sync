import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import type { EventDto } from "./types";
import { fetchEvents } from "./api";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import FeedbackPage from "./pages/FeedbackPage";
import SummaryPage from "./pages/SummaryPage";

export interface AppFlowState {
    events: EventDto[];
    atLeastOneEventCreated: boolean;
    atLeastOneFeedbackSubmitted: boolean;
}

const App: React.FC = () => {
    const [events, setEvents] = useState<EventDto[]>([]);
    const [atLeastOneEventCreated, setAtLeastOneEventCreated] = useState(false);
    const [atLeastOneFeedbackSubmitted, setAtLeastOneFeedbackSubmitted] =
        useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchEvents()
            .then((data) => {
                setEvents(data);
                if (data.length > 0) setAtLeastOneEventCreated(true);
            })
            .catch(() => {
                // ignore on initial load
            });
    }, []);

    const showError = (msg: string) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 3500);
    };

    const handleStart = () => {
        navigate("/events");
    };

    const handleHomeNav = () => {
        navigate("/");
    };

    const handleEventsNav = () => {
        navigate("/events");
    };

    const handleFeedbackNav = () => {
        if (!atLeastOneEventCreated) {
            showError("Please create at least one event before adding feedback.");
            return;
        }
        navigate("/feedback");
    };

    const handleSummaryNav = () => {
        if (!atLeastOneEventCreated) {
            showError("Please create at least one event before viewing summaries.");
            return;
        }
        navigate("/summary");
    };

    const handleProceedFromEvents = () => {
        if (!atLeastOneEventCreated) {
            showError("Create at least one event before proceeding to feedback.");
            return;
        }
        navigate("/feedback");
    };

    const handleBackToEventsFromFeedback = () => {
        if (!atLeastOneFeedbackSubmitted) {
            showError("Submit at least one feedback before going back.");
            return;
        }
        navigate("/events");
    };

    const handleSyncToSummary = (eventId: number) => {
        // navigate to summary page, focusing on this event
        navigate("/summary", { state: { eventId } });
    };

    return (
        <div className="app-root">
            <Navbar
                onHome={handleHomeNav}
                onEvents={handleEventsNav}
                onFeedback={handleFeedbackNav}
                onSummary={handleSummaryNav}
            />
            <main className="app-main">
                {errorMessage && <div className="toast-error">{errorMessage}</div>}

                <Routes location={location}>
                    <Route path="/" element={<HomePage onStart={handleStart} />} />
                    <Route
                        path="/events"
                        element={
                            <EventsPage
                                events={events}
                                setEvents={setEvents}
                                setAtLeastOneEventCreated={setAtLeastOneEventCreated}
                                onProceed={handleProceedFromEvents}
                            />
                        }
                    />
                    <Route
                        path="/feedback"
                        element={
                            <FeedbackPage
                                events={events}
                                setAtLeastOneFeedbackSubmitted={
                                    setAtLeastOneFeedbackSubmitted
                                }
                                onBack={handleBackToEventsFromFeedback}
                                onSync={handleSyncToSummary}
                            />
                        }
                    />
                    <Route
                        path="/summary"
                        element={<SummaryPage events={events} />}
                    />
                </Routes>
            </main>
        </div>
    );
};

export default App;
