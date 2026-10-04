/**
 * ─────────────────────────────────────────────────────────────
 *  FICTIONAL DEMO DATA
 *  Kowal & Daughter does not exist. Every name, date, price,
 *  address, phone number, email and hour below is placeholder
 *  content for a design concept. Replace before launch.
 *  This file is the single source of truth for both concept
 *  sites. Edit here; every page updates.
 * ─────────────────────────────────────────────────────────────
 */
window.KOWAL = {
business: {
  name: 'Kowal & Daughter',
  polishName: 'Kowal i Córka',
  kind: 'Polish rye bakery',
  founded: { year: 1991, starterBorn: '1991-03-04' },
  people: { founder: 'Teresa Kowal', baker: 'Ania Kowal' },
  timezone: 'America/New_York',

  address: {
    street: '118 Nassau Avenue',
    neighborhood: 'Greenpoint',
    city: 'Brooklyn',
    region: 'NY',
    postal: '11222',
    country: 'US',
  },
  transit: [
    { line: 'G', text: 'Nassau Av station, a short walk east' },
    { line: 'Ferry', text: 'Greenpoint landing (NYC Ferry, East River route)' },
  ],
  phone: { display: '(718) 555-0147', tel: '+17185550147' },
  email: 'orders@kowalanddaughter.example',
  instagram: { handle: '@kowalanddaughter', url: 'https://instagram.com/' },
  payments: 'Cash and card',

  /** 0 = Sunday … 6 = Saturday. Times are 24h, local. */
  hours: [
    { day: 0, label: 'Sunday', open: '07:00', close: '16:00' },
    { day: 1, label: 'Monday', open: null, close: null, note: 'Ovens off. Starter still fed.' },
    { day: 2, label: 'Tuesday', open: '07:00', close: '18:00' },
    { day: 3, label: 'Wednesday', open: '07:00', close: '18:00' },
    { day: 4, label: 'Thursday', open: '07:00', close: '18:00' },
    { day: 5, label: 'Friday', open: '07:00', close: '18:00' },
    { day: 6, label: 'Saturday', open: '07:00', close: '16:00' },
  ],
  story: [
    'Teresa Kowal brought the starter over from Białystok in a jam jar and opened on Nassau Avenue in 1991. It has been fed rye flour and water every morning since, including Mondays, when the ovens are off.',
    'Ania Kowal grew up doing homework on the flour sacks. She took over the night shift and kept the recipes as they were: rye that’s properly sour, makowiec with more poppy than dough, and pączki only on weekends because they’re worth the wait.',
  ],
  /** The night shift (kept for future use). */
  shift: [
    { time: '03:30', title: 'Lights on', text: 'Ania lets herself in. The ovens take an hour to come up to heat.' },
    { time: '04:00', title: 'Feed the starter', text: 'Rye flour, water, a wooden spoon. Same jar since 1991.' },
    { time: '04:45', title: 'Mix and shape', text: 'Rye dough is sticky, heavy and shaped by wet hand. No machine does it.' },
    { time: '05:50', title: 'Score', text: 'Three cuts on every żytni. That’s the house mark.' },
    { time: '06:30', title: 'Rye out', text: 'First loaves on the rack. The street starts to smell like it.' },
    { time: '07:00', title: 'Doors', text: 'Regulars first. Some of them have been coming since the jam jar.' },
  ],
  holdPolicy: 'Call before noon and we’ll hold a loaf with your name on it until close.',
},

/**
 * The daily bake sheet. `days` limits an item to certain weekdays.
 * Status (out / in the oven / later) is computed live in New York time.
 */
  bakeSheet: [
  { time: '06:30', item: 'Żytni', gloss: 'Sour rye, the big round', note: 'First out' },
  { time: '07:15', item: 'Drożdżówki', gloss: 'Sweet yeast buns, crumb top' },
  { time: '08:00', item: 'Pączki', gloss: 'Rose-jam doughnuts', days: [0, 6], note: 'Weekends, till gone' },
  { time: '09:30', item: 'Chałka', gloss: 'Braided egg loaf' },
  { time: '11:00', item: 'Rye, second bake', gloss: 'Seeded and plain' },
  { time: '13:00', item: 'Sernik', gloss: 'Farmer’s-cheese cake, by the slice' },
  { time: '14:30', item: 'Kołaczki', gloss: 'Apricot and poppy cookies' },
],

/** The counter. Prices are placeholders. */
  menu: [
  {
    id: 'rye',
    title: 'Rye & bread',
    lede: 'Naturally leavened, baked dark. Sliced on request.',
    items: [
      { name: 'Żytni', gloss: 'Sour rye, 100% rye flour, 1 kg', price: '9.00', star: true },
      { name: 'Seeded rye', gloss: 'Sunflower, pumpkin, flax', price: '9.50' },
      { name: 'Razowy', gloss: 'Wholemeal rye tin loaf, dense, keeps a week', price: '8.50' },
      { name: 'Wiejski', gloss: 'Country wheat-rye, crackly crust', price: '7.50' },
      { name: 'Chałka', gloss: 'Braided egg bread with crumb', price: '7.00' },
      { name: 'Bułki', gloss: 'Kaiser-style rolls, each', price: '1.25' },
    ],
  },
  {
    id: 'sweet',
    title: 'Sweet',
    lede: 'By the slice or whole with notice.',
    items: [
      { name: 'Makowiec', gloss: 'Poppy-seed roll, slice / whole', price: '4.50 / 26' },
      { name: 'Sernik', gloss: 'Baked farmer’s-cheese cake, slice / whole', price: '5.00 / 38' },
      { name: 'Drożdżówka', gloss: 'Yeast bun, cheese or plum', price: '3.75' },
      { name: 'Kołaczki', gloss: 'Apricot and poppy, half dozen', price: '6.00' },
    ],
  },
  {
    id: 'weekend',
    title: 'Weekends only',
    lede: 'Saturday and Sunday mornings, until they’re gone.',
    items: [
      { name: 'Pączki', gloss: 'Rose-hip jam, glazed or sugared', price: '3.50' },
      { name: 'Babka', gloss: 'Yeasted, orange zest, small loaf', price: '14.00' },
    ],
  },
],

/** Pre-order calendar. Dates are ISO; `orderBy` is the last day to order. */
  orderAhead: [
  {
    id: 'wigilia-2026',
    name: 'Wigilia',
    english: 'Christmas Eve',
    date: '2026-12-24',
    orderBy: '2026-12-19',
    items: 'Makowiec, piernik, sernik, rye for the table',
  },
  {
    id: 'tlusty-2027',
    name: 'Tłusty Czwartek',
    english: 'Fat Thursday',
    date: '2027-02-04',
    orderBy: '2027-01-31',
    items: 'Pączki by the dozen. The line goes round the block, so order.',
  },
  {
    id: 'wielkanoc-2027',
    name: 'Wielkanoc',
    english: 'Easter',
    date: '2027-03-28',
    orderBy: '2027-03-21',
    items: 'Babka, mazurek, small rye for the święconka basket',
  },
],

  standingOrders: [
  { title: 'Whole cakes, any week', text: 'Sernik or makowiec, 48 hours’ notice.' },
  { title: 'Cafés & restaurants', text: 'Wholesale rye, Tuesday to Friday drops in North Brooklyn.' },
],

  demoNotice: 'Concept site. Kowal & Daughter is a fictional bakery; names, prices, hours, history and contact details are placeholder data.',
};
