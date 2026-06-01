# University App — Backend Integration Documentation

Version: 1.0
Date: 2026-05-30

Purpose
-------
This document describes the app's features, screens, data models, and the backend contracts required to support them. It is written for backend engineers to implement the APIs and data structures that match the mobile client behavior.

Repository files referenced
--------------------------
- App entry: [lib/main.dart](lib/main.dart)
- App root & navigation: [lib/core/root/app_root.dart](lib/core/root/app_root.dart), [lib/core/root/app_router.dart](lib/core/root/app_router.dart)
- Service locator: [lib/core/di/service_locator.dart](lib/core/di/service_locator.dart)
- Networking helpers: [lib/core/networking/api_service.dart](lib/core/networking/api_service.dart), [lib/core/networking/api_result.dart](lib/core/networking/api_result.md)
- Feature implementations: [lib/features](lib/features)

Quick overview
--------------
The app is a startup discovery and community app. Main features:
- News feed (paginated)
- Explore (search, categories, featured/startups list)
- Startup profile & details (company page, features, news, contacts)
- Favorites / Followings
- Notifications (list, mark read, delete)
- Hub (events, training, jobs)
- Profile (theme, language settings)
- Onboarding (static items shown once)

Navigation & screens
--------------------
The bottom navigation and main screens are defined by `AppRouter.getScreens()` and `AppRouter.getNavigationItems()` in `lib/core/root/app_router.dart`. The order and mapping:
- Index 0: `NewsScreen` — route `/news`
- Index 1: `FavoritesScreen` — route `/favorites`
- Index 2: `ExploreScreen` — route `/explore`
- Index 3: `HubScreen` — route `/hub` (label appears as Arabic "المركز")
- Index 4: `ProfileScreen` — route `/profile`

Other screens and detail screens are navigated via `Navigator.push(...)` or dedicated cubits: e.g., `CompanyDetailsScreen(startupId: id)` and `NewsDetailScreen(newsId: id)`.

State management & DI
---------------------
- Dependency injection uses `getIt` in `lib/core/di/service_locator.dart`.
- Business logic uses `Cubit` classes (Flutter Bloc) per feature: `ExploreCubit`, `NewsCubit`, `StartupCubit`, `FavoritesCubit`, `NotificationsCubit`, `ProfileCubit`, `OnboardingCubit`.
- Repositories abstract network/data access (interfaces + `*Impl` classes) located under each feature `data/repo` folder.

Local storage keys (client-side)
- `onboarding_completed` — boolean (SharedPreferences) — used by `AppRoot` to skip onboarding.
- `app_theme` — boolean (ProfileCubit) — dark mode flag.
- `app_language` — string (ProfileCubit) — `'en'` or `'ar'`.

Networking & error format
-------------------------
- `ApiResult<T>` wrapper (see `lib/core/networking/api_result.md`) is used in repositories: either `success(data)` or `error(message)`.
- Backend should return structured errors aligned with `ApiError` model: `{ message: string, statusCode: number, details?: string }`.

Data models (client-side canonical types)
-----------------------------------------
Below are the app models as used in the client code. Use these for API response shapes.

1) `Startup` (used by Explore lists)
- id: string
- name: string
- description: string
- logoUrl: string (asset path or URL)
- coverUrl: string
- rating: double
- reviewCount: int
- category: string (category id)
- isFollowing: bool

2) `Category`
- id: string
- name: string
- displayName: string

3) `StartupDetails`
- id, name, description, logoUrl, coverUrl, rating, reviewCount, category, isFollowing
- website: string
- email: string
- phone: string
- founded: string
- location: string
- about: string
- vision?: string
- mission?: string
- featuredImage?: string
- features: string[]
- news: StartupNews[]
- contacts: Contact[]

4) `StartupNews`
- id: string
- title: string
- description: string
- imageUrl: string
- publishedAt: string (ISO date string)

5) `Contact`
- id: string
- name: string
- title: string
- email: string
- phone: string
- imageUrl: string

6) `NewsArticle`
- id: string
- title: string
- description: string
- content: string
- imageUrl: string
- category: string
- author: string
- sourceCompany: string
- publishedAt: string (ISO date)
- views: int
- tags: string[]

7) `AppNotification`
- id: string
- title: string
- message: string
- type: string (e.g., `follow`, `update`, `message`)
- relatedId?: string (optional id that the notification links to)
- imageUrl?: string
- timestamp: string (ISO date)
- isRead: bool

8) `FavoriteStartup`
- id: string
- name: string
- logoUrl: string
- category: string
- rating: double

9) `OnboardingItem`
- image: string (asset path)
- title: string
- description: string

API endpoints (recommended) — contracts and example payloads
-----------------------------------------------------------
The client currently uses repository implementations with mock data but expects the following endpoints and behaviors from the backend. Use JSON over HTTPS. All responses that return data should be wrapped in a standard object or follow successful HTTP status (200) with the data payload; errors should include an `ApiError`-like structure.

1) Explore / Startups
- GET /api/startups/featured
  - Response: 200
  - Body: [{Startup}]

- GET /api/startups?limit=xx&offset=yy  OR  GET /api/startups/latest?page=1
  - Response: { items: [Startup], page: number, total: number }

- GET /api/categories
  - Response: [{Category}]

- GET /api/startups/search?q={query}
  - Response: [{Startup}]

- GET /api/startups?category={categoryId}
  - Response: [{Startup}]

- GET /api/startups/{startupId}
  - Response: {StartupDetails}

Notes: `logoUrl` and `coverUrl` should be full URLs. If assets are local (dev mode), provide URLs or fallbacks acceptable to the client.

2) News
- GET /api/news?page={page}&per_page={per_page}
  - Response: { items: [NewsArticle], page: number, per_page: number, total: number }

- GET /api/news/{newsId}
  - Response: {NewsArticle}

3) Notifications
- GET /api/notifications (returns current user's notifications)
  - Response: [{AppNotification}]

- POST /api/notifications/{id}/mark_read
  - Request: none
  - Response: 200

- POST /api/notifications/{id}/delete
  - Request: none
  - Response: 200

4) Favorites / Followings
- GET /api/favorites
  - Response: [{FavoriteStartup}]

- POST /api/favorites { startupId }
  - Request: { "startupId": "..." }
  - Response: 200 / updated favorite list or empty success

- DELETE /api/favorites/{startupId}
  - Response: 200

5) Startup profile follow toggle
- POST /api/startups/{startupId}/follow  (toggles follow state)
  - Response: { isFollowing: bool }

6) Hub (events, training, jobs)
- GET /api/hub/events?page=1
  - Response: { items: [ { id,title,description,image,type,organization,date,time,location,status,statusColor,statusBgColor } ], page, total }

- GET /api/hub/trainings, /api/hub/jobs
  - Response: arrays with appropriate fields

7) Profile / Settings
- GET /api/profile (returns user settings)
  - Response: { email, name, languageCode, isDarkTheme }

- PATCH /api/profile
  - Request: partial settings e.g. { languageCode: 'ar', isDarkTheme: true }
  - Response: updated profile

Authentication
--------------
- The current client code does not show an auth flow; the backend should implement authentication as needed (e.g., JWT). If auth is required, endpoints above should expect an Authorization header: `Authorization: Bearer <token>`.
- If unauthenticated behavior is desired for public data (news, startups), those endpoints can be public; favorites, notifications, follow actions must be authenticated.

Error handling & status codes
----------------------------
- Success: 200 (or 201 where resource created)
- Client error: 4xx with body { message: string, statusCode: number, details?: string }
- Server error: 5xx with similar body

Pagination and filtering
------------------------
- Use `page` and `per_page` (or `limit`/`offset`) query params. The client expects incremental loads for news (see `NewsCubit.loadMoreNews()`); provide `total` or empty lists when done.
- For search endpoints, accept `q` query param and return matching results.

Localization
------------
- The app supports English (`en`) and Arabic (`ar`). Backend strings included in responses that are user-visible (e.g., category display names) should either be localized or the client will display them as-is. Recommended: return `displayName` fields for categories or provide multilingual fields like `displayName_en` and `displayName_ar`.

Contracts — example JSON
------------------------
Startup list item (example):
{
  "id": "tech-1",
  "name": "Advanced Tech Company",
  "description": "Innovative tech solutions",
  "logoUrl": "https://cdn.example.com/logos/tech-1.png",
  "coverUrl": "https://cdn.example.com/covers/tech-1.png",
  "rating": 4.8,
  "reviewCount": 468,
  "category": "technology",
  "isFollowing": false
}

Startup details (example):
{
  "id":"tech-1",
  "name":"Advanced Tech Company",
  "description":"Full description...",
  "logoUrl":"...",
  "coverUrl":"...",
  "rating":4.8,
  "reviewCount":468,
  "category":"technology",
  "isFollowing":false,
  "website":"https://example.com",
  "email":"contact@example.com",
  "phone":"+966501234567",
  "founded":"2020",
  "location":"Riyadh, KSA",
  "about":"Long about text...",
  "vision":"...",
  "mission":"...",
  "featuredImage":"...",
  "features":["Mobile Apps","AI Integration"],
  "news":[ {"id":"n1","title":"...","description":"...","imageUrl":"...","publishedAt":"2026-05-30T12:00:00Z"} ],
  "contacts":[ {"id":"c1","name":"Ahmed","title":"CEO","email":"...","phone":"...","imageUrl":"..."} ]
}

Notification example
{
  "id": "notif-1",
  "title": "New follower",
  "message": "You have a new follower",
  "type": "follow",
  "relatedId": "startup-1",
  "imageUrl": null,
  "timestamp": "2026-05-30T10:00:00Z",
  "isRead": false
}

Integration notes & recommendations
----------------------------------
- Use stable IDs (strings) for startups, news, users, contacts.
- Provide image URLs with appropriate CDN headers and sizes. The mobile client expects images for covers and logos.
- For follow/favorites toggles, return the updated state so the client can immediately reflect the change.
- Provide pagination metadata for list endpoints (page, per_page, total_count) to enable infinite scroll and "load more" behavior.
- If you plan webhooks or push notifications, design notifications API to accept `type` and `relatedId` so the client can deep-link into the appropriate screen.

Developer notes (client-specific)
---------------------------------
- `lib/core/di/service_locator.dart` registers repository implementations. The backend must match repository interfaces:
  - `ExploreRepository` methods: `getFeaturedStartups()`, `getLatestStartups()`, `getCategories()`, `searchStartups(query)`, `getStartupsByCategory(categoryId)`.
  - `NewsRepository` method: `getNewsArticles({page})`.
  - `NotificationsRepository` methods: `getNotifications()`, `markAsRead(id)`, `deleteNotification(id)`.
  - `FavoritesRepository` methods: `getFavorites()`, `addToFavorites(id)`, `removeFromFavorites(id)`.
  - `StartupRepository` method: `getStartupDetails(startupId)`.

- The client frequently uses `DateTime` ISO strings for publishedAt/timestamp. Use UTC ISO 8601 format.

Next steps
----------
- Backend engineers: confirm authentication approach (JWT/session) and provide example tokens for testing.
- Decide production image URL patterns and whether localized strings will be returned.
- Tell me which endpoints you want mock responses for first; I can generate Postman collections or example JSON files.

File created
------------
Saved as `APP_DOCUMENTATION.md` in project root.
