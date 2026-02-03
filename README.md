# Screen Quiz Helper Web

A React SPA that lets you share your screen, select a region, and get AI answers from the Groq Vision LLM. Deploy to AWS S3 as a static site.

## Features

- **Screen capture** – Use the browser's `getDisplayMedia` API to share screen/window
- **Region selection** – Drag to select the area with the question
- **Vision LLM** – Sends the image to Groq's Llama 4 Scout for answers (no OCR)

## Requirements

- Modern browser with [getDisplayMedia](https://caniuse.com/mediadevices-getdisplaymedia) support (Chrome, Firefox, Edge)
- HTTPS (or localhost) – required for screen sharing
- [Groq API key](https://console.groq.com) (free tier)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output in `dist/` – static files ready for S3.

## Deploy to AWS S3

### Option A: GitHub Actions (automatic)

A workflow runs on push to `main` or `master` and deploys to S3.

1. Create an S3 bucket with static website hosting enabled
2. Set bucket policy for public read (or use CloudFront)
3. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`
4. Add GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`
5. Push to `main` or `master` to trigger deploy

### Option B: Manual

1. Create an S3 bucket with static website hosting enabled
2. Set bucket policy for public read (or use CloudFront)
3. Upload the `dist/` contents:

```bash
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```

4. If using a custom domain, configure CloudFront and Route 53
5. For SPA routing, set error document to `index.html` in S3 static hosting config

## API Key

- API key is stored in **localStorage** only (entered by the user in the app)
- On first use, the app prompts for a Groq API key; get one at [console.groq.com](https://console.groq.com)
- No build-time secrets or backend required
