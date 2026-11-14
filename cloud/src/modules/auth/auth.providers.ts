/**
 * Social sign-in providers. Each turns a callback into a verified ProviderProfile.
 * Google and Apple are OpenID Connect (ID token verified against the provider's keys, nonce checked);
 * Facebook is OAuth 2 + Graph API with appsecret_proof.
 */
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';
import type { ProviderProfile } from '@/modules/user/user.service';

export type Provider = 'google' | 'facebook' | 'apple';
export const callbackUrl = (p: Provider) => `${env.API_URL}/api/v1/auth/${p}/callback`;

export const isConfigured = (p: Provider) =>
  p === 'google' ? !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) : p === 'facebook' ? !!(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) : !!(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const pkceChallenge = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');

/** Build the provider's authorization URL. */
export const authorizeUrl = (p: Provider, s: { state: string; nonce: string; verifier: string }) => {
  if (p === 'google') {
    const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    u.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: callbackUrl(p), response_type: 'code', scope: 'openid email profile', state: s.state, nonce: s.nonce, code_challenge: pkceChallenge(s.verifier), code_challenge_method: 'S256', prompt: 'select_account' }).toString();
    return u.toString();
  }
  if (p === 'facebook') {
    const u = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    u.search = new URLSearchParams({ client_id: env.FACEBOOK_APP_ID, redirect_uri: callbackUrl(p), response_type: 'code', scope: 'email,public_profile', state: s.state }).toString();
    return u.toString();
  }
  const u = new URL('https://appleid.apple.com/auth/authorize');
  u.search = new URLSearchParams({ client_id: env.APPLE_CLIENT_ID, redirect_uri: callbackUrl(p), response_type: 'code', response_mode: 'form_post', scope: 'name email', state: s.state, nonce: s.nonce }).toString();
  return u.toString();
};

const jose = () => import('jose');
const googleKeys = jose().then((j) => j.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs')));
const appleKeys = jose().then((j) => j.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys')));

const postForm = async (url: string, body: Record<string, string>) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams(body) });
  const json = (await res.json().catch(() => ({}))) as Record<string, string>;
  if (!res.ok) throw ApiError.badRequest('Provider token exchange failed', 'PROVIDER_ERROR');
  return json;
};

/** Apple's client secret is a short-lived ES256 JWT signed with the team's key. */
const appleClientSecret = async () => {
  const j = await jose();
  const key = await j.importPKCS8(env.APPLE_PRIVATE_KEY, 'ES256');
  return new j.SignJWT({}).setProtectedHeader({ alg: 'ES256', kid: env.APPLE_KEY_ID }).setIssuer(env.APPLE_TEAM_ID).setIssuedAt().setExpirationTime('5m').setAudience('https://appleid.apple.com').setSubject(env.APPLE_CLIENT_ID).sign(key);
};

/** Exchange the callback for a verified profile. `extra` carries Apple's one-time `user` form field. */
export async function exchange(p: Provider, code: string, s: { nonce: string; verifier: string }, extra?: { user?: string }): Promise<ProviderProfile> {
  const j = await jose();
  if (p === 'google') {
    const t = await postForm('https://oauth2.googleapis.com/token', { code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: callbackUrl(p), grant_type: 'authorization_code', code_verifier: s.verifier });
    const { payload } = await j.jwtVerify(t.id_token, await googleKeys, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: env.GOOGLE_CLIENT_ID });
    if (payload.nonce !== s.nonce) throw ApiError.badRequest('Nonce mismatch', 'PROVIDER_ERROR');
    return { provider: p, providerId: String(payload.sub), email: (payload.email as string) ?? null, emailVerified: payload.email_verified === true, name: (payload.name as string) ?? '', avatar: (payload.picture as string) ?? null };
  }
  if (p === 'facebook') {
    const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    tokenUrl.search = new URLSearchParams({ client_id: env.FACEBOOK_APP_ID, client_secret: env.FACEBOOK_APP_SECRET, redirect_uri: callbackUrl(p), code }).toString();
    const t = (await (await fetch(tokenUrl)).json()) as { access_token?: string };
    if (!t.access_token) throw ApiError.badRequest('Provider token exchange failed', 'PROVIDER_ERROR');
    const proof = createHmac('sha256', env.FACEBOOK_APP_SECRET).update(t.access_token).digest('hex');
    const meUrl = new URL('https://graph.facebook.com/v21.0/me');
    meUrl.search = new URLSearchParams({ fields: 'id,name,email,picture.type(large)', access_token: t.access_token, appsecret_proof: proof }).toString();
    const me = (await (await fetch(meUrl)).json()) as { id?: string; name?: string; email?: string; picture?: { data?: { url?: string } } };
    if (!me.id) throw ApiError.badRequest('Provider profile failed', 'PROVIDER_ERROR');
    // Facebook only returns confirmed email addresses.
    return { provider: p, providerId: me.id, email: me.email ?? null, emailVerified: !!me.email, name: me.name ?? '', avatar: me.picture?.data?.url ?? null };
  }
  const t = await postForm('https://appleid.apple.com/auth/token', { code, client_id: env.APPLE_CLIENT_ID, client_secret: await appleClientSecret(), redirect_uri: callbackUrl(p), grant_type: 'authorization_code' });
  const { payload } = await j.jwtVerify(t.id_token, await appleKeys, { issuer: 'https://appleid.apple.com', audience: env.APPLE_CLIENT_ID });
  if (payload.nonce !== s.nonce) throw ApiError.badRequest('Nonce mismatch', 'PROVIDER_ERROR');
  // Apple sends the name only on the very first authorization, in a form field — keep it then.
  let name = '';
  try {
    const u = extra?.user ? (JSON.parse(extra.user) as { name?: { firstName?: string; lastName?: string } }) : null;
    name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ');
  } catch {
    /* ignore a malformed user field */
  }
  return { provider: p, providerId: String(payload.sub), email: (payload.email as string) ?? null, emailVerified: payload.email_verified === true || payload.email_verified === 'true', name, avatar: null };
}
