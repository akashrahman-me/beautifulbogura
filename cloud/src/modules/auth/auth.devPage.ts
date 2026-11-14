/** The local stand-in for Google / Facebook / Apple while they are not configured. Never served in production. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const hidden = (q: { provider: string; returnTo?: string; app: string }) =>
  `<input type="hidden" name="provider" value="${esc(q.provider)}"><input type="hidden" name="returnTo" value="${esc(q.returnTo ?? '/')}"><input type="hidden" name="app" value="${esc(q.app)}">`;

export const devSignInPage = (q: { provider: string; returnTo?: string; app: string }, staff: { name: string; email: string; role: string }[]) => `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ডেভেলপমেন্ট সাইন ইন</title>
<style>
body{font-family:system-ui,'Noto Sans Bengali',sans-serif;background:#f7f4ee;color:#1d2422;display:grid;place-items:center;min-height:100vh;margin:0}
main{background:#fff;border:1px solid #e3ddd2;border-radius:16px;padding:28px;width:min(420px,92vw)}
h1{font-size:22px;margin:0 0 4px}p{color:#5b6461;font-size:14px;margin:0 0 18px}
label{display:block;font-size:14px;font-weight:600;margin:12px 0 6px}
input{width:100%;box-sizing:border-box;min-height:48px;border:1px solid #b9b1a3;border-radius:12px;padding:0 14px;font-size:16px}
button{margin-top:18px;width:100%;min-height:48px;border:0;border-radius:12px;background:#0f6b5c;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
.pick{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.pick button{width:auto;min-height:36px;margin:0;padding:0 12px;background:#e7f2ef;color:#0f6b5c;font-size:13px}
.note{margin-top:16px;font-size:12px;color:#8a8f8c}
</style></head><body><main>
<h1>ডেভেলপমেন্ট সাইন ইন</h1>
<p>${esc(q.provider)} এখনো সেট আপ করা হয়নি। স্থানীয় পরীক্ষার জন্য নাম ও ইমেইল দিন — এই ইমেইলের অ্যাকাউন্টে ঢুকবেন।</p>
<form method="post" action="/api/v1/auth/dev">${hidden(q)}
<label for="name">নাম</label><input id="name" name="name" required minlength="2" value="">
<label for="email">ইমেইল</label><input id="email" name="email" type="email" required value="">
<button type="submit">সাইন ইন করুন</button>
</form>
${staff.length ? `<p class="note">অথবা একজন স্টাফ হিসেবে:</p><div class="pick">${staff
  .map((s) => `<form method="post" action="/api/v1/auth/dev">${hidden(q)}<input type="hidden" name="name" value="${esc(s.name)}"><input type="hidden" name="email" value="${esc(s.email)}"><button type="submit">${esc(s.name)} · ${esc(s.role)}</button></form>`)
  .join('')}</div>` : ''}
<p class="note">শুধু ডেভেলপমেন্টে (AUTH_DEV_LOGIN=true)। প্রোডাকশনে এই পাতা থাকে না।</p>
</main>
</body></html>`;
