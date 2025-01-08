# Notes Feature

## Overview

The Notes feature in Kronos is a flexible system for creating and managing different types of notes with bi-directional linking capabilities.

## Note Types

1. **Daily Notes**
   - Automatically named by date (e.g., "2025-01-01")
   - Daily journal entries and tasks
   - Automatically links to other notes created on the same day

2. **Documents**
   - Free-form named notes
   - For longer-form content and project documentation
   - Can be linked to any other note type

3. **Weekly Notes**
   - Week-based aggregation and planning
   - Automatic linking to daily notes within the week

4. **Monthly Notes**
   - Month-level planning and review
   - Automatic linking to weekly and daily notes within the month

## Database Schema

### Notes Table
```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,           -- The unique name/id of the note
    type TEXT NOT NULL,            -- 'daily', 'document', 'weekly', 'monthly'
    content TEXT,                  -- The note's content
    properties JSON,               -- Flexible key-value properties
    created_at INTEGER NOT NULL,   -- Unix timestamp
    modified_at INTEGER NOT NULL   -- Unix timestamp
);
```

### Links Table
```sql
CREATE TABLE links (
    source_note_id TEXT NOT NULL,
    target_note_id TEXT NOT NULL,
    link_type TEXT NOT NULL,       -- 'direct' or 'backlink'
    created_at INTEGER NOT NULL,
    PRIMARY KEY (source_note_id, target_note_id),
    FOREIGN KEY (source_note_id) REFERENCES notes(id),
    FOREIGN KEY (target_note_id) REFERENCES notes(id)
);
```

## Note Properties

Notes can have flexible properties stored as JSON:
```json
{
  "mood": 7,
  "weather": "sunny",
  "priority": "high"
}
```

## Linking System

### Automatic Linking
- Daily notes automatically link to notes created on that day
- Weekly notes link to their daily notes
- Monthly notes link to their weekly notes

### Manual Linking
- Users can create manual links between any notes
- Links are always bi-directional
- Both source and target notes maintain link references

### Link Types
1. **Direct Links**: Forward references to other notes
2. **Backlinks**: Automatic reverse references

## Query Examples

1. Get all notes linked to a specific note:
```sql
SELECT n.*
FROM notes n
JOIN links l ON n.id = l.target_note_id
WHERE l.source_note_id = 'note-id';
```

2. Get all backlinks for a note:
```sql
SELECT n.*
FROM notes n
JOIN links l ON n.id = l.source_note_id
WHERE l.target_note_id = 'note-id'
AND l.link_type = 'backlink';
```
