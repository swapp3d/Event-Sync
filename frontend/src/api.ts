import type { EventDto, EventSummaryDto } from "./types";

const API_BASE_URL = "http://localhost:8080";

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// GET /events
export async function fetchEvents(): Promise<EventDto[]> {
    const res = await fetch(`${API_BASE_URL}/events`);
    return handleResponse<EventDto[]>(res);
}

// POST /events (one by one)
export async function createEvent(
    payload: { title: string; description: string }
): Promise<EventDto> {
    const res = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse<EventDto>(res);
}

// POST /events/{eventId}/feedback
export async function submitFeedback(
    eventId: number,
    payload: { text: string }
) {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
}

// GET /events/{eventId}/summary
export async function fetchEventSummary(
    eventId: number
): Promise<EventSummaryDto> {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/summary`);
    return handleResponse<EventSummaryDto>(res);
}
