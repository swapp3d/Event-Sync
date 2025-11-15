// src/pages/FeedbackPage.tsx

import React, { useState } from "react";
import type { EventDto } from "../types";
import { submitFeedback } from "../api";

interface FeedbackPageProps {
    events: EventDto[];
    setAtLeastOneFeedbackSubmitted: (v: boolean) => void;
    onBack: () => void;
    onSync: (eventId: number) => void;
}

interface Block {
    id: string;
    text: string;
    error?: string;
}

const MAX_WORDS = 100;

function countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({
                                                       events,
                                                       setAtLeastOneFeedbackSubmitted,
                                                       onBack,
                                                       onSync,
                                                   }) => {
    const [eventId, setEventId] = useState<number | "">(events[0]?.id ?? "");

    const [blocks, setBlocks] = useState<Block[]>([
        { id: crypto.randomUUID(), text: "" },
    ]);

    const [saving, setSaving] = useState(false);

    const [info, setInfo] = useState<string | null>(null);

    // NEW: Tracks whether feedback has been successfully saved
    const [saved, setSaved] = useState(false);

    const showInfo = (msg: string) => {
        setInfo(msg);
        setTimeout(() => setInfo(null), 2500);
    };

    const addBlock = () => {
        setBlocks((prev) => [
            ...prev,
            { id: crypto.randomUUID(), text: "" },
        ]);
        setInfo(null);
        setSaved(false); // typing again disables sync
    };

    const updateBlock = (id: string, patch: Partial<Block>) => {
        setBlocks((prev) =>
            prev.map((b) =>
                b.id === id ? { ...b, ...patch, error: undefined } : b
            )
        );
        setInfo(null);
        setSaved(false); // editing disables sync
    };

    const validate = (b: Block): Block => {
        const wc = countWords(b.text);
        if (!b.text.trim()) return { ...b, error: "Feedback is required." };
        if (wc > MAX_WORDS) return { ...b, error: `Max ${MAX_WORDS} words.` };
        return { ...b };
    };

    const handleSubmit = async () => {
        if (!eventId) return;

        const validated = blocks.map(validate);
        setBlocks(validated);

        const valid = validated.filter((b) => !b.error && b.text.trim());
        if (valid.length === 0) return;

        setSaving(true);
        try {
            for (const b of valid) {
                await submitFeedback(eventId as number, { text: b.text.trim() });
            }

            setAtLeastOneFeedbackSubmitted(true);

            // Reset all blocks after successful save
            setBlocks([{ id: crypto.randomUUID(), text: "" }]);

            // Mark as saved → enables Sync
            setSaved(true);

            showInfo("Feedback saved. You may sync or write more.");
        } finally {
            setSaving(false);
        }
    };

    // NEW — correct sync activation
    const canSync =
        saved &&                  // must have saved successfully
        eventId !== "" &&         // must have an event
        blocks.length === 1 &&    // reset state
        blocks[0].text.trim() === ""; // form is empty

    const handleEventChange = (value: string) => {
        const id = value ? Number(value) : ("" as "");
        setEventId(id);

        // Reset on event switch
        setBlocks([{ id: crypto.randomUUID(), text: "" }]);
        setInfo(null);
        setSaved(false); // selecting another event disables sync
    };

    const canSubmit = blocks.some((b) => b.text.trim()) && !saving;

    return (
        <section className="page-center">
            <div className="card glass wide-card">
                <h2 className="card-title">Submit feedback</h2>
                <p className="card-subtitle">
                    Select an event and share your thoughts. Up to {MAX_WORDS} words per entry.
                </p>

                {info && (
                    <div
                        className="glass"
                        style={{
                            padding: "0.6rem 1rem",
                            marginTop: "0.5rem",
                            borderRadius: "0.8rem",
                            fontSize: "0.8rem",
                            border: "1px solid rgba(56,189,248,0.45)",
                            background: "rgba(56,189,248,0.08)",
                            color: "#7dd3fc",
                        }}
                    >
                        {info}
                    </div>
                )}

                {/* Event dropdown */}
                <div className="field-group" style={{ marginTop: "1rem" }}>
                    <label>Event</label>
                    <select
                        className="input"
                        value={eventId}
                        onChange={(e) => handleEventChange(e.target.value)}
                    >
                        <option value="">Select an event...</option>
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Feedback blocks */}
                <div className="forms-scroll">
                    {blocks.map((b) => {
                        const wc = countWords(b.text);
                        const left = MAX_WORDS - wc;

                        return (
                            <div
                                key={b.id}
                                className={`form-block ${b.error ? "form-block-error" : ""}`}
                            >
                                <div className="field-group">
                                    <label>
                                        Feedback
                                        <span
                                            className={`field-max ${
                                                left < 0 ? "over-limit" : ""
                                            }`}
                                        >
                                            {left >= 0
                                                ? `${left} words left`
                                                : `${Math.abs(left)} over limit`}
                                        </span>
                                    </label>

                                    <textarea
                                        className={
                                            b.error || left < 0
                                                ? "textarea error"
                                                : "textarea"
                                        }
                                        value={b.text}
                                        onChange={(e) =>
                                            updateBlock(b.id, { text: e.target.value })
                                        }
                                        rows={4}
                                        placeholder="Share what worked, what didn’t…"
                                    />

                                    {b.error && (
                                        <div className="error-text">{b.error}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="btn-ghost add-more" onClick={addBlock}>
                    + Add another feedback
                </button>

                {/* Action buttons */}
                <div className="actions-row">
                    <button
                        className={canSubmit ? "btn-primary" : "btn-disabled"}
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    >
                        {saving ? "Submitting…" : "Submit"}
                    </button>

                    <button
                        className={canSync ? "btn-primary" : "btn-disabled"}
                        disabled={!canSync}
                        onClick={() => onSync(eventId as number)}
                    >
                        Sync
                    </button>

                    <button className="btn-ghost" onClick={onBack}>
                        Back to events
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeedbackPage;
