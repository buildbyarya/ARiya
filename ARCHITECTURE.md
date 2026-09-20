# Satella — Project Context

> **Source of truth.** Keep this document current whenever product, architecture, UX, privacy, or roadmap decisions change.

## Vision

Satella is a **Couple Operating System**: a private digital home for exactly two partners to spend time together. It is not a messaging replacement or social network.

The intended feeling is: **“I’m going home,”** rather than “I’m opening another app.”

Satella prioritizes shared experiences, togetherness, comfort, privacy, memories, and simplicity. It deliberately excludes public feeds, followers, communities, strangers, friend requests, user search, and surveillance-style activity tracking.

## Product model

- One Home has exactly two members.
- Authentication is Google OAuth only; there are no usernames or public profiles.
- A user logs in, reaches the Park, then either creates or joins a Home.
- Home creation generates an `AR-XXXXXX` invite code and attaches the creator as the first member.
- A partner joins using that invite code only; there is no user search.
- Each user selects a nickname before creating or joining. It is shown in the Home and will later be editable.

## Privacy principles

Satella should never feel creepy. Online status, deliberately shared activities, shared playlists, and inviting a partner are appropriate. It must not track every click, visited page, action, or typing state.

Any future activity sharing requires explicit opt-in from **both** partners.

## Technical architecture

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL in Docker
- ORM: Prisma
- Authentication: NextAuth with Google OAuth

## Current flow

`Login → Park → Create Home or Join Home → Home`

The Park is the lobby. A user without a Home is redirected there; a user with a Home goes to Home. The creator stays in the Park while the invite code is displayed. When the partner joins, both users automatically enter Home. The former waiting room is intentionally removed.

## Home and design

The Home is the shared digital house. Its current modules are Watch Together, Music, Chat, Notes, Gallery, Games, and Calendar. Users will eventually be able to reorder modules, while less-used modules can live in the sidebar.

Design should be minimal, modern, comfortable, soft, and easy to understand. It should feel like an app, without becoming a fake phone UI, overly romantic, or childish.

The three-dot sidebar is a slide-over panel with a blurred backdrop and outside-click dismissal. It contains Profile, Settings, and future shortcuts. Logout belongs only in Settings.

## Key feature rules

### Watch Together

This is the highest-priority feature. It should behave like normal YouTube in solo mode. Once a partner is invited and accepts, shared-session synchronization includes play, pause, seek, timestamp, video changes, and late-join playback position. Leaving ends the session and returns both users to independent playback. Synchronization exists only during a shared watching session.

YouTube search, browse, recommendations, watching, Watch Later, library, playlists, queue, autoplay, and playlist playback should feel familiar while supporting collaboration. Watch Later UI is started; its storage and retrieval remain unfinished. Liked Videos will be a protected system playlist; user playlists can be created, renamed, deleted, and edited.

### Notes and Letters

Notes contain My Notes, Partner Notes, Shared Notes, and one One-Time Note. Shared Notes are collaborative. Creating a new One-Time Note replaces the old one and notifies the partner.

Letters are lasting memories: timestamped, sealed (not editable), and optionally scheduled for future delivery.

### Future modules

- Music Together: Spotify and future YouTube Music, with optional partner sync.
- Gallery: shared photos, videos, albums, favorites; later comments, reactions, slideshows.
- Games: examples include UNO, chess, drawing, and Truth or Dare.
- Calendar: shared birthdays, anniversaries, plans, and reminders.
- Customization: Home name, wallpaper, themes, decorations, seasonal themes, and eventually a shared virtual pet.
- Notifications: separate bell, grouped notifications, mute support; typing never notifies.
- Developer-only admin: broadcasts, support replies, bug investigation, Home management.
- Feature voting: one vote per Home; disagreements remain unresolved.

## Current status

Completed:

- Google authentication, Prisma, PostgreSQL, Docker
- Home creation and joining, invite codes, Park, Home, nicknames, basic UI

Started:

- Watch Together and YouTube integration
- Watch Later UI

## Development roadmap

1. Finish Watch Later storage and retrieval.
2. Build generic playlists.
3. Build Liked Videos on the playlist system.
4. Improve Library.
5. Add Invite Partner in Watch Together.
6. Implement real-time synchronization.
7. Add shared queue.
8. Add playlist playback.
9. Build Music Together.
10. Build Gallery.
11. Build Chat.
12. Build Notes.
13. Build Games.
14. Build Calendar.
15. Build Settings.
16. Add Home customization.
17. Build a mobile app.

## Delivery roadmap: Library to real-time Watch Together

This is the agreed implementation sequence. Do not start real-time synchronization until the preceding phases are complete and verified.

### Phase 0 — Repair the library foundation

**Status: implemented and migrated locally.** Library records intentionally store only the YouTube video ID and collection type. Title, channel, and thumbnail are resolved live from YouTube when a collection is displayed.

1. Make the Prisma `LibraryVideo` model and `lib/library.ts` agree on one video data contract.
2. Store the metadata needed to render a saved YouTube video: video ID, title, thumbnail, channel, and timestamps.
3. Create and apply a Prisma migration.
4. Replace untyped string values with a controlled video/list type.
5. Verify API authorization and Home scoping so one Home can never read another Home’s library.

### Phase 1 — Finish Watch Later

1. Make Save to Watch Later persist complete metadata.
2. Fetch the current Home’s Watch Later list from the database.
3. Render saved videos, open them in the player, and remove them.
4. Prevent duplicates and show useful loading, empty, and error states.
5. Verify persistence after refresh and for both members of the same Home.

### Phase 2 — Build playlists as the shared library system

1. Add `Playlist` and `PlaylistVideo` database models.
2. Treat Watch Later and Liked Videos as protected system playlists.
3. Support user-created playlists: create, rename, delete, add and remove videos.
4. Add ordering for playlist videos.
5. Rebuild the Library UI around these database-backed collections.

### Phase 3 — Stabilize solo YouTube playback

1. Keep search, link opening, player navigation, and video metadata consistent.
2. Replace the in-memory queue with a well-defined local or database-backed queue.
3. Add single-user playlist playback and next-video behavior.
4. Ensure all solo behavior works normally without a partner session.

### Phase 4 — Define a Watch Together session

1. Add an explicit Invite Partner / Accept / Leave session flow.
2. Create a Home-scoped watching-session data model.
3. Define the authoritative shared state: active video, play/pause status, playback position, last update time, and controller/action metadata.
4. Specify conflict rules: what happens when either partner plays, pauses, seeks, changes video, joins late, declines, or leaves.
5. Keep shared watching sessions private to the Home and opt-in only.

### Phase 5 — Introduce real-time synchronization

1. Choose and integrate the real-time transport.
2. Broadcast the agreed session events: play, pause, seek, video change, join, leave, and state resync.
3. Implement late-join synchronization using timestamp-aware playback position.
4. Add drift correction without fighting normal player controls.
5. Test with two separate authenticated browser sessions, including refreshes and temporary disconnections.

### Phase 6 — Collaborative playback enhancements

1. Make the queue shared and persistent during an active session.
2. Support collaborative playlist playback.
3. Add autoplay and sensible handoff to the next video.
4. Add polished session indicators and respectful notifications.
