docker build -t webrtc-p2p-app .
docker run -d -p 3000:3000 -p 3001:3001 webrtc-p2p-app