# ARiya Database

> This document explains the purpose of every database model in ARiya.
>
> It focuses on why each model exists rather than the Prisma implementation.

---

# Design Principles

The database should remain simple.

Avoid creating new tables unless they solve a real problem.

Store only the data ARiya truly owns.

Information that can always be retrieved from external services (such as YouTube video titles or thumbnails) should not be permanently stored unless there is a clear benefit.

---

# User

## Purpose

Represents a Google account.

A User can belong to only one Home at a time.

The User is responsible for authentication and account-level information.

---

# Home

## Purpose

Represents one relationship.

A Home contains exactly two members.

Everything shared between partners belongs to the Home.

Examples:

- Shared Playlists
- Watch Later
- Gallery
- Shared Notes
- Calendar
- Future Watch Together sessions

---

# HomeMember

## Purpose

Represents one user's membership inside a Home.

This stores information that belongs to the relationship instead of the account.

Examples:

- Nickname
- Avatar (future)
- Personal Playlists
- Future customization

If a member leaves a Home, these memories remain part of that chapter and do not move into a future Home.

---

# Playlist

## Purpose

Represents every media collection in ARiya.

Examples:

- Watch Later
- Liked Videos
- Shared Playlists
- Personal Playlists

Instead of creating different systems for each feature, every collection is represented as a Playlist.

---

# PlaylistVideo

## Purpose

Represents a YouTube video inside a Playlist.

Stores:

- Playlist
- YouTube Video ID
- Order
- Date Added

Video metadata is retrieved from YouTube when needed.

---

# Smart Playlist System

Every Playlist has two important properties.

## Type

Examples:

- SYSTEM
- CUSTOM

SYSTEM playlists include:

- Watch Later
- Liked Videos

CUSTOM playlists are created by users.

---

## Visibility

Examples:

- SHARED
- PERSONAL

Shared playlists belong to the Home.

Personal playlists belong to the HomeMember.

---

# Relationship Philosophy

Shared content belongs to the Home.

Personal content belongs to the HomeMember.

Nothing belongs to a previous relationship after leaving a Home.

Every new Home starts a new chapter.