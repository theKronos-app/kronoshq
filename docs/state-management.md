# State Management in Kronos

Kronos uses XState for state management, leveraging its actor model and state machine architecture to handle complex application state and interactions.

## Core State Machines

### 1. Note Editor Machine

```typescript
states: {
  idle: {},
  editing: {},
  saving: {},
  error: {}
}

events: {
  EDIT: {},
  SAVE: {},
  CANCEL: {},
  ERROR: {}
}
```

The Note Editor machine handles all interactions with individual notes, including content editing, property updates, and link management.

### 2. Link Manager Machine

```typescript
states: {
  idle: {},
  creating_links: {},
  updating_links: {}
}

events: {
  CREATE_LINK: {},
  UPDATE_LINKS: {},
  REMOVE_LINK: {}
}
```

Manages bi-directional links between notes, handling both direct links and backlinks automatically.

### 3. Note Browser Machine

```typescript
states: {
  loading: {},
  viewing: {},
  filtering: {}
}

events: {
  LOAD_NOTES: {},
  FILTER: {},
  SEARCH: {}
}
```

Handles note browsing, filtering, and search functionality.

## Benefits of Using XState

1. **Predictable State Transitions**
   - Clear visualization of possible states
   - Explicit state transitions
   - Prevention of impossible states

2. **Actor Model Benefits**
   - Isolated state management
   - Clear communication patterns
   - Controlled side effects

3. **Developer Experience**
   - Visual state charts
   - Easy debugging
   - Clear separation of concerns

## Communication Between Machines

State machines communicate through events and can spawn child actors for specific tasks. This creates a hierarchical structure that matches the natural organization of the application.

Example:
```typescript
// Note Editor spawning a Link Manager actor
context: {
  linkManager: spawn(linkManagerMachine)
}
```

## Error Handling

Each machine includes error states and recovery mechanisms, ensuring robust error handling and recovery paths.
