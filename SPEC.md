## Realtime queue dashboard
### Description

A lightweight dashboard that displays a high-volume queue of tickets (items) in near real time, with filtering and search, item details, and simple workflow actions.  


### Purpose  

This is a training project to learn and demonstrate:

- Advanced RxJS (polling, cancellation, backpressure)
- NgRx state management (actions / reducers / selectors / effects)
- UI performance patterns (OnPush, trackBy, virtual scroll)
- Authentication / Authorization fundamentals (JWT, route guards, http interceptors, basic roles)


### Workflow

**Item Statuses** 

- NEW
- IN_PROGRESS
- DONE
- FAILED

**User Roles**

- ADMIN
- AGENT

**Actions / Permissions** 

- View queue and ticket details: ADMIN, AGENT
- Assign to me (NEW → IN_PROGRESS): ADMIN, AGENT
- Assign to user (NEW → IN_PROGRESS): ADMIN only
- Complete (IN_PROGRESS → DONE): Assignee only, or ADMIN

**Automatic Rule** 

- If deadlineAt < now and status is not DONE, the ticket becomes FAILED.

**Rules**

- Users must be authenticated to access the app.
- DONE and FAILED tickets are read-only.
- Only the assignee can complete a ticket (except ADMIN).


### Screens

1. **Login**
2. **Queue Dashboard**
    - Toolbar: Search + status filter + sort
    - Ticket list: Virtual scroll
    - Detail panel: Selected ticket details + action buttons.


### Models

**MVP Model**

```tsx
export type ItemStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
export type UserRole = 'ADMIN' | 'AGENT';

export interface QueueItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  assigneeId?: string;
  
  deadlineAt: string;  // ISO timestamp
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
  version: number;     // optimistic concurrency
  
  failReason?: 'DEADLINE_EXCEEDED';
}
```

- **deadlineAt** exists to support automatic FAILED status when overdue
- **updatedAt** exists to support polling/delta sync and deterministic sorting.
- **version** exists for optimistic concurrency on assign/complete operations.

**User model**

```tsx
export interface AppUser {
  id: string;
  name: string;
  email: string; 
  role: UserRole;
}
```


### Realtime updates (delta polling)

**Concept**

- The Queue Dashboard updates in near real time using delta polling.
- The client stores `lastSyncAt` (ISO timestamp of the last successful sync).
- Every 5 seconds, the client requests only tickets changed since `lastSyncAt`.

**Endpoint**

- `GET /api/tickets/changes?since={lastSyncAt}`
- Response returns:
    - `items: QueueItem[]` (only changed tickets)
    - `serverTime: string`
    

**Behavior**

1. On first load, if `lastSyncAt` is null, the client performs an initial sync using `since=1970-01-01T00:00:00Z`.
2. Polling runs every 5000ms while the Queue Dashboard is open.
3. On each tick:
    - Request changes since `lastSyncAt`
    - Upsert returned tickets into the store
    - Update `lastSyncAt = serverTime`
4. Polling stops on logout or when leaving the Queue Dashboard route.

**Rules**

- No overlapping poll requests are allowed.
- If a poll request fails, the app retries on the next tick without breaking the UI.
- On 401/403, polling stops and the user is redirected to Login.


### API Contract

**Base URL**

- `/api`

**Conventions**

- All timestamps are ISO strings.
- Auth uses JWT in `Authorization: Bearer <token>`.
- Mutations require `expectedVersion` for optimistic concurrency.
- Standard errors:
    - 401 Unauthorized (no/invalid token)
    - 403 Forbidden (insufficient role/permission)
    - 404 Not Found
    - 409 Conflict (version mismatch)
    - 422 Unprocessable Entity (validation)
    

**Auth**

- `POST /api/auth/login`
    - Request: `{ email: string, password: string }`
    - Response: `{ token: string, user: AppUser, serverTime: string }`
    

**Users**

- `GET /api/users`
    - Response: `{ items: AppUser[], serverTime: string }`
    - Note: used by ADMIN to assign tickets to other users

**Tickets (initial load + filters)**

- `GET /api/tickets?status=&q=&sort=&limit=`
    - Response: `{ items: QueueItem[], serverTime: string }`

**Tickets (delta polling)**

- `GET /api/tickets/changes?since={lastSyncAt}`
    - Response: `{ items: QueueItem[], serverTime: string }`
    - Returns tickets where `updatedAt > since`

**Tickets (mutations)**

- `POST /api/tickets/{id}/assign`
    - Request: `{ assigneeId: string, expectedVersion: number }`
    - Response: `{ item: QueueItem, serverTime: string }`
    - Errors: 403, 404, 409
    
- `POST /api/tickets/{id}/complete`
    - Request: `{ expectedVersion: number }`
    - Response: `{ item: QueueItem, serverTime: string }`
    - Errors: 403, 404, 409


### State boundaries (NgRx vs local state)

**NgRx (global state)**

- Auth: `user`, `token`, `status`, `error`
- Queue:
    - ticket entities + ids
    - selected ticket id
    - filters (status, search query, sort)
    - polling state (`pollingEnabled`, `lastSyncAt`)
    - request statuses + errors (load/poll/mutations)
    

**Local component state**

- UI-only concerns (e.g., whether the detail panel is open)
- reactive form UI state (touched/dirty) for login


### what I will demonstrate with this project

**RxJS (async correctness)**

- **Cancellation with `switchMap`**
    - Where: search/filter changes and polling start/stop.
    - Proof: changing filters quickly does not cause stale results to appear.
- **No overlapping requests**
    - Where: delta polling effect.
    - Proof: if one poll request is in-flight, the next tick does not start a second request.
- **Backpressure / rate control**
    - Where: search input.
    - Proof: API calls are debounced (e.g., 300ms) and not fired on every keystroke.
- **Resilient error handling**
    - Where: polling + mutations.
    - Proof: polling failures do not break the UI; the next tick continues. Mutations surface errors cleanly.
    

**NgRx (state architecture)**

- **Feature slices with clear boundaries**
    - Where: `auth` slice and `queue` slice.
    - Proof: components read state via selectors and dispatch actions; no direct service subscriptions in components.
- **Memoized selectors + derived state**
    - Where: filtered/sorted ticket list, counts by status, selected ticket.
    - Proof: selectors are pure, reusable, and avoid unnecessary recomputation.
- **Optimistic concurrency handling**
    - Where: assign/complete actions include `expectedVersion`.
    - Proof: 409 Conflict is handled by refreshing/upserting the server ticket and showing a message.

**Angular performance**

- **OnPush + async pipe discipline**
    - Where: all container/presentation components.
    - Proof: UI updates only via observable streams and store emissions.
- **Virtual scroll + trackBy**
    - Where: ticket list.
    - Proof: smooth scrolling with thousands of tickets and stable rendering.

**Auth (real-world plumbing)**

- **Route protection + role-based UI**
    - Where: login + dashboard access; ADMIN-only assign-to-user.
    - Proof: unauthenticated users cannot access dashboard; AGENT cannot assign to other users.


### MVP Scope

**In scope**

- 2 routes: `/login` and `/queue`
- Signup/registration, password reset, email verification
- Refresh token rotation / silent re-auth
- Authentication (JWT login) and role-based authorization (ADMIN, AGENT)
- Queue Dashboard:
    - search, status filter, sort
    - virtual scroll ticket list
    - ticket detail panel with actions
- Delta polling every 5 seconds using `lastSyncAt` + `/tickets/changes`
- Ticket mutations:
    - assign (assign to me / ADMIN assigns to user)
    - complete
    - optimistic concurrency with `expectedVersion` + 409 Conflict handling
- Deadline rule:
    - tickets become FAILED when `deadlineAt < now` and status is NEW or IN_PROGRESS
- Basic error handling (401/403/409 + non-blocking polling errors)

**Out of scope (for this Angular project)**

- Kanban board / drag-and-drop
- Comments, attachments, notifications
- Complex RBAC (more than 2 roles) or permissions matrix
- Real-time push (WebSockets/SSE) — polling only
- Full pagination/infinite scroll beyond virtual scroll
- Extensive E2E tests (keep tests minimal and high-value)
- UI design polish (focus on engineering patterns)
