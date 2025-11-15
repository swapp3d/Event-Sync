// src/pages/EventsPage.tsx

import React, { useState } from "react";
import type { EventDto } from "../types";
import { createEvent } from "../api";

interface EventsPageProps {
    events: EventDto[];
    setEvents: (events: EventDto[]) => void;
    setAtLeastOneEventCreated: (v: boolean) => void;
    onProceed: () => void;
}

interface EventForm {
    id: string;
    title: string;
    description: string;
    errorTitle?: string;
    errorDescription?: string;
    isSaved?: boolean;
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 300;

const EventsPage: React.FC<EventsPageProps> = ({
                                                   events,
                                                   setEvents,
                                                   setAtLeastOneEventCreated,
                                                   onProceed,
                                               }) => {
    const [forms, setForms] = useState<EventForm[]>([
        { id: crypto.randomUUID(), title: "", description: "" },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    // Soft inline information message (same style as FeedbackPage)
    const [infoMsg, setInfoMsg] = useState<string | null>(null);
    const showInfo = (msg: string) => {
        setInfoMsg(msg);
        setTimeout(() => setInfoMsg(null), 2500);
    };

    const addForm = () => {
        setForms((prev) => [
            ...prev.map((f) => ({ ...f, isSaved: false })), // reset saved flags when adding more
            { id: crypto.randomUUID(), title: "", description: "" },
        ]);
        // Proceed becomes disabled until this new form is saved
    };

    const updateForm = (id: string, patch: Partial<EventForm>) => {
        setForms((prev) =>
            prev.map((f) =>
                f.id === id
                    ? {
                        ...f,
                        ...patch,
                        isSaved:
                            patch.title !== undefined ||
                            patch.description !== undefined
                                ? false
                                : f.isSaved,
                    }
                    : f
            )
        );
    };

    const validateForm = (f: EventForm): EventForm => {
        const result: EventForm = { ...f };
        result.errorTitle = undefined;
        result.errorDescription = undefined;

        if (!f.title.trim()) {
            result.errorTitle = "Title is required.";
        } else if (f.title.trim().length > TITLE_MAX) {
            result.errorTitle = `Title cannot be longer than ${TITLE_MAX} characters.`;
        }

        if (!f.description.trim()) {
            result.errorDescription = "Description is required.";
        } else if (f.description.trim().length > DESCRIPTION_MAX) {
            result.errorDescription = `Description cannot be longer than ${DESCRIPTION_MAX} characters.`;
        }

        return result;
    };

    const handleCreate = async () => {
        const validated = forms.map(validateForm);
        setForms(validated);

        const validForms = validated.filter(
            (f) => !f.errorTitle && !f.errorDescription && f.title.trim()
        );

        if (validForms.length === 0) return;

        setIsSaving(true);

        try {
            const newlyCreated: EventDto[] = [];

            for (const f of validForms) {
                const created = await createEvent({
                    title: f.title.trim(),
                    description: f.description.trim(),
                });
                newlyCreated.push(created);
            }

            if (newlyCreated.length > 0) {
                const merged = [...events, ...newlyCreated];
                setEvents(merged);
                setAtLeastOneEventCreated(true);

                // Reset UI after successful creation — prevents double submission
                setForms([
                    {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                    },
                ]);

                showInfo("Events saved! You may proceed or add more entries.");
            }
        } catch (e) {
            console.error("Failed to create events", e);
        } finally {
            setIsSaving(false);
        }
    };

    // No unsaved fields?
    const hasUnsaved = forms.some(
        (f) =>
            !f.isSaved &&
            (f.title.trim().length > 0 || f.description.trim().length > 0)
    );

    const canCreate = hasUnsaved && !isSaving;
    const canProceed = events.length > 0 && !hasUnsaved;

    return (
        <section className="page-center">
            <div className="card glass wide-card">
                <h2 className="card-title">Create events</h2>
                <p className="card-subtitle">
                    Add one or more events. You can proceed once at least one event is
                    created and all blocks are saved.
                </p>

                {infoMsg && (
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
                        {infoMsg}
                    </div>
                )}

                <div className="forms-scroll">
                    {forms.map((f) => (
                        <div
                            key={f.id}
                            className={`form-block ${
                                f.errorTitle || f.errorDescription
                                    ? "form-block-error"
                                    : ""
                            } ${f.isSaved ? "form-block-saved" : ""}`}
                        >
                            <div className="field-group">
                                <label>
                                    Event title
                                    <span className="field-max">
                                        {f.title.length}/{TITLE_MAX}
                                    </span>
                                </label>
                                <input
                                    className={f.errorTitle ? "input error" : "input"}
                                    value={f.title}
                                    onChange={(e) =>
                                        updateForm(f.id, {
                                            title: e.target.value.slice(0, TITLE_MAX),
                                        })
                                    }
                                    placeholder="Team Building Workshop"
                                />
                                {f.errorTitle && (
                                    <div className="error-text">{f.errorTitle}</div>
                                )}
                            </div>

                            <div className="field-group">
                                <label>
                                    Description
                                    <span className="field-max">
                                        {f.description.length}/{DESCRIPTION_MAX}
                                    </span>
                                </label>
                                <textarea
                                    className={
                                        f.errorDescription ? "textarea error" : "textarea"
                                    }
                                    value={f.description}
                                    onChange={(e) =>
                                        updateForm(f.id, {
                                            description: e.target.value.slice(
                                                0,
                                                DESCRIPTION_MAX
                                            ),
                                        })
                                    }
                                    placeholder="Short summary of what the event is about…"
                                    rows={3}
                                />
                                {f.errorDescription && (
                                    <div className="error-text">
                                        {f.errorDescription}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn-ghost add-more" onClick={addForm}>
                    + Add another event
                </button>

                <div className="actions-row">
                    <button
                        className={canCreate ? "btn-primary" : "btn-disabled"}
                        onClick={handleCreate}
                        disabled={!canCreate}
                    >
                        {isSaving ? "Saving..." : "Create"}
                    </button>

                    <button
                        className={canProceed ? "btn-primary" : "btn-disabled"}
                        disabled={!canProceed}
                        onClick={onProceed}
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </section>
    );
};

export default EventsPage;
