import { setup, fromPromise } from 'xstate';
import Database from '@tauri-apps/plugin-sql';

type Note = {
  id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

type DBContext = {
  db: Database | null;
  notes: Note[];
  error: Error | null;
};

type SaveNoteEvent = { type: 'SAVE_NOTE'; payload: Pick<Note, 'id' | 'content'> };
type GetNoteEvent = { type: 'GET_NOTE'; payload: { id: string } };

type DBEvents = 
  | { type: 'INIT' }
  | SaveNoteEvent
  | { type: 'GET_NOTES' }
  | GetNoteEvent;

type SaveNoteInput = Pick<Note, 'id' | 'content'>;
type GetNoteInput = { id: string };

const initDB = fromPromise(async () => {
  const db = await Database.load('sqlite:kronos.db');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
});

const saveNote = fromPromise<void, SaveNoteInput>(async ({ input }) => {
  if (!input) throw new Error('No input provided');
  const { id, content } = input;
  
  const db = await Database.load('sqlite:kronos.db');
  await db.execute(
    `INSERT INTO notes (id, content) VALUES ($1, $2) 
     ON CONFLICT (id) DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP`,
    [id, content]
  );
});

const getNotes = fromPromise<Note[]>(async () => {
  const db = await Database.load('sqlite:kronos.db');
  return db.select<Note[]>('SELECT * FROM notes ORDER BY updated_at DESC');
});

const getNote = fromPromise<Note | undefined, GetNoteInput>(async ({ input }) => {
  if (!input) throw new Error('No input provided');
  const db = await Database.load('sqlite:kronos.db');
  const notes = await db.select<Note[]>(
    'SELECT * FROM notes WHERE id = $1',
    [input.id]
  );
  return notes[0];
});

export const dbMachine = setup({
  types: {
    context: {} as DBContext,
    events: {} as DBEvents,
  },
  actors: {
    initDB,
    saveNote,
    getNotes,
    getNote
  }
}).createMachine({
  id: 'db',
  initial: 'idle',
  context: {
    db: null,
    notes: [],
    error: null
  },
  states: {
    idle: {
      on: {
        INIT: 'connecting'
      }
    },
    connecting: {
      invoke: {
        src: 'initDB',
        onDone: {
          target: 'ready',
          actions: ({ context, event }) => {
            context.db = event.output;
          }
        },
        onError: {
          target: 'error',
          actions: ({ context, event }) => {
            if (event.error instanceof Error) {
              context.error = event.error;
            } else {
              context.error = new Error('Unknown error');
            }
          }
        }
      }
    },
    ready: {
      on: {
        SAVE_NOTE: 'saving',
        GET_NOTES: 'getting_notes',
        GET_NOTE: 'getting_note'
      }
    },
    saving: {
      invoke: {
        src: 'saveNote',
        input: ({ event }) => {
          const e = event as SaveNoteEvent;
          return e.payload;
        },
        onDone: 'ready',
        onError: {
          target: 'error',
          actions: ({ context, event }) => {
            if (event.error instanceof Error) {
              context.error = event.error;
            } else {
              context.error = new Error('Unknown error');
            }
          }
        }
      }
    },
    getting_notes: {
      invoke: {
        src: 'getNotes',
        onDone: {
          target: 'ready',
          actions: ({ context, event }) => {
            context.notes = event.output;
          }
        },
        onError: {
          target: 'error',
          actions: ({ context, event }) => {
            if (event.error instanceof Error) {
              context.error = event.error;
            } else {
              context.error = new Error('Unknown error');
            }
          }
        }
      }
    },
    getting_note: {
      invoke: {
        src: 'getNote',
        input: ({ event }) => {
          const e = event as GetNoteEvent;
          return e.payload;
        },
        onDone: 'ready',
        onError: {
          target: 'error',
          actions: ({ context, event }) => {
            if (event.error instanceof Error) {
              context.error = event.error;
            } else {
              context.error = new Error('Unknown error');
            }
          }
        }
      }
    },
    error: {
      on: {
        INIT: 'connecting'
      }
    }
  }
});
