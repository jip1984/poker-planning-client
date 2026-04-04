## Poker Planning Client

### Local Development

1. Create `client/.env.local` from `client/.env.example`.
2. Set `NEXT_PUBLIC_SOCKET_URL` to your Socket.IO server URL.
3. Run the client:

```bash
npm run dev
```

The default local value is `http://localhost:4000`.

### Deploy

Set this environment variable in your frontend host:

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.example.com
```

This frontend is designed to be deployed separately from the Socket.IO server.
