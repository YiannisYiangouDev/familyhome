declare module "node-ical" {
  export interface CalendarComponent {
    type?: string;
    start?: Date;
    end?: Date;
    summary?: string;
    description?: string;
    uid?: string;
    [key: string]: unknown;
  }

  export const sync: {
    parseICS(data: string): Record<string, CalendarComponent>;
  };

  export const async: {
    fromURL(url: string): Promise<Record<string, CalendarComponent>>;
  };

  export function fromURL(url: string): Promise<Record<string, CalendarComponent>>;
}
