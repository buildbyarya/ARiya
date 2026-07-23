# Contributing to ARiya

This document defines the development rules for ARiya.

Whether the contributor is a human or an AI assistant, these rules should be followed.

---

# Before Writing Code

Always read:

1. ARCHITECTURE.md
2. ROADMAP.md
3. FEATURES.md

before making changes.

Do not implement a feature without understanding why it exists.

---

# Development Philosophy

ARiya is a product-first project.

The goal is not to add the most features.

The goal is to build the best experience for couples.

Every feature should improve the feeling of sharing a home.

---

# Reuse Existing Systems

Prefer extending an existing system instead of creating a new one.

Examples:

- Watch Later should use the Playlist system.
- Liked Videos should use the Playlist system.
- Future features should build on existing architecture whenever possible.

---

# Privacy First

Never introduce features that feel like surveillance.

If a feature exposes partner activity, it should require mutual consent.

---

# Simplicity

Avoid unnecessary complexity.

If two implementations achieve the same result, choose the simpler one.

---

# Documentation

Whenever architecture changes:

Update the documentation before considering the task complete.

---

# Coding Style

- Keep files focused.
- Prefer reusable components.
- Avoid duplicate logic.
- Name things clearly.
- Write code that future developers can understand.

---

# Final Rule

Do not build features because they are technically interesting.

Build features because they improve the experience of being together.