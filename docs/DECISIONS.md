# ARiya Decisions

> This document records important architectural and product decisions.
>
> Unlike CHANGELOG.md, this file explains *why* a decision was made so future developers and AI assistants understand the reasoning.

---

# 2026-07-24

## Smart Playlist Architecture

### Decision

Every media collection in ARiya is represented by a Playlist.

Examples:

- Watch Later
- Liked Videos
- Shared Playlists
- Personal Playlists

### Reason

All of these features organize YouTube videos in similar ways.

Using one reusable Playlist system keeps the application simple, consistent, and easier to maintain.

---

## No LibraryVideo Model

### Decision

There will be no separate LibraryVideo model.

PlaylistVideo will store the YouTube video ID directly.

### Reason

ARiya does not permanently store YouTube metadata.

Video titles, thumbnails, channels, and other details are retrieved from YouTube when needed.

Adding another database model would increase complexity without providing enough benefit.

---

## Personal Playlists

### Decision

Personal Playlists belong to HomeMember instead of User.

### Reason

Personal playlists belong to a relationship, not a lifelong account.

When a Home ends, both partners begin a new chapter.

Old relationship memories should not automatically appear in a future Home.

---

## Shared Watch Later

### Decision

Watch Later is shared by both partners.

Removing a video removes it for everyone in the Home.

### Reason

Watch Later represents videos the couple may want to watch together.

If private saving is needed, users should use Personal Playlists instead.

---

## Liked Videos

### Decision

Liked Videos are personal.

### Reason

Likes are often casual or accidental.

Keeping them personal avoids cluttering the shared experience.

---

## Library Structure

### Decision

Library contains:

- Watch Later
- Liked Videos
- Playlists
- My Playlists

### Reason

This layout is familiar, simple, and easy to understand while clearly separating shared and personal collections.