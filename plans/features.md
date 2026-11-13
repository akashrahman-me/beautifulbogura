# Feature Inventory — Upazila/City Community Portal

A Bangla-first, mobile-first local information portal: every public service, directory and community listing for one area in one place. Below is the full feature set, grouped by area, with the data each feature holds and how users interact with it.

---

## 1. Global / Shell

| Feature | Details |
|---|---|
| Language | Bangla UI throughout; Bangla numerals for dates, counts, prices |
| Header | Logo, main-menu toggle, **dark / light mode** toggle |
| Global search | "What are you looking for? doctor, bank, hotel…" with clear button; searches across all services |
| Quick-link strip | Horizontal chips: Blood bank, Jobs, Tuition, Ambulance, Car rent, House rent, Police |
| Bottom tab bar (mobile) | Services · Blood bank · Home · Emergency · Weather |
| Social follow block | Facebook, WhatsApp, Telegram, TikTok, YouTube |
| Push notifications | "Notifications are off — enable from browser site settings" prompt with *Enable* button |
| Moderation notice ("জরুরি বার্তা") | Reusable banner on community lists: how to add your info, contact admin for corrections/removal |

## 2. Home Page

- **Date bar**: weekday · Gregorian date · Bangla calendar date (e.g. ২৯ কার্তিক ১৪৩৩)
- **Time-based greeting**: "Good morning, <area> residents"
- **Weather widget**: current temp, condition, rain chance, humidity, wind, next 3-day forecast
- **Hero slider** (4 slides, each with CTA):
  1. Welcome — all services in one place → *See services*
  2. Blood bank — find a donor → *Donor list*
  3. Jobs & buy/sell → *See jobs*
  4. Travel / nature spots → *See places*
- **Emergency card**: national number 999 + shortcuts to Fire service, Blood bank, Police, Ambulance
- **Recently viewed** (per-user, local) and **Popular · all time** tabs
- **Category filter chips** for the service grid: All, Introduction, Emergency, Health, Public service, Lists, Travel & stay, Courier & bank, Customer service, Beauty & fitness, Office & market, Mechanics & travel, IT, Pride & rent, Marriage, Blood & buy-sell
- **All-services grid** (~45 icon tiles) — see sections below

## 3. Area Introduction (Administrative Info)

| Page | Content |
|---|---|
| Upazila profile | Accordion sections: location & admin area, naming history, Liberation War role, population data, education, economy, elections, industry, rivers, natural resources, agriculture, health centres, export contribution, sports & recreation. Headline stats (literacy, unemployment, religion split, mouza count) |
| Municipality (Pourashava) | General info, institutions within (education/religious), other organisations, civic services, list of wards |
| Unions | Expandable card per union (11): contact list of union parishad, village names, staff, former chairmen, haat-bazaar list |
| Administration | UNO, AC Land with photo cards; list of former UNOs |

## 4. Emergency Services

| Page | Content |
|---|---|
| Fire service | Station card with 2 mobile numbers, "dial 999" note |
| Police station | Directory cards: OC, OC (Investigation), OC Highway, Duty officer — tap-to-call |
| Ambulance & hearse | Tap-number-to-call list; "+ add info" link |
| Electricity office | Rural Electrification (PBS) and PDB contact cards |

## 5. Health

### Doctors directory (rich, user-submitted)
- Stats header: total doctors · **sitting today** · departments
- Search by name / specialty / hospital / number
- Filter chips: *Sitting today*, All, per-specialty (with counts)
- Card: name, degree, specialty, phone, hospital → *See more*
- **Add doctor form** (published after admin verification):
  - Name*, Specialty* (≈35 options incl. Medicine, Child, Gynae, Cardio, ENT, Dental, Ortho, Psychiatry, Homeopathy… + "Other, write in")
  - Degrees (multi: MBBS, BDS, FCPS, MD, MS, FRCS, …, + other)
  - Mobile*, photo
  - **Repeatable chambers**: hospital, days, time, serial number, fee
- Honeypot field for spam

### Hospitals
- Cards for govt and private hospitals / dental clinics with photo and details

### Blood bank (core feature)
- Total donors counter and **per-blood-group counts** (A+, A-, B+, B-, O+, O-, AB+, AB-)
- **Eligibility status** counts: *Ready* (enough days since last donation) / *Not yet* / *No info*
- Filter by blood group, search by name or mobile
- Donor card: name, address, group, last donation date, "N days passed — ready to donate", **Call** button
- **Donor self-registration**: name, mobile, blood group, last donation date, address
- **Update last-donation date** per donor (inline form)

## 6. Public Directories (mostly admin-curated)

Each is a card list (photo, name, address, phone; tap-to-call; often "add your info" link to admin):

- Journalists (table: serial, name, media)
- Lawyers — designation, name, workplace, mobile, photo; **add profile & edit** forms
- Notable persons — blog-style biography posts
- Freedom fighters — searchable list (name, father's name, ID no., village), total count
- **Voter info lookup** — filter by union, date of birth (calendar) or birth year, free-text search by name / voter no.; misuse warning
- Schools & colleges (see §7)
- Courier services
- Banks (branch cards)
- Broadband ISPs
- Cleaners / sweepers
- Gyms & fitness
- Ladies' parlours (with *Copy number* button) / Gents' parlours & salons
- Important offices — searchable, "view on map" link, **add office form** (name, type, address, photo)
- Kazi (marriage registrar) offices
- Haat / bazaar list (market cards)
- Air travel agencies
- IT / cyber expert profile card (with QR "scan to connect")
- Successful sons & daughters (BCS cadres) — filter by cadre, total count
- Matchmakers (ghotok)

## 7. Education

- Searchable list (name, EIIN, area) + type filter; **List / Map** view toggle
- **Latest notices** feed
- Card: name, type, EIIN, founder, established date, area, phone → *details*
- **Add institution form**: name*, type*, EIIN, founder, established (full date or year only), union, phone, address, website, about, image, submitter name
- **Claim institution** form (head teacher / principal / committee member…): name, role, mobile, email, proof note
- **Post a notice** (for claimed institutions): title, body, link

## 8. Travel & Stay

- Tourist spots — category of blog posts (parks, resorts, national park) with image and description
- Restaurants — photo cards
- Residential hotels / guest houses — profile cards

## 9. Community Marketplace & Classifieds

All community posts share a common pattern: **no login; owner sets a 4–6 digit PIN** to later edit/delete/mark done; auto-expiry; report button; call + WhatsApp buttons.

### Jobs
- Search by company / post / area; count of active listings
- Card: company initial, days left / "expired" badge, title, vacancies, salary, summary, location, deadline → *details*
- **Post job**: company, title, vacancies, salary, deadline, education, experience & details, contact number (+ "has WhatsApp" checkbox), address, image, listing duration (7/15/20/30 days), owner PIN

### Buy & Sell
- Search by product / area; category chips with counts
- Card: condition (new/used/refurbished/parts), price ৳, posted-ago, category, title, description, seller, address, phone, WhatsApp, **Report**, **Edit / delete**
- **Sell form** (2 steps): category (mobile, laptop, computer, motorcycle, TV, fridge, sound system, furniture, car, cycle, animals, land, flat…), product name, condition, price, description, multiple images → seller name, mobile, address, 4-digit PIN
- **Report reasons**: fake/fraud, already sold, wrong info/photo, other

### House rent (To-Let)
- Search by area; type filter (flat, tin-shed house, sublet, mess, hostel, office, shop); **favourites**; *load more*
- Card: type, rent/month, description, rooms, gas yes/no, attached bath yes/no, owner, posted-ago, call / WhatsApp
- **Post form** (3 steps): owner name, mobile, manage PIN → type, rent, rooms, gas, attached bath, address, Google Maps link → up to 5 photos (drag & drop)
- Visible 30 days; owner can **mark as rented**; "manage your post" via PIN

### Car rent
- Type tabs: Private car, Bus, Hiace, Truck, Other; **favourites**
- Card badges: **Featured** (pinned top, via admin) and **Verified**; owner/driver, mobile, description, Call / WhatsApp / Report / Edit (PIN)
- Add vehicle info form

### Tuition
- Tabs: All · *Teacher wanted* · *Want to teach*
- **Post ad**: type (need teacher / I teach), name, phone, qualification, experience, class, subject, address, photo, 4-digit PIN
- PIN dialog → edit or delete (with confirm); auto-delete after 1 month

### Skilled workers (mechanics / mistri)
- Search + filter by ~20 trades (mason, carpenter, electrician, tiles, paint, car, AC, fridge, gas, thai glass, sanitary, quilt-maker, interior, CCTV, computer, TV, sewing…)
- **Self-registration**: name, mobile, multi-select trades
- Separate lists with type filter: Cooks & butchers; Band party & sound system

### Graphics designers & printing press
- Type filter; card with **star rating (avg + vote count)** and *Rate* action (1–5)

## 10. Marriage (Matrimonial)

- Landing: *Register* / *Browse list*
- **Registration**: full name, gender, birth year, religion, marital status, education (JSC…Masters), profession, family members, partner preference, address, mobile, photo
- Anti-abuse popup: fake submissions → IP permanently blocked
- **List** filterable by bride / groom; card shows age, gender, religion, status, education, profession, mobile, address, family, preferences, registration date
- Deletion via admin (send screenshot)

## 11. Media

- Video gallery page (embedded videos)

---

## Cross-cutting Patterns to Reuse

1. **Directory card** — photo, name, meta, phone → Call / WhatsApp / Copy number
2. **Filter bar** — search input + select/chips + "clear filters" + result count
3. **Anonymous posting with PIN** — no accounts; PIN gates edit / delete / mark-done
4. **Moderation** — admin approval queue, report button, honeypot anti-spam, IP block
5. **Auto-expiry** — jobs (chosen days), to-let (30 d), tuition (1 month)
6. **Featured / Verified** badges (admin-granted, paid-promotion ready)
7. **Favourites & recently viewed** — client-side storage
8. **Map links** — Google Maps link per office / house / institution; list ↔ map toggle
9. **Tap-to-call everywhere**, Bangla numerals, dark mode, PWA-style bottom nav, push notifications
