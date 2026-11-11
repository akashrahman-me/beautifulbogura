# MessageThread

A renter–landlord conversation: header, message bubbles and composer.

- Props: `contact` (`{name, avatar, subtitle, verified}`; subtitle usually names the listing), `messages` (`[{from: 'me' | 'them', text, time}]` or `{day}` separators), `onSend(text)`, `onBack` (shows a back button on phones), `placeholder`.
- Full-screen on phones; beside the inbox list from lg. Your own messages are `brand`.
