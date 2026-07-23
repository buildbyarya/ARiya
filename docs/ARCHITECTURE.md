# ARiya Architecture

> This document is the source of truth for ARiya's vision, philosophy, architecture, and major design decisions.
>
> Whenever a feature changes because of a product decision (not just code), this document must be updated.
>
> Every AI assistant or developer working on ARiya should read this document before making changes.

---

# What is ARiya?

ARiya (Arya + Riya) is a **Couple Operating System**.

It is **not** another messaging application.

It is a private digital home where exactly two partners can spend time together through shared experiences rather than endless chatting.

The goal is to reduce the feeling of distance by creating one shared place where both people naturally spend time together.

The feeling should be:

> "I'm going home."

instead of

> "I'm opening another app."

---

# Core Philosophy

ARiya exists to create shared experiences.

Everything inside the application should answer one question:

> "Does this help two people spend meaningful time together?"

If the answer is no, the feature should be questioned before being implemented.

The application should focus on:

- Togetherness
- Comfort
- Privacy
- Simplicity
- Shared memories
- Shared experiences

It should avoid becoming:

- A social network
- Another chat app
- A productivity tool
- A surveillance app

---

# Product Principles

## Exactly Two Members

A Home always contains exactly two people.

No group homes.

No communities.

No public rooms.

No followers.

No friends list.

---

## Private By Default

Everything belongs only to the Home.

There are:

- No public profiles
- No searching users
- No usernames
- No feeds

Partners connect only through invite codes.

---

## Shared Home

The Home is not a dashboard.

It is the couple's digital house.

Every feature should feel like another room inside the same home.

Examples:

- Watch Together
- Music Together
- Gallery
- Notes
- Calendar

---

# User Flow

```
Login
    ↓
Park
    ↓
Create Home / Join Home
    ↓
Home
```

---

# Park

The Park is the lobby before entering a Home.

Its responsibilities are:

- Create a Home
- Join a Home
- Display invite code
- Wait for partner

The previous Waiting Room has been removed.

Reason:

The Park already fulfills this responsibility without introducing another page.

When both users belong to the same Home they are automatically redirected into Home.

---

# Home

The Home is the center of the application.

Current planned modules:

- Watch Together
- Music
- Chat
- Notes
- Gallery
- Games
- Calendar

Future modules may be added.

Modules should remain simple and easy to understand.

---

# Watch Together Philosophy

Watch Together is currently the highest priority feature.

When alone:

It should behave exactly like YouTube.

Nothing should feel different.

Only after a partner is invited should synchronization begin.

Synchronization should never happen automatically.

Users intentionally choose when to watch together.

---

# Real-Time Sessions

Synchronization exists only during an active shared session.

When no session exists:

Everything behaves independently.

When a session exists:

- Play
- Pause
- Seek
- Video changes
- Current timestamp

must remain synchronized.

Future additions:

- Shared queue
- Playlist playback
- Autoplay

---

# Library Philosophy

The Library is the foundation of media inside ARiya.

Everything eventually belongs inside the Library.

Examples:

- Watch Later
- Liked Videos
- User Playlists
- History (future)

The goal is to build one reusable system instead of many unrelated ones.

---

# Music

Music Together follows the same philosophy as Watch Together.

When alone:

Behaves normally.

When invited:

Playback becomes synchronized.

---

# Notes vs Letters

Notes are for everyday communication.

Letters are for memories.

Notes are editable.

Letters become sealed memories once sent.

They exist for birthdays, anniversaries, important moments and future delivery.

---

# Privacy

Privacy is one of ARiya's core values.

Good examples:

- Online status
- Shared activities
- Shared playlists

Bad examples:

- Tracking every click
- Showing every page visited
- Showing typing activity everywhere
- Constant surveillance

Future activity sharing requires consent from both partners.

---

# Design Philosophy

ARiya should feel:

- Minimal
- Modern
- Comfortable
- Calm
- Warm

It should not feel:

- Overly romantic
- Childish
- Corporate
- Cluttered
- Like a fake phone inside a phone

The UI should be mobile-first while remaining comfortable on desktop.

---

# Current Technology

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js API Routes

Database

- PostgreSQL

ORM

- Prisma

Authentication

- NextAuth
- Google OAuth

---

# Development Rules

Before implementing any feature ask:

1. Does it fit ARiya's philosophy?
2. Can an existing system be reused?
3. Is this feature simple enough?
4. Does it improve the feeling of being "home"?
5. Does it respect privacy?

If the answer to any of these is "No", rethink the implementation.

---

# Living Document

This document is never "finished."

Whenever an important architectural or product decision changes, update this file before continuing development.

This document is considered the project's constitution.