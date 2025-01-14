# Overview

Tagline: Your Partner in Productivity ( Bend time to your will )

## Core Idea

Kronos is an opinionated, local-first journal and task management tool that integrates a discreet, learning AI to provide personalized insights and guidance, helping you align your daily actions with your long-term goals.

## Target User

Individuals who are:

- Seeking more mindful productivity and a deeper understanding of their own patterns and priorities.
- Feeling overwhelmed by the disconnect between their aspirations and their daily actions.
- Interested in leveraging AI for personal growth without sacrificing control or privacy.
- Appreciate a structured and opinionated approach to digital organization.

## Key Features

### The Journal: Your Central Chronicle

- **Daily Log**: A dedicated space for daily entries, capturing thoughts, reflections, and observations. This serves as the primary container for your day.
- **Day-Based Notes**: The ability to create focused, titled notes within each day. These notes are automatically linked to the specific date, providing context and connection. Think of them as deeper dives into specific topics that arose on a given day.

  **AI-Powered Guidance (Behind the Scenes)**:

  - _Passive Learning_: Kronos' AI observes your journal entries, notes, and (eventually) tasks and calendar events to understand your goals, priorities, habits, and personality.
  - _Contextual Prompts (Optional)_: You can provide high-level "prompts" or frameworks (like your "Spartan study" example) to guide the AI's understanding of your current focus.
  - _Gentle Nudges_: Instead of interrupting, the AI provides subtle, non-intrusive feedback through notifications or dedicated panels. This feedback is designed to encourage self-reflection and alignment with your stated goals.
  - _Insight Generation_: The AI analyzes your data over time to identify patterns, highlight potential roadblocks, and offer insights into your behavior and progress. This could manifest as summaries, trend analysis, or even questions prompting deeper reflection.

### Task Management: Intentional Action

- **Integrated Task View**: Tasks are displayed alongside your journal entries for the day, providing a holistic view of your daily commitments.
- **Manual Task Creation**: Directly add tasks with descriptions, due dates (eventually), and priorities (potentially).
- **Future AI-Assisted Task Creation**: The vision includes AI automatically identifying potential tasks from your journal entries (e.g., "I need to pick up John on Wednesday" becomes a task).
- **Super Productivity Inspiration**: Leverage elements of Super Productivity's design philosophy, focusing on clear organization, focus timers (potentially in the future), and progress tracking.

## How it Works (User Journey Example)

- **Morning**: You open Kronos and begin your daily journal entry. You might reflect on your goals for the day, jot down thoughts, and plan upcoming activities.
- **Throughout the Day**: You create a specific note titled "Project Brainstorm" to capture ideas related to a work project. This note is automatically linked to the current date.
- **Later**: You mention in your journal, "I need to remember to schedule a call with Sarah." (In the future, the AI might recognize this as a potential task).
- **AI Feedback (Example)**: Because you've set a "Focus on Deep Work" prompt, and the AI notices you've mentioned attending multiple social events this week, a notification subtly appears saying, "Considering your focus on deep work, are you allocating your time effectively this week? Perhaps reviewing your priorities would be beneficial."
- **Task Management**: You manually add a task: "Call Sarah about the project" and assign a due date (eventually). This task appears in your task pane and within your journal entry for today.
- **Review**: At the end of the week, you might review AI-generated insights highlighting your progress on your stated goals or pointing out recurring patterns in your daily routines.

## Opinionated Design - "One Way to Do Things"

- **Data Storage**: Utilizes a local SQLite database to store journal entries, notes, and tasks, ensuring data integrity and efficient querying.
- **Structured Data**: Notes and tasks are stored in a structured format within the database, allowing for advanced features like filtering, sorting, and analysis.
