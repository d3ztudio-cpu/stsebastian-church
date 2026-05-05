# St. Sebastian Church Website

A professional React application for St. Sebastian Church, Puranattukara.

## Features

- Fixed background with overlay
- Sticky navbar
- Live stream toggle
- Mass timings
- Event timeline with lightbox gallery
- Admin dashboard for managing live stream, admins, and events
- SEO optimized with React Helmet

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Replace Firebase config in `src/firebase.js` with your project details
4. Set up Firestore collections:
   - `global_settings` document `liveStream` with field `url`
   - `site_admins` collection with documents keyed by email
   - `church_events` collection with event documents
   - `parish_bulletins` collection with documents keyed like `YYYY-MM` (e.g. `2026-05`)
   - `site_notifications` collection for public update feed
5. Set Firestore security rules (see `firestore.rules`)
6. Run `npm start` for development
7. Build and deploy: `npm run build` then `firebase deploy`

## Firestore Security Rules Example

```
See `firestore.rules`.
```

## Technologies

- React
- Tailwind CSS
- Firebase (Auth, Firestore, Hosting)
- React Helmet
- Yet Another React Lightbox

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
