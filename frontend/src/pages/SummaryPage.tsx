// src/pages/SummaryPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { EventDto, EventSummaryDto, FeedbackExampleDto } from "../types";
import { fetchEventSummary } from "../api";

interface SummaryPageProps {
    events: EventDto[];
}

type SummaryMap = Record<number, EventSummaryDto>;

const getMoodClass = (mood: FeedbackExampleDto["mood"]) => {
    const m = (mood || "").toString().toLowerCase();
    if (m.includes("pos")) return "tag tag-positive";
    if (m.includes("neg")) return "tag tag-negative";
    if (m.includes("neu")) return "tag tag-neutral";
    return "tag";
};

const SummaryPage: React.FC<SummaryPageProps> = ({ events }) => {
    const navigate = useNavigate();
    const location = useLocation() as { state?: { eventId?: number } };

    const initialEventId = location.state?.eventId;

    const [selectedEventId, setSelectedEventId] = useState<number | "all">(
        initialEventId && events.some((e) => e.id === initialEventId)
            ? initialEventId
            : "all"
    );

    const [summaries, setSummaries] = useState<SummaryMap>({});
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const loadSummaries = useCallback(async () => {
        if (events.length === 0) return;

        setLoading(true);
        try {
            if (selectedEventId === "all") {
                const entries = await Promise.all(
                    events.map(async (ev) => {
                        const s = await fetchEventSummary(ev.id);
                        return [ev.id, s] as [number, EventSummaryDto];
                    })
                );

                const map: SummaryMap = {};
                for (const [id, s] of entries) map[id] = s;
                setSummaries(map);
            } else {
                const s = await fetchEventSummary(selectedEventId);
                setSummaries((prev) => ({
                    ...prev,
                    [selectedEventId]: s,
                }));
            }
        } catch (e) {
            console.error("Failed to load summaries", e);
        } finally {
            setLoading(false);
        }
    }, [events, selectedEventId]);

    useEffect(() => {
        loadSummaries();
    }, [loadSummaries]);

    const handleFilterChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        const value = e.target.value;
        setSelectedEventId(value === "all" ? "all" : Number(value));
    };

    const visibleEvents =
        selectedEventId === "all"
            ? events
            : events.filter((ev) => ev.id === selectedEventId);

    return (
        <section className="page-center">
            <div className="card glass wide-card">
                <h2 className="card-title">Event summaries</h2>
                <p className="card-subtitle">
                    View AI-generated sentiment summaries for your events.
                </p>

                <div className="field-group" style={{ marginBottom: "1rem" }}>
                    <label>Filter by event</label>
                    <select
                        className="input"
                        value={selectedEventId === "all" ? "all" : String(selectedEventId)}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All events</option>
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.title}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && <p className="summary-text">Loading summaries…</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {visibleEvents.map((ev) => {
                        const s = summaries[ev.id];
                        if (!s) return null;

                        return (
                            <div
                                key={ev.id}
                                className="form-block"
                                style={{
                                    width: "100%",
                                    padding: "1.2rem 1.4rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.7rem",
                                }}
                            >
                                <h3 className="card-title">{ev.title}</h3>
                                <p className="summary-text">{ev.description}</p>

                                <p className="summary-text">
                                    {s.summary || "No AI summary available yet."}
                                </p>

                                <div className="summary-stats">
                                    <span>Total: {s.total}</span>
                                    <span className="stat-positive">Positive: {s.positive}</span>
                                    <span className="stat-neutral">Neutral: {s.neutral}</span>
                                    <span className="stat-negative">Negative: {s.negative}</span>
                                </div>

                                <button
                                    className="btn-ghost"
                                    onClick={() => toggleExpand(ev.id)}
                                >
                                    {expanded[ev.id]
                                        ? "Hide feedback"
                                        : `Show feedback (${s.examples.length})`}
                                </button>

                                {expanded[ev.id] && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "0.55rem",
                                            marginTop: "0.4rem",
                                        }}
                                    >
                                        {s.examples.map((ex, idx) => (
                                            <div key={idx} className="summary-item">
                                                <div className={getMoodClass(ex.mood)}>
                                                    {ex.mood}
                                                </div>
                                                <p className="summary-item-text">{ex.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="actions-row">
                    <button className="btn-ghost" onClick={() => navigate("/feedback")}>
                        Back to feedback
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SummaryPage;
