# YouTube-like Video Streaming Platform Backend

Repository have the backend functionality for a YouTube-like video streaming platform. It offering features such as user management, video publishing, playlists, subscriptions, likes, comments, and channel dashboards.

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vipuljain09/youtube-api.git


2. Install the Dependencies:
   ```bash
   npm install


3. Start the server:
   ```bash
   npm run dev
   
## Features

### User Management
- **Registration & Login**: Users can register with profile avatars and cover images. Authentication is handled through JWT tokens for secure logins.
  - `POST /register`: Register a new user with avatar and cover image upload.
  - `POST /login`: Authenticate and login users.
  
- **User Profile Management**: Users can update profile details and change their avatars or password.
  - `POST /update-user`: Update user details (requires authentication).
  - `POST /change-password`: Change user password (requires authentication).
  - `POST /update-avatar`: Upload and update user avatar (requires authentication).

### Video Management
- **Video Upload & Publishing**: Authenticated users can upload videos and associated thumbnails. Users can also toggle the video’s publish status.
  - `POST /`: Upload a video with metadata (thumbnail and video file) (requires authentication).
  - `GET /:videoId`: Fetch details for a specific video.
  - `DELETE /:videoId`: Delete a specific video.
  - `POST /toggle-status/:videoId`: Toggle the publish status of a video.

- **Fetch Videos**: Get a list of all videos or retrieve details of a single video by ID.
  - `GET /`: Fetch all uploaded videos.
  - `GET /:videoId`: Get details for a specific video.

### Subscription System
- **Channel Subscriptions**: Users can subscribe or unsubscribe to channels and view their subscriptions.
  - `POST /c/:channelId`: Toggle subscription to a specific channel.
  - `GET /u/:subscriberId`: Get all subscribed channels for a user.
  
- **Channel Subscribers**: Get a list of subscribers for a channel.
  - `GET /c/:channelId`: Fetch subscribers of a specific channel.

### Playlist Management
- **Create & Manage Playlists**: Users can create, update, or delete playlists, and add or remove videos from their playlists.
  - `POST /`: Create a new playlist.
  - `PATCH /:playlistId`: Update a playlist.
  - `DELETE /:playlistId`: Delete a playlist.
  - `PATCH /add/:videoId/:playlistId`: Add a video to a playlist.
  - `PATCH /remove/:videoId/:playlistId`: Remove a video from a playlist.
  - `GET /user/:userId`: Get all playlists for a user.

### Likes & Interactions
- **Like System**: Users can like or unlike videos, comments, and tweets. The system also tracks like counts for videos and comments.
  - `POST /toggle/v/:videoId`: Like or unlike a video.
  - `POST /toggle/c/:commentId`: Like or unlike a comment.
  - `POST /toggle/t/:tweetId`: Like or unlike a tweet.
  - `GET /videos`: Fetch all liked videos for the user.
  - `GET /video/:videoId`: Fetch like count for a video.
  - `GET /comment/:commentId`: Fetch like count for a comment.

### Comment System
- **Comment Management**: Users can add, update, and delete comments on videos.
  - `POST /`: Add a comment to a video.
  - `PATCH /:commentId`: Update a comment.
  - `DELETE /:commentId`: Delete a comment.
  - `GET /:videoId`: Fetch all comments for a video.

### Dashboard
- **Channel Stats**: Users can view statistics for their channels, including video analytics and overall performance.
  - `GET /stats`: Fetch channel statistics.
  - `GET /videos`: Fetch a list of all videos for the channel.



