import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    http.post('/api/events-list', async ({ request }) => {
      const { events: newEvents } = (await request.json()) as { events: Event[] };
      const addedEvents = newEvents.map((event) => ({
        ...event,
        id: String(mockEvents.length + 1),
      }));

      mockEvents.push(...addedEvents);

      return HttpResponse.json(addedEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      }

      return new HttpResponse(null, { status: 404 });
    }),

    http.put('/api/events-list', async ({ request }) => {
      const { events: updatedEvents } = (await request.json()) as { events: Event[] };

      updatedEvents.forEach((updatedEvent) => {
        const index = mockEvents.findIndex((event) => event.id === updatedEvent.id);
        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        }
      });

      return HttpResponse.json(mockEvents, { status: 200 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index !== -1) {
        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return new HttpResponse(null, { status: 404 });
    }),

    http.delete('/api/events-list', async ({ request }) => {
      const { eventIds } = (await request.json()) as { eventIds: string[] };
      const remainingEvents = mockEvents.filter((event) => !eventIds.includes(event.id));

      return HttpResponse.json({ events: remainingEvents }, { status: 204 });
    })
  );
};
