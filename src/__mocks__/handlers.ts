import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

const recurringEvents: Event[] = [];

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: [...events, ...recurringEvents] });
  }),

  // ✅ 일반 일정 추가
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    console.log('일반 일정 추가!');
    newEvent.id = String(events.length + 1);
    events.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // ✅ 일반 일정 수정
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      events[index] = { ...events[index], ...updatedEvent };
      return HttpResponse.json(events[index]);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // ✅ 일반 일정 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      events.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // ✅ 반복 일정 추가
  http.post('/api/events-list', async ({ request }) => {
    const { events: newEvents } = (await request.json()) as { events: Event[] };
    console.log('반복 일정 추가', events);

    const addedEvents = newEvents.map((event) => ({
      ...event,
      id: String(recurringEvents.length + 1), // ✅ 반복 일정에 ID 부여
    }));

    recurringEvents.push(...addedEvents);

    return HttpResponse.json(addedEvents, { status: 201 });
  }),

  // ✅ 반복 일정 수정
  http.put('/api/events-list', async ({ request }) => {
    const { events: updatedEvents } = (await request.json()) as { events: Event[] };

    updatedEvents.forEach((updatedEvent) => {
      const index = recurringEvents.findIndex((event) => event.id === updatedEvent.id);
      if (index !== -1) {
        recurringEvents[index] = { ...recurringEvents[index], ...updatedEvent };
      }
    });

    return HttpResponse.json(recurringEvents, { status: 200 });
  }),

  // ✅ 반복 일정 삭제
  http.delete('/api/events-list', async ({ request }) => {
    const { eventIds } = (await request.json()) as { eventIds: string[] };
    const filteredEvents = recurringEvents.filter((event) => !eventIds.includes(event.id));

    return HttpResponse.json({ events: filteredEvents }, { status: 204 });
  }),
];
