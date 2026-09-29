import { CalendarEvent } from '../types';

export class CalendarSyncService {
  /**
   * Generates a standard RFC 5545 iCalendar (.ics) string for Apple Calendar & Google Calendar
   */
  static exportToICS(events: CalendarEvent[]): string {
    const pad = (n: number): string => String(n).padStart(2, '0');
    const toICSDate = (isoStr: string) => {
      const d = new Date(isoStr);
      return (
        String(d.getUTCFullYear()) +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) +
        'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) +
        'Z'
      );
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OmniFlow 365//PT-BR//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ].join('\r\n');

    events.forEach((ev) => {
      const start = toICSDate(ev.startTime);
      const end = toICSDate(ev.endTime);
      icsContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${ev.id}@omniflow365.app`,
        `DTSTAMP:${toICSDate(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${ev.title.replace(/[,;]/g, ' ')}`,
        `LOCATION:${(ev.location || '').replace(/[,;]/g, ' ')}`,
        `DESCRIPTION:Gerado por OmniFlow 365 (${ev.externalSource})`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    });

    icsContent += '\r\nEND:VCALENDAR';
    return icsContent;
  }

  /**
   * Download .ics file directly to user device for instant Apple Calendar or Google Calendar import
   */
  static downloadICSFile(events: CalendarEvent[], filename = 'omniflow-calendar.ics') {
    const icsData = this.exportToICS(events);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Simulate a bidirectional sync with Google Calendar API v3
   */
  static async syncWithGoogleCalendar(currentEvents: CalendarEvent[]): Promise<{
    syncedEvents: CalendarEvent[];
    newCount: number;
  }> {
    // Artificial 600ms latency to simulate OAuth / Google Cloud API REST call
    await new Promise((resolve) => setTimeout(resolve, 600));

    const today = new Date().toISOString().split('T')[0];
    const googleMockEvent: CalendarEvent = {
      id: `gcal-${Date.now()}`,
      title: 'Alinhamento Trimestral de Metas (Google Calendar)',
      location: 'Google Meet',
      startTime: `${today}T17:00:00`,
      endTime: `${today}T17:45:00`,
      isAllDay: false,
      reminderMinutesBefore: 10,
      externalSource: 'google',
      externalEventId: `g_event_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Avoid duplicates if already exists
    const exists = currentEvents.some((e) => e.title.includes('Alinhamento Trimestral'));
    if (!exists) {
      return {
        syncedEvents: [googleMockEvent, ...currentEvents],
        newCount: 1,
      };
    }

    return {
      syncedEvents: currentEvents,
      newCount: 0,
    };
  }

  /**
   * Simulate EventKit Apple Calendar bridge sync
   */
  static async syncWithAppleCalendar(currentEvents: CalendarEvent[]): Promise<{
    syncedEvents: CalendarEvent[];
    newCount: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const today = new Date().toISOString().split('T')[0];
    const appleMockEvent: CalendarEvent = {
      id: `apple-${Date.now()}`,
      title: 'Consulta Médica Preventiva (Apple Calendar)',
      location: 'Consultório Dr. Carvalho / iOS EventKit',
      startTime: `${today}T18:00:00`,
      endTime: `${today}T19:00:00`,
      isAllDay: false,
      reminderMinutesBefore: 30,
      externalSource: 'apple',
      externalEventId: `ek_event_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exists = currentEvents.some((e) => e.title.includes('Consulta Médica Preventiva'));
    if (!exists) {
      return {
        syncedEvents: [appleMockEvent, ...currentEvents],
        newCount: 1,
      };
    }

    return {
      syncedEvents: currentEvents,
      newCount: 0,
    };
  }
}
