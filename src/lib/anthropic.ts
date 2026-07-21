import { withHeadroom } from 'headroom-ai/anthropic';
import Anthropic from '@anthropic-ai/sdk';

// Wraps the Anthropic client with Headroom context compression.
// Requires the Headroom proxy running at HEADROOM_BASE_URL (default: http://localhost:8787).
export const anthropic = withHeadroom(new Anthropic(), {
  baseUrl: process.env.HEADROOM_BASE_URL ?? 'http://localhost:8787',
});
