# Rumble Frontend App
Frontend Vue app for Rumble exchange and pool management.

## Development
To setup the development environment first clone the repo:
```bash
git clone https://github.com/rumble-finance/frontend.git && cd frontend
```

### Local env
Install dependencies:
```bash
npm install
```

Start the app:
```bash
npm run serve
```

The app should be live at [http://localhost:8080](http://localhost:8080)

### Docker
If you'd rather spin up the app in a docker container:

```bash
docker-compose up
```

The app should be live at [http://localhost:8080](http://localhost:8080)

## Self-Hosting

As we believe in decentralization at all layers, we've made it easy to host your own Rumble Frontend.

## Design System
The app is using [Tailwind](https://tailwindcss.com/) to configure base styles. In development these styles can be viewed by running:

```bash
npm run tailwind-viewer
```
Your browser should load the app at [http://localhost:3000](http://localhost:3000).
