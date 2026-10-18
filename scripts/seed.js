const mongoose = require('mongoose');
const crypto = require('crypto');
const Product = require('../models/product');

// Fictional products, illustrative prices and original vector product artwork.
// Stable IDs + setOnInsert make reruns safe and preserve admin edits.
const products = [
  ['phone', 'Orbit One', 'ORBIT', 1899, '#727e9e', 'A little more room for everything.', 'A slim everyday phone for photos, playlists and staying in touch. A bright display and a comfortable silhouette make it an easy daily companion.', '6.4-inch OLED display\n128 GB storage · 8 GB RAM\n50 MP main camera\n4,800 mAh battery · USB-C'],
  ['phone', 'Orbit Mini', 'ORBIT', 1299, '#aab99d', 'Small size. Big possibilities.', 'An easy-to-carry phone with a compact display and a clean, understated finish. Designed for everyday calls, messaging and quick snapshots.', '5.9-inch OLED display\n128 GB storage · 6 GB RAM\n32 MP main camera\n4,200 mAh battery · USB-C'],
  ['computer', 'Forma Air 14', 'FORMA', 3699, '#b9c1cb', 'Your ideas, anywhere.', 'A lightweight notebook for writing, browsing and everyday creative work. Its generous screen and quiet design keep the focus on what you are making.', '14-inch IPS display\n16 GB RAM · 512 GB SSD\nBacklit keyboard\nUSB-C charging · 1.3 kg'],
  ['computer', 'Forma Studio 16', 'FORMA', 5499, '#646a73', 'Make space for your next idea.', 'A roomy laptop for multitasking and creative projects. The larger display gives documents, timelines and designs space to breathe.', '16-inch IPS display\n32 GB RAM · 1 TB SSD\nFull-size backlit keyboard\nUSB-C and HDMI · 1.8 kg'],
  ['headphone', 'Echo Quiet', 'ECHO', 699, '#dfc9a9', 'Find your own quiet.', 'Soft over-ear cushions and an adjustable headband make these wireless headphones a companion for focused work and relaxed listening.', 'Over-ear wireless headphones\nActive noise cancellation\nUp to 30 hours listening time\nUSB-C charging · 250 g'],
  ['headphone', 'Echo Studio', 'ECHO', 899, '#53665a', 'For the tracks you come back to.', 'A considered pair of over-ear headphones with generous ear cushions and a balanced everyday listening profile. Fold them away when the day is done.', '40 mm dynamic drivers\nWireless and 3.5 mm wired modes\nUp to 35 hours listening time\nFoldable design · 270 g'],
  ['camera', 'Frame Pocket', 'FRAME', 2499, '#8f9c86', 'Take the long way home.', 'A compact camera for noticing the little things. A tactile grip and simple controls make it easy to bring along on walks and weekends away.', '24 MP image sensor\nFixed 28 mm equivalent lens\n3-inch rear display\nUSB-C charging · 320 g'],
  ['camera', 'Frame Explorer', 'FRAME', 4199, '#6c727b', 'A new perspective awaits.', 'A versatile camera concept for everyday exploration. Its comfortable grip and interchangeable lens design leave room to grow your creative practice.', '26 MP image sensor\nInterchangeable lens mount\n4K video recording\nTilting rear display · 480 g'],
  ['gaming', 'Level Wireless', 'LEVEL', 249, '#c4b8d6', 'One more round.', 'A wireless controller with a comfortable shape, responsive buttons and textured grips. Built for relaxed evenings and shared-screen sessions.', 'Wireless and USB-C modes\nDual analogue sticks\nRechargeable battery\nPC-compatible controller concept'],
  ['gaming', 'Level Pro', 'LEVEL', 399, '#455a56', 'Play your way.', 'A controller concept with a reassuring grip and a clean button layout. Customisable rear controls keep your favourite actions close at hand.', 'Wireless and USB-C modes\nTwo rear control buttons\nAdjustable trigger stops\nRechargeable battery'],
  ['wearable', 'Tempo Daily', 'TEMPO', 499, '#c0a38d', 'A little rhythm for your day.', 'A lightweight watch concept for daily routines. Keep the time, movement reminders and activity summaries within easy reach.', '1.7-inch colour display\nStep and activity tracking\nUp to 7 days battery life\nSoft adjustable silicone strap'],
  ['wearable', 'Tempo Active', 'TEMPO', 799, '#62776c', 'Keep moving, at your pace.', 'A watch concept with a bright display and a comfortable strap for busy days. Glance at your activity progress without reaching for your phone.', '1.8-inch colour display\nOutdoor activity modes\nUp to 10 days battery life\nAdjustable silicone strap']
];

products.push(...[
  [
    "phone",
    "Orbit Plus",
    "ORBIT",
    2299,
    "#c7ad95",
    "Made for your everyday.",
    "Orbit Plus is a fictional phone concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "6.7-inch OLED display\n256 GB storage · 8 GB RAM\n50 MP camera · USB-C"
  ],
  [
    "phone",
    "Orbit Go",
    "ORBIT",
    999,
    "#8eafb3",
    "Made for your everyday.",
    "Orbit Go is a fictional phone concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "6.1-inch display\n128 GB storage · 6 GB RAM\n4,500 mAh battery · USB-C"
  ],
  [
    "computer",
    "Forma Flex 13",
    "FORMA",
    3299,
    "#b8a8bf",
    "Made for your everyday.",
    "Forma Flex 13 is a fictional computer concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "13-inch touchscreen\n16 GB RAM · 512 GB SSD\nConvertible hinge · USB-C"
  ],
  [
    "computer",
    "Forma Work 15",
    "FORMA",
    4299,
    "#83959e",
    "Made for your everyday.",
    "Forma Work 15 is a fictional computer concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "15-inch IPS display\n16 GB RAM · 1 TB SSD\nBacklit keyboard · HDMI"
  ],
  [
    "headphone",
    "Echo Travel",
    "ECHO",
    549,
    "#b48d7b",
    "Made for your everyday.",
    "Echo Travel is a fictional headphone concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "Foldable wireless headphones\nNoise cancellation\n28-hour battery · USB-C"
  ],
  [
    "headphone",
    "Echo Light",
    "ECHO",
    349,
    "#9aacc5",
    "Made for your everyday.",
    "Echo Light is a fictional headphone concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "Lightweight over-ear design\nWireless connectivity\n24-hour battery · USB-C"
  ],
  [
    "camera",
    "Frame Daylight",
    "FRAME",
    2899,
    "#c5b785",
    "Made for your everyday.",
    "Frame Daylight is a fictional camera concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "24 MP sensor\n35 mm equivalent fixed lens\n3-inch screen · USB-C"
  ],
  [
    "camera",
    "Frame Journey",
    "FRAME",
    4599,
    "#a78c87",
    "Made for your everyday.",
    "Frame Journey is a fictional camera concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "28 MP sensor\nInterchangeable lenses\n4K video · Tilting display"
  ],
  [
    "gaming",
    "Level Compact",
    "LEVEL",
    199,
    "#99b7a8",
    "Made for your everyday.",
    "Level Compact is a fictional gaming concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "Compact wireless controller\nDual analogue sticks\nUSB-C rechargeable battery"
  ],
  [
    "gaming",
    "Level Arcade",
    "LEVEL",
    329,
    "#c7a575",
    "Made for your everyday.",
    "Level Arcade is a fictional gaming concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "Wireless controller\nTextured grips · Rear buttons\nUSB-C charging"
  ],
  [
    "wearable",
    "Tempo Move",
    "TEMPO",
    599,
    "#b696ac",
    "Made for your everyday.",
    "Tempo Move is a fictional wearable concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "1.7-inch colour display\nActivity tracking\n8-day battery · Silicone strap"
  ],
  [
    "wearable",
    "Tempo Trail",
    "TEMPO",
    949,
    "#8e9c78",
    "Made for your everyday.",
    "Tempo Trail is a fictional wearable concept with a comfortable design and thoughtful everyday features. Explore its illustrative specifications and compare it with the rest of the collection.",
    "1.9-inch colour display\nOutdoor activity modes\n12-day battery · Adjustable strap"
  ]
]);

function illustration(category, color) {
  const shapes = {
    phone: `<g transform="rotate(-12 320 230)"><rect x="230" y="64" width="180" height="330" rx="31" fill="${color}" stroke="#26352f" stroke-width="5"/><rect x="240" y="74" width="160" height="310" rx="24" fill="url(#screen)"/><path d="M240 290 Q310 120 400 170 V360 Q400 384 376 384 H264 Q240 384 240 360Z" fill="${color}" opacity=".65"/><rect x="292" y="82" width="56" height="15" rx="8" fill="#26352f"/><circle cx="320" cy="345" r="5" fill="#eef2e6"/></g>`,
    computer: `<g transform="translate(0 -5)"><rect x="130" y="100" width="380" height="245" rx="14" fill="${color}" stroke="#34453e" stroke-width="4"/><rect x="142" y="112" width="356" height="220" rx="5" fill="url(#screen)"/><path d="M142 270 Q260 130 360 230 T498 190 V332 H142Z" fill="${color}" opacity=".75"/><circle cx="320" cy="106" r="2" fill="#26352f"/><path d="M130 345 H510 L566 382 Q570 393 554 395 H86 Q70 393 74 382Z" fill="${color}" stroke="#34453e" stroke-width="3"/><path d="M280 346 H360 L370 357 H270Z" fill="#59665e"/></g>`,
    headphone: `<path d="M190 270 V195 C190 32 450 32 450 195 V270" fill="none" stroke="#33443b" stroke-width="42"/><path d="M190 220 V190 C190 46 450 46 450 190 V220" fill="none" stroke="${color}" stroke-width="29"/><g transform="rotate(-10 195 285)"><rect x="157" y="215" width="90" height="148" rx="40" fill="${color}"/><rect x="213" y="224" width="29" height="131" rx="14" fill="#34413a"/></g><g transform="rotate(10 445 285)"><rect x="393" y="215" width="90" height="148" rx="40" fill="${color}"/><rect x="398" y="224" width="29" height="131" rx="14" fill="#34413a"/></g>`,
    camera: `<rect x="132" y="153" width="376" height="217" rx="26" fill="${color}" stroke="#34413a" stroke-width="4"/><path d="M230 155 L250 115 H358 L383 155" fill="${color}" stroke="#34413a" stroke-width="4"/><rect x="154" y="141" width="66" height="15" rx="5" fill="#34413a"/><rect x="150" y="188" width="56" height="161" rx="18" fill="#34413a"/><rect x="418" y="173" width="60" height="28" rx="4" fill="#dbe4db"/><circle cx="322" cy="263" r="93" fill="#283a32" stroke="#a7b5a6" stroke-width="6"/><circle cx="322" cy="263" r="72" fill="#182d2d" stroke="#4e6562" stroke-width="9"/><circle cx="322" cy="263" r="49" fill="url(#screen)"/><circle cx="305" cy="246" r="15" fill="#fff" opacity=".2"/>`,
    gaming: `<path d="M194 151 Q146 151 130 217 L99 326 Q93 372 130 379 Q154 382 198 323 H442 Q486 382 510 379 Q547 372 541 326 L510 217 Q494 151 446 151Z" fill="${color}" stroke="#34413a" stroke-width="4"/><rect x="177" y="197" width="73" height="23" rx="4" fill="#34413a"/><rect x="202" y="172" width="23" height="73" rx="4" fill="#34413a"/><circle cx="272" cy="278" r="29" fill="#34413a" stroke="#e3e8dc" stroke-width="4"/><circle cx="368" cy="278" r="29" fill="#34413a" stroke="#e3e8dc" stroke-width="4"/><g fill="#34413a"><circle cx="433" cy="183" r="11"/><circle cx="457" cy="207" r="11"/><circle cx="409" cy="207" r="11"/><circle cx="433" cy="231" r="11"/></g><circle cx="320" cy="210" r="9" fill="#e3e8dc"/>`,
    wearable: `<g transform="rotate(-12 320 230)"><rect x="266" y="28" width="108" height="407" rx="42" fill="${color}"/><rect x="232" y="132" width="176" height="210" rx="45" fill="#34413a"/><rect x="241" y="141" width="158" height="192" rx="37" fill="#152c25"/><rect x="408" y="192" width="11" height="29" rx="5" fill="#34413a"/><circle cx="320" cy="237" r="57" fill="none" stroke="${color}" stroke-width="8"/><path d="M320 197 V237 L349 251" stroke="#f1f2df" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="320" cy="237" r="5" fill="#f1f2df"/></g>`
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><defs><linearGradient id="screen" x2=".7" y2="1"><stop stop-color="#d6e7d0"/><stop offset=".5" stop-color="#7faaa0"/><stop offset="1" stop-color="#284c49"/></linearGradient></defs><ellipse cx="320" cy="420" rx="184" ry="17" fill="#26352f" opacity=".08"/>${shapes[category]}</svg>`;
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bancom';
  await mongoose.connect(uri, {useNewUrlParser:true,useUnifiedTopology:true});
  try {
    let added = 0;
    for (const [category,name,brand,price,color,tagline,description,specs] of products) {
      const id = crypto.createHash('sha256').update('bancom-demo-v1:'+name).digest('hex').slice(0,24);
      const result = await Product.updateOne({_id:id}, {$setOnInsert:{name,brand,price,catagory:category,isDemo:true,
        description:tagline+'\n\n'+description+'\n\nDemo product: this is a fictional item with illustrative specifications and pricing.',specs,
        image:[{name:name+'.svg',contentType:'image/svg+xml',data:Buffer.from(illustration(category,color)).toString('base64')}] }}, {upsert:true,runValidators:true});
      added += result.upserted ? result.upserted.length : 0;
    }
    console.log(`Seed complete: ${added} added, ${products.length-added} already present. Existing products and edits preserved.`);
  } finally { await mongoose.disconnect(); }
}
seed().catch(error => { console.error(error.message); process.exitCode=1; });
