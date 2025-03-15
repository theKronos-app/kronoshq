# Kronos Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string hashed_password
        datetime confirmed_at
        datetime inserted_at
        datetime updated_at
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        string display_name
        string bio
        string avatar_url
        jsonb settings
        datetime inserted_at
        datetime updated_at
    }
    
    NOTES {
        uuid id PK
        uuid profile_id FK
        string title
        text content
        string type
        datetime date
        jsonb properties
        boolean is_pinned
        boolean is_archived
        datetime inserted_at
        datetime updated_at
    }
    
    TAGS {
        uuid id PK
        string name
        string color
        uuid profile_id FK
        datetime inserted_at
        datetime updated_at
    }
    
    NOTE_TAGS {
        uuid id PK
        uuid note_id FK
        uuid tag_id FK
        datetime inserted_at
        datetime updated_at
    }
    
    NOTE_LINKS {
        uuid id PK
        uuid source_note_id FK
        uuid target_note_id FK
        string context
        datetime inserted_at
        datetime updated_at
    }
    
    USERS ||--o{ PROFILES : has
    PROFILES ||--o{ NOTES : creates
    PROFILES ||--o{ TAGS : creates
    NOTES ||--o{ NOTE_TAGS : has
    TAGS ||--o{ NOTE_TAGS : belongs_to
    NOTES ||--o{ NOTE_LINKS : "has as source"
    NOTES ||--o{ NOTE_LINKS : "has as target"
```

## Schema Details

### Users
- Already implemented for authentication
- Contains basic auth information

### Profiles
- Extends the user model with application-specific information
- One-to-one relationship with Users
- Contains display preferences and settings

### Notes
- Central entity for both notes and journal entries
- Type field differentiates between daily, weekly, monthly, and regular notes
- Properties field (JSONB) allows for flexible metadata storage
- Date field for journal entries (daily, weekly, monthly)

### Tags
- Reusable labels that can be applied to notes
- Each tag belongs to a specific profile

### Note Tags
- Junction table for many-to-many relationship between notes and tags

### Note Links
- Represents bidirectional links between notes
- Can be used for backlinks functionality
- Context field can store information about the nature of the link
