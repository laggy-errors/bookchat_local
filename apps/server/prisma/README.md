# BookChat Relational Database Models (Prisma Schema Spec)

This document maps out the specific purpose of each database model defined in the `schema.prisma` file, adhering to the standard Bible specifications for BookChat.

## Core Models Reference

1. **User**: Stores primary account credentials, email identities, unique usernames, and general account lifecycle states.
2. **Profile**: Public-facing details and customizations chosen by readers to identify themselves in discussions.
3. **Book**: Physical and metadata representation of curated books inside the BookChat library.
4. **Conversation**: Discussion threads and chat channels linked to specific books, chapters, or curated topics.
5. **ConversationParticipant**: Explicit join model linking readers to their active and historical conversation channels.
6. **Message**: Individual entries, fountain-ink scribbles, and comments sent within book discussion threads.
7. **Reaction**: Simple stamps or emojis overlayed directly on individual messages to express quick sentiments.
8. **Attachment**: Metadata record pointing to external files, shared PDFs, and imagery uploaded by readers.
9. **Bookmark**: Dynamic pointers that let users save specific discussion locations or book page numbers.
10. **Notification**: Delivery and reading state logs of alerts or system events targeting specific readers.
11. **ReaderPresence**: Lightweight active presence tracker logging readers' online, idle, or actively typing statuses.
12. **ReadingProgress**: Ongoing tracking record capturing completed pages, chapters, and time spent reading.
13. **Annotation**: Custom personal margin notes and highlights written by readers directly within books.
14. **Quote**: Selected favorite lines or passages saved by readers to display or share.
15. **Session**: Currently authenticated device sessions mapping out security access and device lifecycles.
16. **RefreshToken**: Cryptographically secured token hashes used to safely reissue session credentials.
17. **ThemePreference**: Reader-specific display configurations like parchment, vintage ledger, font scales, and motion rules.
18. **AuditLog**: Chronological administrative ledger recording security events, data modifications, and system updates.

## Initial Database Setup & Migration

To configure the initial migration and synchronize the schema with your local PostgreSQL instance, execute the following command:

```bash
npx prisma migrate dev --name init
```

*Note: In accordance with the migration rules, never modify historical migrations or fabricate SQL manually. Always apply schema modifications through the official migration CLI.*
