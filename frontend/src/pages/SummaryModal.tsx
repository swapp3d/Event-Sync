import React from "react";
import type { EventDto, EventSummaryDto, FeedbackExampleDto } from "../types";

interface SummaryModalProps {
    event: EventDto | null;
    summary: EventSummaryDto;
    onClose: () => void;
}

const getMoodClass = (mood: FeedbackExampleDto["mood"]) => {
    const m = (mood || "").toString().toLowerCase();
    if (m.includes("pos")) return "tag tag-positive";
    if (m.includes("neg")) return "tag tag-negative";
    if (m.includes("neu")) return "tag tag-neutral";
    return "tag";
};

const SummaryModal: React.FC<SummaryModalProps> = ({
                                                       event,
                                                       summary,
                                                       onClose,
                                                   }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal card glass">
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>
                <h2 className="card-title">
                    Summary{event ? `: ${event.title}` : ""}
                </h2>

                <p className="summary-text">
                    {summary.summary || "No AI summary available yet."}
                </p>

                <div className="summary-stats">
                    <span>Total: {summary.total}</span>
                    <span className="stat-positive">Positive: {summary.positive}</span>
                    <span className="stat-neutral">Neutral: {summary.neutral}</span>
                    <span className="stat-negative">Negative: {summary.negative}</span>
                </div>

                <div className="forms-scroll summary-list">
                    {summary.examples.map((ex, idx) => (
                        <div key={idx} className="summary-item">
                            <div className={getMoodClass(ex.mood)}>{ex.mood}</div>
                            <p className="summary-item-text">{ex.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
