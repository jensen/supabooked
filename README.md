# Supabooked

Submitted to [Launch Week 5 Hackathon](https://www.madewithsupabase.com/launch-week-5).

## Demo

[https://supabooked.netlify.app/](https://supabooked.netlify.app/)

![Supabooked](https://user-images.githubusercontent.com/14803/185850222-88857ff9-82d0-46db-bf71-5878169bf145.png)

## Application Design

Backed by Supabase, a user can create invitations to schedule meetings. The user is presented with a weekly calendar of available hours that can be booked. These hours are based on the settings determined by the admin in their own timezone.

![Schedule Session](https://user-images.githubusercontent.com/14803/185849877-f00aeebf-e72b-4e7f-b975-0baaf6c34571.png)

![Admin Invitations](https://user-images.githubusercontent.com/14803/185850028-0ad37427-cf2d-45c9-86cf-cc4144659b75.png)

## Application Design

Backed by Supabase, a user can create invitations to schedule meetings. The user is presented with a weekly calendar of available hours that can be booked. These hours are based on the settings determined by the admin in their own timezone.
## Technical Considerations

### Timezones

For the most part we can let the browser convert the dates for us. In some cases we need to compare dates based on the specific timezone of a user.

### supabase-js v2

Using the lastest release candidate for supabase-js to handle realtime, storage, auth and database queries.

### Authentication

Still searching for ideal authentication strategies. In this prototype the persistence is turned off since the server runtime has no local storage. Instead we use a session stored in a cookie.

Refreshing the token on the client and the server is ripe for desyncing.

### Realtime

When a user views an invitation or signs up after being invited, the updates to the db are subscribed to by the admin panel.

### Storage

An admin can upload a video that attaches to a session. A database trigger is listening for updates to the `storage.objects` table, it updates the `sesssions` table with file keys.

## Next Steps

- Support devices with smaller screen
- Fix authentication bugs
