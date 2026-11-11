# Beautiful Bhaluka — feature exploration notes

Reviewed: 11 November 2026 (Asia/Dhaka)  
Purpose: document the reference site's public features for future Beautiful Bogura planning.

## Scope and confidence

Visited all **45 unique service destinations** linked from the homepage, the linked specialist registration pages, and representative article/detail views. Opened the main submission dialogs and exercised selected searches, filters, accordions, and detail panels in a browser.

This is a public-interface inventory, not a backend audit or exhaustive test of every record. No records, comments, ratings, reports, or applications were submitted; no calls or messages were sent. Uploads, notifications, PIN authentication, publishing, deletion, and administrator workflows were not executed. Counts below are snapshots from the visit, not permanent totals. Public directory data has not been independently verified.

## Product overview

A Bangla local information and services portal for Bhaluka. It combines:

- Civic information and local history.
- Emergency and professional contact directories.
- Searchable community datasets.
- Jobs, tutors, rentals, and buy/sell advertisements.
- Blood donor registration and discovery.
- Matrimonial profiles and matchmaker listings.
- Articles about places and notable people, plus embedded videos.
- Public contributions through native forms, Google Forms, and WhatsApp.

The most common journey is **choose a service → find a listing → call or contact the provider directly**. Marketplace and rental pages are contact-based classifieds; no checkout or payment flow was observed.

## Homepage and shared navigation

| Feature | Observed behavior |
| --- | --- |
| Branding | Logo and Bangla site name link home. |
| Collapsible header menu | Blood bank, jobs, tuition, ambulance, vehicle rental, house rental, police. Opened successfully. |
| Greeting and date | Time-of-day greeting; Bangla weekday, Gregorian date, and Bengali calendar date. |
| Theme control | Day/dark-mode button is present. Persistence and appearance after switching were not tested. |
| Service search | Typing `ডাক্তার` reduced the grid to one service and exposed a clear button. Other homepage sections were hidden during the search. Clearing restored the directory. |
| Announcement carousel | Four numbered slide controls; promotions for general services, donors, jobs/buy-sell, and tourism. Includes relevant destination links and a services button. |
| Emergency panel | National emergency-number display plus shortcuts to fire service, donors, police, and ambulance. |
| Notifications | “চালু করুন” prompt to receive new notices on the phone. Subscription and delivery were not tested. |
| Popular shortcuts | Voters, donors, jobs, matrimonial, doctors, and videos. A selected popular/all-time tab is shown. |
| Category filters | All plus 15 groups: পরিচিতি, জরুরি, স্বাস্থ্য, জনসেবা, তালিকা, ভ্রমণ ও বাসস্থান, কুরিয়ার ও ব্যাংক, গ্রাহক সেবা, বিউটি ও ফিট, অফিস ও হাটবাজার, মিস্ত্রি ও ট্রাভেল, আইটি, গর্ব ও ভাড়া, বিবাহ, ব্লাড ও ক্রয়বিক্রয়. |
| Filter result counts | Health selected three destinations: doctors, ambulance, hospitals; All restored 45. |
| Weather | Current temperature/condition, rain probability, humidity, wind, and three upcoming-day temperatures. The quick-menu weather button revealed the panel. Weather accuracy/provider was not verified. |
| Bottom quick menu | Services, blood bank, home, emergency, weather; inner pages commonly link back to homepage anchors. |
| Social links | Facebook, WhatsApp, Telegram, TikTok, YouTube. |
| Accessibility affordances | Skip-to-content link, headings, labelled search controls, dialogs, and several semantic filter controls. Some other controls have weak or missing labels. |

Visual observation at the browser's narrow viewport: white branded header, green greeting area, rounded search field, blue weather card, colorful horizontal announcement cards, rounded service panels, emoji/icon identifiers, and a floating five-item bottom navigation with a raised central home button. This was not a full responsive-breakpoint audit.

## Complete homepage destination inventory

Each row represents a service explored during the review.

| # | Service | Public features observed |
| --- | --- | --- |
| 1 | উপজেলা | Introductory text and expandable sections covering geography, transport, naming/history, liberation war, population, education, economy, elections, industry, rivers, resources, agriculture, health, exports, recreation. First accordion expanded successfully. |
| 2 | পৌরসভা | General information, institutions and municipal-service accordions; table mapping nine wards to neighborhoods. General-information accordion tested. |
| 3 | ইউনিয়ন | Eleven union accordions. Expanded Uthura showed population/area/institution facts and council contact table with telephone links. |
| 4 | ফায়ার সার্ভিস | Emergency contact card with two telephone links and national emergency reminder. |
| 5 | থানা পুলিশ | Contact cards for OC, investigation OC, highway police, and duty officer. |
| 6 | প্রশাসন | UNO and land-officer telephone/email links; former UNO timeline with tenure dates. |
| 7 | ডাক্তার | Searchable doctor module, specialty filters, “sitting today” filter/count, doctor cards, contribution modal; older static profiles and specialist table also remain below. |
| 8 | এ্যাম্বুলেন্স | Ambulance and refrigerated mortuary-vehicle contacts, call links, external information-submission form. |
| 9 | হাসপাতাল | Hospital/clinic names, addresses and numbers; a hospital-detail link that returned a missing-page screen. |
| 10 | সাংবাদিক | Table of journalists, media organizations and phone numbers; Google Form contribution link. |
| 11 | আইনজীবী | Lawyer profiles with workplace/contact; plus button opens a new-profile form with text fields and image upload. |
| 12 | প্রসিদ্ধ ব্যক্তি | Biography articles with title, excerpt, author/date, detail links. Representative article includes expandable sections, references, previous-post navigation and comments. |
| 13 | মুক্তিযোদ্ধা | Displayed total 1,038; search by name/father/identifier/village, geographic filters and reset. Dynamic filter data appeared after loading; post-office and village choices include inconsistent spellings. |
| 14 | ভোটার তালিকা | Union selector, optional birth-date/year filters, search by name/voter number/birth date, name-plus-year examples, voter-count area, misuse notice. No individual voter lookup was performed. |
| 15 | স্কুল কলেজ | 41 institutions: 12 colleges and 29 high schools; search, type buttons, area filter, EIIN/founder/founding-date cards, deep-linked details, contribution/correction/claim functions. |
| 16 | দর্শনীয় স্থান | Park/resort article feed; representative detail includes location, transport/access and amenities, previous/next navigation, and comment form. |
| 17 | রেস্টুরেন্ট | Restaurant names, local addresses and some numbers; WhatsApp invitation to contribute photos/details. |
| 18 | আবাসিক হোটেল | Hotel/guest-house names, addresses and some numbers; WhatsApp contribution link. |
| 19 | কুরিয়ার | Courier providers, locations and contact numbers; Google Form contribution link. |
| 20 | ব্যাংক | Bank/branch directory with addresses, some contact numbers, Google Maps search links, and Google Form contribution link. |
| 21 | গাড়ি ভাড়া | Vehicle-type and favorite filters, photo cards, featured/verified badges, call/WhatsApp, expandable descriptions, reports, PIN editing, load-more, and submission modal. |
| 22 | ব্রডব্যান্ড | ISP descriptions, contact/location, displayed ratings and verification badge; WhatsApp contribution. No interactive rating control observed on this page. |
| 23 | পরিচ্ছন্নতা | Cleaning workers and service descriptions/numbers; Google Form contribution. |
| 24 | বিদ্যুৎ | Local electricity-office contact information. |
| 25 | জিম | Gym names, addresses and numbers; Google Form contribution. |
| 26 | লেডিস পার্লার | Image/name/address cards with Call, WhatsApp and Copy Number controls. |
| 27 | জেন্টস পার্লার | Salon/spa descriptions, addresses and numbers. |
| 28 | অফিস | Searchable office directory, address-bearing and upazila-office groupings, map links, contribution modal. Address-bearing group displayed 14 entries. |
| 29 | কাজী অফিস | Marriage-registrar contact cards by locality, with call links. |
| 30 | হাট বাজার | Market names, locations where supplied, and recurring weekly market days. |
| 31 | কসাই ও বাবুর্চি | Cook/butcher/all selector and registration link; no listing cards appeared in the inspected state. |
| 32 | সকল মিস্ত্রি | 244 displayed results, search, trade selector, multi-trade badges, addresses/call links, contribution button and registration page. |
| 33 | এয়ার ট্রাভেল | Travel-agency names, addresses, phone numbers and ticket-service descriptions. No booking engine observed. |
| 34 | গ্রাফিক্স | Printing/graphics provider filter, contact/address/type, average rating and vote count, 1–5 star selector, rating submission button, registration and correction contact links. |
| 35 | টিউশন | All/want-teacher/want-to-teach filters; tutor/request cards, call/WhatsApp, some edit/delete controls, conditional advertisement form. |
| 36 | Cyber Expert | One branded IT/security provider profile, service description, owner, telephone/WhatsApp/Facebook links, Copy Phone and Show QR Code buttons. Security/verification claims are page copy, not independently validated. |
| 37 | ভিডিও | Video gallery with eight embedded frames. Playback was not tested. |
| 38 | ব্যান্ডপার্টি | Band/sound-system/all filter, provider contact/type/address tables, registration link. |
| 39 | কৃতি সন্তান | 64 displayed achievers; cadre filter, photos, BCS batch/cadre, workplace/address, WhatsApp contribution template. |
| 40 | বাসা ভাড়া | Search, rental-type filter, favorites, photos, monthly rent/rooms/gas/bathroom, owner contact, post age, submission form and 30-day expiry message. One available listing shown. |
| 41 | পাত্রপাত্রী | Landing tiles for registration and profile list; separate forms and gender filter. |
| 42 | ঘটক | Matchmaker photos/contact/address, experience, completed marriages and age; registration link and call actions. |
| 43 | ব্লাড ব্যাংক | Donor totals/group counts, readiness summaries, name/mobile search, donor cards/call links, registration modal and last-donation-date update. |
| 44 | ক্রয়বিক্রয় | Search/category filters, product photos, price/condition/age, seller contact, report, edit/delete and listing submission. Three products shown. |
| 45 | চাকরি | Search, four displayed advertisements, deadline countdowns, circular images, vacancy/salary/qualification/location, detailed modal, phone/WhatsApp and PIN-managed posting. |

## Rich modules and contribution workflows

### Blood bank

The page displayed 1,729 donors, all eight blood groups with counts, and readiness summaries: 1,489 ready, 240 not yet ready, zero missing information. These are the site's labels, not a clinical assessment.

Cards expose name, address, group, phone, last donation date, elapsed days and readiness. Registration opens a modal with full name, mobile, blood group, last donation date and current address. Opening a card's date-update link exposes an inline date input and update button. Neither action was submitted; authorization checks and update persistence remain unverified.

### Jobs

Cards show employer, job title, vacancies, salary, qualification excerpt, address, closing date and remaining time. The detail modal adds the full qualification/experience text, circular image, direct contact actions, and owner edit/delete entry point.

Posting fields:

- Company, title, vacancy count, salary.
- Application deadline, education, experience/details.
- Contact number, address, WhatsApp availability checkbox.
- Optional circular image: JPG/PNG/WebP, up to 3 MB.
- Publication lifetime: 7, 15, 20 or 30 days; UI says the advertisement is removed after expiry.
- Secret PIN of 4–6 digits for later editing/deletion.

No application-tracking dashboard or CV-upload application flow was observed. The visible application journey is direct contact.

### Marketplace

The populated category tabs only showed categories represented by current products, while the posting form offered 20 categories: mobile, laptop, computer, motorcycle, TV, refrigerator, sound system, furniture, car, bicycle, animals, land/property, flat/house, fashion, sport, agricultural supplies, education materials, food, camera and other.

Posting captures category, product name, condition (new/used/refurbished/spare parts), price, description, up to five required product photos, seller name/mobile/address, and a four-digit management PIN. Images accept JPG/PNG/WebP up to 2 MB each; the first image is the cover. Posting is advertised as free. Reports and edit/delete controls are visible; their submissions were not tested.

### Vehicle rental

Types: private car, bus, Hiace, truck, other. Cards have photos, owner/driver, phone, descriptions, contact links and optional featured/verified badges. A featured example tells providers to contact the administrator for promotion. A load-more button showed three additional items available.

The add form captures type, vehicle/model name, owner/driver, mobile, up to five photos at 3 MB each, details and a 4–6 digit PIN. Its text says submissions are added to the site; publication behavior was not tested. Favorites, report and PIN-edit controls were observed but not exercised through persistence or submission.

### Property rental

Types: flat, Bengali-style house, sublet, mess, student hostel, office and shop. Posting captures owner name/mobile, 4–6 digit management PIN, type, monthly rent, room count, gas availability, attached bathroom, address, optional Google Maps link and up to five optional photos (JPG/PNG/WebP, 5 MB each).

The form states that listings remain visible for 30 days and the PIN allows editing, deletion or marking a property rented. It explicitly warns that the phone number becomes public. Those lifecycle transitions were not tested.

### Tuition

Two advertisement modes were opened and compared:

- **Want a teacher:** name, phone, class, subject, address and four-digit PIN.
- **Want to teach:** the above plus education, experience and optional photo.

The form explains that contact/profile data will be public and advertisements disappear after one month. A separate registration page also exposes the two modes. Loaded listings contained call/WhatsApp actions and an edit/delete control on one card. Filter badges showed zero even while three cards were visible, an inconsistency worth investigating.

### Schools and colleges

A representative institution deep link opened a detail dialog with type, EIIN, founding date, founder, area, address, phone, description, call and map links. It also includes WhatsApp/Facebook sharing, link copy, correction and ownership-claim controls.

Contribution fields include name, institution type, EIIN, founder, full founding date or year-only mode, area, phone, address, website, description, optional photo and optional submitter name. The interface says additions require administrator approval. Types include colleges, high schools, madrasas, primary schools and other.

The claim form requests claimant name, role, mobile, email and optional evidence/comment. Opening it showed an explanation that an administrator verifies the claim and emails a secret editing link. A notice-authoring dialog with title, detail and optional link also appeared in the page's DOM; access to publishing as an approved owner was not verified and should not be assumed to be public.

### Doctors

New-doctor form: name, specialty, multiple optional degrees, mobile, optional photo and repeatable hospital/chamber schedule rows. Specialty and degree pickers offer an “other” choice. The form says records are verified before publication. “Add another hospital” supports doctors with multiple chambers.

The newer searchable module counted one doctor and one specialty, with zero sitting today, while many older doctor records remained below it. Treat the module count as partial coverage rather than the total directory size.

### Matrimonial and matchmakers

Matrimonial registration requests full name, gender, birth year, religion, marital status, education, occupation, family members, partner preferences, address, mobile and optional photo. A notice discourages fake submissions. The profile list filters all/groom/bride and displays profile details and registration date. Removal instructions route users to an administrator through WhatsApp.

Matchmaker registration requests name, address, mobile, years of experience, completed marriages, age and photo. Listings expose these fields and direct call links.

### Trades, creative services and other contributions

| Module | Form / contribution mechanism |
| --- | --- |
| Tradespeople | Registration: name, phone, multiple trades, address; separate list-page add button. |
| Cook/butcher | Registration: name, phone, work type, address. |
| Graphics/printing | Registration: name, number, printing/graphics selection, address. Listings also allow rating submission. |
| Band/sound system | Registration: name, number, service type, address. |
| Lawyers | Plus button opens a profile modal with four text inputs, image chooser and submit. Field semantics were not fully exposed in the accessibility view. |
| Offices | Modal with address-bearing/upazila-office choice, office name, address and optional photo. |
| Static directories | Shared Google Form is linked by multiple pages; external form completion was not explored. |
| Administrator-assisted entries | WhatsApp links for several hospitality/business/profile categories and corrections. No messages sent. |

## Content, integrations and navigation patterns

- Article archives link to full posts and author archives. Representative tourism and biography posts have previous/next navigation and WordPress-style comment forms: comment, name, email, optional website, remember-details checkbox, submit.
- Provider cards vary between plain text numbers and actionable telephone links. WhatsApp URLs sometimes contain a prewritten enquiry about the particular advertisement.
- Maps are commonly external Google Maps search links rather than embedded mapping or an on-site geographic search.
- Videos use embedded frames. The IT provider page offers a QR-code control.
- Expiration and PIN management recur across classified modules, but limits vary by module.
- A mix of newer modal-driven modules and older static pages creates noticeably different interaction patterns.
- No general user account/dashboard, cart, checkout, in-site chat or payment collection was encountered in the reviewed public journeys. This is an observation, not proof that no unlinked/private feature exists.

## Observed issues and follow-up checks

1. **Broken hospital detail link:** the Bandhan Hospital link from the hospital directory opens “This page doesn't seem to exist.” The error screen provides a search box.
2. **Doctor count mismatch:** the structured module counts one doctor while a substantial older static directory remains below; search/filter coverage may be incomplete.
3. **Duplicate content:** duplicate-looking job advertisements and tradesperson entries appeared in the visible lists.
4. **Telephone formatting:** at least some tradesperson entries display Bengali-digit numbers but their link target is only `tel:`. Other directories contain varying country-code, leading-zero and spacing conventions. Normalize display/input separately from telephone URLs.
5. **Data quality:** matchmaker listings include an implausible age; tuition content includes apparent junk text. This supports a need for validation and moderation, not a conclusion about backend safeguards.
6. **Tuition counter mismatch:** zero filter badges were visible alongside loaded cards.
7. **Slow/dynamic initial state:** several pages initially showed empty/loading content before records appeared. Do not infer a broken or empty database from the first render; proper loading and empty states are important.
8. **Geographic normalization:** freedom-fighter filters contain spelling variants and apparent imported page-reference text in location values.
9. **Inconsistent UI:** Bangla/English labels, differing image limits and PIN lengths, numeric slugs, plain-text versus clickable contacts, and varying form patterns.
10. **Accessibility follow-up:** some form inputs were unnamed in the accessibility tree, some icon labels are unclear, and school dialog markup exposes several form structures in DOM snapshots. A dedicated keyboard/focus/screen-reader audit is still needed.
11. **Unverified persistence:** successful publishing, approval, expiry jobs, PIN ownership checks, reporting, ratings, favorites, notification delivery, clipboard actions and uploads were not validated end to end.

## Planning implications for Beautiful Bogura

These are recommendations inferred from the exploration, not features already implemented in this workspace.

- Build a shared directory model for category, name, location, contacts, images, verification state, submission source and last-reviewed date. Reuse search/filter/card/detail patterns across professions and businesses.
- Keep specialized models for donors, institutions, jobs, products, rental properties, vehicles, tuition requests/offers and matrimonial profiles; their fields and lifecycle rules differ substantially.
- Use a single contribution/moderation workflow with clear pending/published/rejected states, duplicate detection, correction requests and ownership verification.
- Standardize Bangla/English digit handling and phone normalization so search, display, telephone links and WhatsApp links remain reliable.
- Preserve the useful quick-service navigation and direct-contact journeys. Give listings stable descriptive URLs and shareable detail links.
- Treat expiry, rented/sold/closed status and owner management as explicit lifecycle features, with clear recovery and authorization rules.
- Validate uploaded files, provide consistent limits and previews, and test failure/loading/empty states across modules.
- Decide explicitly how sensitive donor, voter and matrimonial information should be collected and exposed before adopting those modules. Public visibility on the reference site is not an implementation specification for Bogura.
- A practical first release could combine the service homepage, emergency contacts, shared directory/search, civic information and moderated contributions. Add richer classifieds, institution management and specialized community modules in later phases.

## Review checklist

| Check | Result |
| --- | --- |
| All 45 homepage service destinations opened | Completed |
| Header menu, homepage search and health-category filter | Exercised successfully |
| Weather panel | Opened and read |
| Civic accordions | Representative sections expanded successfully |
| Donor registration and date-update UI | Opened; no submission |
| Job posting and detail modal | Opened; no submission |
| Product, vehicle and property submission forms | Opened; no submission |
| Tuition conditional fields | Both modes inspected |
| Doctor, lawyer and office contribution dialogs | Opened; no submission |
| School detail and ownership claim | Opened; no submission |
| Linked native registration pages | Inspected |
| Tourism and biography article templates | Representative detail pages inspected |
| External communications, uploads, account/owner access, notifications | Not executed |
| Every individual listing, article, filter combination and responsive breakpoint | Not exhaustively tested |
