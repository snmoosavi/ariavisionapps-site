(() => {
  "use strict";

  const STORAGE_KEYS = {
    cart: "cravecart.market.cart.v1",
    favorites: "cravecart.market.favorites.v1",
    orders: "cravecart.market.orders.v1",
    activeOrder: "cravecart.market.activeOrder.v1",
    fulfillment: "cravecart.market.fulfillment.v1",
    promo: "cravecart.market.promo.v1"
  };

  const MIN_ORDER = 1200;
  const DELIVERY_FEE = 290;
  const FREE_DELIVERY_AT = 3500;
  const SERVICE_RATE = 0.02;
  const MAX_CART_QTY = 99;
  const MENU_LOAD_MS = 420;

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  });

  const fallbackImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fff1f7"/><stop offset="1" stop-color="#ffe2bd"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="400" cy="360" r="170" fill="#fff" opacity=".82"/><path fill="#ff2f7d" d="M270 447c51 47 209 47 260 0 15-14 38 8 25 25-62 82-248 82-310 0-13-17 10-39 25-25Zm65-167c16 0 30 13 30 30s-14 30-30 30-30-13-30-30 14-30 30-30Zm130 0c16 0 30 13 30 30s-14 30-30 30-30-13-30-30 14-30 30-30Z"/></svg>'
    );

  const branches = [
    {
      id: "downtown",
      name: "Downtown Hub",
      address: "18 Central Avenue",
      delivery: "25-40 min delivery",
      pickup: "12-18 min pickup"
    },
    {
      id: "riverside",
      name: "Riverside Hub",
      address: "42 River Street",
      delivery: "30-45 min delivery",
      pickup: "10-16 min pickup"
    },
    {
      id: "uptown",
      name: "Uptown Hub",
      address: "7 Orchard Road",
      delivery: "28-42 min delivery",
      pickup: "14-20 min pickup"
    },
    {
      id: "westside",
      name: "Westside Hub",
      address: "91 Market Lane",
      delivery: "22-36 min delivery",
      pickup: "9-15 min pickup"
    }
  ];

  const categories = [
    { id: "all", name: "All items", icon: "▦" },
    { id: "popular", name: "Popular", icon: "★" },
    { id: "fried-chicken", name: "Fried Chicken", icon: "◖" },
    { id: "burgers", name: "Burgers", icon: "◉" },
    { id: "pizza", name: "Pizza", icon: "△" },
    { id: "wraps", name: "Wraps", icon: "◒" },
    { id: "sandwiches", name: "Sandwiches", icon: "▤" },
    { id: "sides", name: "Sides", icon: "+" },
    { id: "salads", name: "Salads", icon: "◇" },
    { id: "desserts", name: "Desserts", icon: "◆" },
    { id: "drinks", name: "Drinks", icon: "◍" }
  ];

  const sizePresets = {
    "fried-chicken": [
      { id: "regular", name: "Regular", delta: 0 },
      { id: "large", name: "Large", delta: 290 },
      { id: "family", name: "Family", delta: 760 }
    ],
    burgers: [
      { id: "single", name: "Single", delta: 0 },
      { id: "double", name: "Double", delta: 320 },
      { id: "meal", name: "Meal with fries and drink", delta: 490 }
    ],
    pizza: [
      { id: "medium", name: "Medium 28 cm", delta: 0 },
      { id: "large", name: "Large 33 cm", delta: 320 },
      { id: "party", name: "Party 40 cm", delta: 690 }
    ],
    wraps: [
      { id: "regular", name: "Regular", delta: 0 },
      { id: "loaded", name: "Loaded", delta: 220 },
      { id: "combo", name: "Combo with side", delta: 410 }
    ],
    sandwiches: [
      { id: "regular", name: "Regular", delta: 0 },
      { id: "loaded", name: "Loaded", delta: 240 },
      { id: "meal", name: "Meal with fries and drink", delta: 470 }
    ],
    sides: [
      { id: "regular", name: "Regular", delta: 0 },
      { id: "large", name: "Large", delta: 180 },
      { id: "share", name: "Share box", delta: 360 }
    ],
    salads: [
      { id: "regular", name: "Regular", delta: 0 },
      { id: "large", name: "Large", delta: 220 }
    ],
    desserts: [
      { id: "single", name: "Single", delta: 0 },
      { id: "double", name: "Double", delta: 240 },
      { id: "share", name: "Share box", delta: 420 }
    ],
    drinks: [
      { id: "small", name: "Small", delta: 0 },
      { id: "medium", name: "Medium", delta: 90 },
      { id: "large", name: "Large", delta: 170 }
    ]
  };

  const extraPresets = {
    "fried-chicken": [
      { id: "ranch", name: "Ranch dip", price: 80 },
      { id: "buffalo", name: "Buffalo dip", price: 90 },
      { id: "slaw", name: "Mini slaw", price: 140 },
      { id: "fries", name: "Side fries", price: 220 }
    ],
    burgers: [
      { id: "cheese", name: "Extra cheese", price: 120 },
      { id: "bacon", name: "Crispy bacon", price: 180 },
      { id: "jalapeno", name: "Jalapeno", price: 80 },
      { id: "fries", name: "Side fries", price: 220 }
    ],
    pizza: [
      { id: "mozzarella", name: "Extra mozzarella", price: 160 },
      { id: "olives", name: "Black olives", price: 110 },
      { id: "mushroom", name: "Roasted mushroom", price: 140 },
      { id: "garlic-dip", name: "Garlic dip", price: 90 }
    ],
    wraps: [
      { id: "avocado", name: "Avocado", price: 170 },
      { id: "cheese", name: "Cheese", price: 100 },
      { id: "hot-sauce", name: "Hot sauce", price: 70 },
      { id: "chips", name: "Crunchy chips", price: 160 }
    ],
    sandwiches: [
      { id: "cheese", name: "Extra cheese", price: 120 },
      { id: "pickles", name: "Pickles", price: 60 },
      { id: "onions", name: "Caramelized onions", price: 110 },
      { id: "fries", name: "Side fries", price: 220 }
    ],
    sides: [
      { id: "cheese-sauce", name: "Cheese sauce", price: 110 },
      { id: "chili", name: "Chili flakes", price: 50 },
      { id: "aioli", name: "Aioli dip", price: 90 }
    ],
    salads: [
      { id: "chicken", name: "Grilled chicken", price: 240 },
      { id: "avocado", name: "Avocado", price: 170 },
      { id: "croutons", name: "Extra croutons", price: 70 }
    ],
    desserts: [
      { id: "cream", name: "Whipped cream", price: 80 },
      { id: "berries", name: "Fresh berries", price: 160 },
      { id: "ice-cream", name: "Vanilla ice cream", price: 190 }
    ],
    drinks: [
      { id: "ice", name: "Extra ice", price: 0 },
      { id: "lemon", name: "Fresh lemon", price: 50 },
      { id: "mint", name: "Mint", price: 60 }
    ]
  };

  const categoryMeta = {
    "fried-chicken": { prep: "16-22 min", kcal: "520-980 kcal", detail: "Crispy coating" },
    burgers: { prep: "12-18 min", kcal: "540-920 kcal", detail: "Toasted bun" },
    pizza: { prep: "18-25 min", kcal: "780-1320 kcal", detail: "Hand-stretched base" },
    wraps: { prep: "9-14 min", kcal: "430-760 kcal", detail: "Fresh wrap" },
    sandwiches: { prep: "10-16 min", kcal: "460-840 kcal", detail: "Toasted bread" },
    sides: { prep: "7-12 min", kcal: "260-620 kcal", detail: "Made to share" },
    salads: { prep: "8-12 min", kcal: "280-650 kcal", detail: "Fresh greens" },
    desserts: { prep: "5-9 min", kcal: "320-720 kcal", detail: "Sweet finish" },
    drinks: { prep: "2-5 min", kcal: "0-420 kcal", detail: "Served cold" }
  };

  const products = [
    {
      id: "crispy-chicken-bucket",
      category: "fried-chicken",
      title: "Crispy Chicken Bucket",
      description: "Ten golden chicken pieces with seasoned coating, two dips and a side of slaw.",
      price: 2090,
      oldPrice: 2390,
      rating: 4.9,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1527477396000-e27163b481c2"),
      tags: ["Family favorite", "Deal"]
    },
    {
      id: "spicy-wings-box",
      category: "fried-chicken",
      title: "Spicy Wings Box",
      description: "Crisp wings tossed in a hot glaze with ranch dip and crunchy celery.",
      price: 1190,
      oldPrice: 1390,
      rating: 4.8,
      popular: true,
      spicy: true,
      vegetarian: false,
      image: img("photo-1608039829572-78524f79c4c7"),
      tags: ["Hot", "Deal"]
    },
    {
      id: "honey-garlic-tenders",
      category: "fried-chicken",
      title: "Honey Garlic Tenders",
      description: "Hand-breaded tender strips finished with sweet garlic glaze and sesame.",
      price: 990,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1626645738196-c2a7c87a8f58"),
      tags: ["Signature"]
    },
    {
      id: "popcorn-chicken-cup",
      category: "fried-chicken",
      title: "Popcorn Chicken Cup",
      description: "Bite-size crispy chicken with smoky seasoning and a creamy dip.",
      price: 650,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1562967916-eb82221dfb92"),
      tags: ["Snack"]
    },
    {
      id: "boneless-chicken-combo",
      category: "fried-chicken",
      title: "Boneless Chicken Combo",
      description: "Boneless chicken bites, fries, slaw and your choice of sauce.",
      price: 1350,
      rating: 4.8,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1567620832903-9fc6debc209f"),
      tags: ["Combo"]
    },
    {
      id: "double-smash-burger",
      category: "burgers",
      title: "Double Smash Burger",
      description: "Two seared beef patties, melted cheese, pickles and house burger sauce.",
      price: 1190,
      oldPrice: 1350,
      rating: 4.9,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1568901346375-23c9450c58cd"),
      tags: ["Top rated", "Deal"]
    },
    {
      id: "crispy-chicken-burger",
      category: "burgers",
      title: "Crispy Chicken Burger",
      description: "Crunchy chicken fillet, lettuce, pickles and pepper mayo in a toasted bun.",
      price: 980,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1606755962773-d324e0a13086"),
      tags: ["Best seller"]
    },
    {
      id: "mushroom-melt-burger",
      category: "burgers",
      title: "Mushroom Melt Burger",
      description: "Roasted mushrooms, grilled vegetable patty, smoked cheese and herb aioli.",
      price: 1090,
      rating: 4.7,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1551782450-a2132b4ba21d"),
      tags: ["Vegetarian"]
    },
    {
      id: "smoky-beef-burger",
      category: "burgers",
      title: "Smoky Beef Burger",
      description: "Beef patty, charred onions, barbecue sauce and crisp lettuce.",
      price: 1050,
      rating: 4.6,
      popular: false,
      spicy: true,
      vegetarian: false,
      image: img("photo-1571091718767-18b5b1457add"),
      tags: ["Smoky", "Spicy"]
    },
    {
      id: "vegan-garden-burger",
      category: "burgers",
      title: "Vegan Garden Burger",
      description: "Plant patty, tomato relish, crisp lettuce and dairy-free creamy sauce.",
      price: 1020,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1520072959219-c595dc870360"),
      tags: ["Plant based"]
    },
    {
      id: "kids-cheeseburger-meal",
      category: "burgers",
      title: "Kids Cheeseburger Meal",
      description: "Small cheeseburger, fries and a small drink with a mild sauce.",
      price: 790,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1550547660-d9450f859349"),
      tags: ["Kids"]
    },
    {
      id: "pepperoni-pizza",
      category: "pizza",
      title: "Pepperoni Pizza",
      description: "Tomato sauce, mozzarella and pepperoni slices on a crisp hand-stretched base.",
      price: 1390,
      oldPrice: 1590,
      rating: 4.9,
      popular: true,
      spicy: true,
      vegetarian: false,
      image: img("photo-1604382354936-07c5d9983bd3"),
      tags: ["Classic", "Deal"]
    },
    {
      id: "bbq-chicken-pizza",
      category: "pizza",
      title: "BBQ Chicken Pizza",
      description: "Barbecue chicken, mozzarella, red onion, sweet corn and smoky sauce.",
      price: 1490,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1565299624946-b28f40a0ae38"),
      tags: ["Signature"]
    },
    {
      id: "truffle-mushroom-pizza",
      category: "pizza",
      title: "Truffle Mushroom Pizza",
      description: "Roasted mushrooms, creamy white sauce, mozzarella and truffle oil.",
      price: 1450,
      rating: 4.7,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1594007654729-407eedc4be65"),
      tags: ["Vegetarian"]
    },
    {
      id: "garden-veggie-pizza",
      category: "pizza",
      title: "Garden Veggie Pizza",
      description: "Bell peppers, olives, onion, mushrooms, tomato sauce and mozzarella.",
      price: 1290,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1513104890138-7c749659a591"),
      tags: ["Vegetarian"]
    },
    {
      id: "spicy-beef-pizza",
      category: "pizza",
      title: "Spicy Beef Pizza",
      description: "Seasoned beef, hot peppers, onion, mozzarella and chili oil.",
      price: 1520,
      rating: 4.8,
      popular: false,
      spicy: true,
      vegetarian: false,
      image: img("photo-1574071318508-1cdbab80d002"),
      tags: ["Spicy"]
    },
    {
      id: "four-cheese-pizza",
      category: "pizza",
      title: "Four Cheese Pizza",
      description: "Mozzarella, cheddar, blue cheese, parmesan and a light tomato base.",
      price: 1380,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1593560708920-61dd98c46a4e"),
      tags: ["Vegetarian"]
    },
    {
      id: "seafood-pizza",
      category: "pizza",
      title: "Seafood Pizza",
      description: "Shrimp, tuna, olives, onion, mozzarella and lemon herb drizzle.",
      price: 1590,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1565299507177-b0ac66763828"),
      tags: ["New"]
    },
    {
      id: "grilled-chicken-wrap",
      category: "wraps",
      title: "Grilled Chicken Wrap",
      description: "Grilled chicken, crisp greens, tomato, cucumber and yogurt herb sauce.",
      price: 890,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1626700051175-6818013e1d4f"),
      tags: ["Fresh"]
    },
    {
      id: "falafel-crunch-wrap",
      category: "wraps",
      title: "Falafel Crunch Wrap",
      description: "Falafel, crunchy salad, pickles, tahini sauce and toasted tortilla.",
      price: 820,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1540914124281-342587941389"),
      tags: ["Vegetarian"]
    },
    {
      id: "spicy-beef-wrap",
      category: "wraps",
      title: "Spicy Beef Wrap",
      description: "Seasoned beef, lettuce, tomato, hot sauce and creamy cheese sauce.",
      price: 920,
      oldPrice: 1050,
      rating: 4.6,
      popular: false,
      spicy: true,
      vegetarian: false,
      image: img("photo-1543353071-10c8ba85a904"),
      tags: ["Deal", "Spicy"]
    },
    {
      id: "tuna-avocado-wrap",
      category: "wraps",
      title: "Tuna Avocado Wrap",
      description: "Tuna, avocado, lettuce, cucumber, sweet corn and lemon pepper mayo.",
      price: 940,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1625944525533-473f1a3d54e7"),
      tags: ["Protein"]
    },
    {
      id: "steak-melt-sandwich",
      category: "sandwiches",
      title: "Steak Melt Sandwich",
      description: "Thin-sliced steak, melted cheese, onions and pepper sauce in toasted bread.",
      price: 1180,
      oldPrice: 1320,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1528736235302-52922df5c122"),
      tags: ["Deal"]
    },
    {
      id: "club-chicken-sandwich",
      category: "sandwiches",
      title: "Club Chicken Sandwich",
      description: "Layered chicken, turkey-style slices, tomato, lettuce and house mayo.",
      price: 1020,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: false,
      image: img("photo-1553909489-cd47e0907980"),
      tags: ["Classic"]
    },
    {
      id: "hot-dog-supreme",
      category: "sandwiches",
      title: "Hot Dog Supreme",
      description: "Grilled sausage, relish, crispy onions, mustard and creamy cheese sauce.",
      price: 860,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1612392061785-95cfef2375bb"),
      tags: ["Street style"]
    },
    {
      id: "crispy-fish-sandwich",
      category: "sandwiches",
      title: "Crispy Fish Sandwich",
      description: "Crispy fish fillet, lettuce, pickles and lemon tartar sauce.",
      price: 990,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1559847844-5315695dadae"),
      tags: ["Fresh"]
    },
    {
      id: "grilled-cheese-stack",
      category: "sandwiches",
      title: "Grilled Cheese Stack",
      description: "Triple cheese toast with tomato soup dip and crisp herbs.",
      price: 760,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1528735602780-2552fd46c7af"),
      tags: ["Vegetarian"]
    },
    {
      id: "loaded-cheese-fries",
      category: "sides",
      title: "Loaded Cheese Fries",
      description: "Crisp fries with warm cheese sauce, scallions and smoky seasoning.",
      price: 620,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1541592106381-b31e9677c0e5"),
      tags: ["Popular"]
    },
    {
      id: "sweet-potato-fries",
      category: "sides",
      title: "Sweet Potato Fries",
      description: "Crisp sweet potato fries with sea salt and creamy herb dip.",
      price: 540,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1576107232684-1279f390859f"),
      tags: ["Vegetarian"]
    },
    {
      id: "onion-rings",
      category: "sides",
      title: "Onion Rings",
      description: "Thick onion rings in a golden crunchy coating with smoky dip.",
      price: 490,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1639024471283-03518883512d"),
      tags: ["Crispy"]
    },
    {
      id: "mozzarella-sticks",
      category: "sides",
      title: "Mozzarella Sticks",
      description: "Stretchy mozzarella sticks with crisp crumb and tomato dip.",
      price: 590,
      oldPrice: 690,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1531749668029-2db88e4276c7"),
      tags: ["Deal", "Vegetarian"]
    },
    {
      id: "garlic-bread",
      category: "sides",
      title: "Garlic Bread",
      description: "Toasted bread with garlic butter, parsley and parmesan.",
      price: 420,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1573140247632-f8fd74997d5c"),
      tags: ["Vegetarian"]
    },
    {
      id: "mac-cheese-cup",
      category: "sides",
      title: "Mac and Cheese Cup",
      description: "Creamy macaroni, cheddar sauce and toasted crumbs.",
      price: 560,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1543339494-b4cd4f7ba686"),
      tags: ["Comfort"]
    },
    {
      id: "loaded-nachos",
      category: "sides",
      title: "Loaded Nachos",
      description: "Tortilla chips with cheese sauce, beans, salsa, jalapeno and sour cream.",
      price: 710,
      rating: 4.7,
      popular: false,
      spicy: true,
      vegetarian: true,
      image: img("photo-1513456852971-30c0b8199d4d"),
      tags: ["Spicy", "Vegetarian"]
    },
    {
      id: "caesar-chicken-salad",
      category: "salads",
      title: "Caesar Chicken Salad",
      description: "Romaine lettuce, grilled chicken, parmesan, croutons and Caesar dressing.",
      price: 940,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: false,
      image: img("photo-1550304943-4f24f54ddde9"),
      tags: ["Fresh"]
    },
    {
      id: "avocado-garden-salad",
      category: "salads",
      title: "Avocado Garden Salad",
      description: "Avocado, mixed leaves, tomatoes, cucumber, seeds and citrus dressing.",
      price: 880,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1540420773420-3366772f4999"),
      tags: ["Vegetarian"]
    },
    {
      id: "crunchy-coleslaw-bowl",
      category: "salads",
      title: "Crunchy Coleslaw Bowl",
      description: "Cabbage, carrot, apple, herbs and creamy dressing.",
      price: 520,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1512621776951-a57141f2eefd"),
      tags: ["Vegetarian"]
    },
    {
      id: "quinoa-power-salad",
      category: "salads",
      title: "Quinoa Power Salad",
      description: "Quinoa, roasted vegetables, chickpeas, herbs and lemon dressing.",
      price: 920,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1505576399279-565b52d4ac71"),
      tags: ["Protein"]
    },
    {
      id: "chocolate-lava-cake",
      category: "desserts",
      title: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a molten center and cocoa dust.",
      price: 620,
      rating: 4.9,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1606313564200-e75d5e30476c"),
      tags: ["Sweet"]
    },
    {
      id: "strawberry-cheesecake-cup",
      category: "desserts",
      title: "Strawberry Cheesecake Cup",
      description: "Creamy cheesecake, biscuit crumb and strawberry compote.",
      price: 590,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1565958011703-44f9829ba187"),
      tags: ["Popular"]
    },
    {
      id: "cinnamon-churro-bites",
      category: "desserts",
      title: "Cinnamon Churro Bites",
      description: "Warm cinnamon bites with chocolate dip and sugar dust.",
      price: 520,
      oldPrice: 620,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1624371414361-e670edf4898d"),
      tags: ["Deal"]
    },
    {
      id: "salted-caramel-brownie",
      category: "desserts",
      title: "Salted Caramel Brownie",
      description: "Dense chocolate brownie with salted caramel and roasted nuts.",
      price: 560,
      rating: 4.7,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1578985545062-69928b1d9587"),
      tags: ["Rich"]
    },
    {
      id: "classic-cola",
      category: "drinks",
      title: "Classic Cola",
      description: "Chilled cola served in your selected size.",
      price: 290,
      rating: 4.5,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1581636625402-29b2a704ef13"),
      tags: ["Cold"]
    },
    {
      id: "orange-soda",
      category: "drinks",
      title: "Orange Soda",
      description: "Bright orange soda with a crisp sparkling finish.",
      price: 290,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1629203851122-3726ecdf080e"),
      tags: ["Cold"]
    },
    {
      id: "lemon-iced-tea",
      category: "drinks",
      title: "Lemon Iced Tea",
      description: "Chilled tea with lemon, light sweetness and fresh citrus aroma.",
      price: 330,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1556679343-c7306c1976bc"),
      tags: ["Tea"]
    },
    {
      id: "peach-iced-tea",
      category: "drinks",
      title: "Peach Iced Tea",
      description: "Cold black tea with peach flavor and a smooth finish.",
      price: 330,
      rating: 4.6,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1497534446932-c925b458314e"),
      tags: ["Tea"]
    },
    {
      id: "berry-lemonade",
      category: "drinks",
      title: "Berry Lemonade",
      description: "Sparkling lemonade with mixed berries and a tart finish.",
      price: 390,
      oldPrice: 460,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1551024709-8f23befc6f87"),
      tags: ["Deal", "Cold"]
    },
    {
      id: "mint-lime-cooler",
      category: "drinks",
      title: "Mint Lime Cooler",
      description: "Lime soda with fresh mint, crushed ice and a clean finish.",
      price: 410,
      rating: 4.7,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1513558161293-cdaf765ed2fd"),
      tags: ["Fresh"]
    },
    {
      id: "mango-smoothie",
      category: "drinks",
      title: "Mango Smoothie",
      description: "Creamy mango smoothie blended with yogurt and ice.",
      price: 520,
      rating: 4.7,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1505252585461-04db1eb84625"),
      tags: ["Smoothie"]
    },
    {
      id: "strawberry-shake",
      category: "drinks",
      title: "Strawberry Shake",
      description: "Creamy strawberry shake with whipped topping.",
      price: 540,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1572490122747-3968b75cc699"),
      tags: ["Shake"]
    },
    {
      id: "vanilla-shake",
      category: "drinks",
      title: "Vanilla Shake",
      description: "Classic vanilla shake blended thick and served cold.",
      price: 520,
      rating: 4.6,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1568901839119-631418a3910d"),
      tags: ["Shake"]
    },
    {
      id: "iced-coffee",
      category: "drinks",
      title: "Iced Coffee",
      description: "Cold coffee with milk, ice and balanced sweetness.",
      price: 460,
      rating: 4.5,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1517701604599-bb29b565090c"),
      tags: ["Coffee"]
    },
    {
      id: "sparkling-water",
      category: "drinks",
      title: "Sparkling Water",
      description: "Refreshing sparkling mineral water.",
      price: 250,
      rating: 4.3,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1523362628745-0c100150b504"),
      tags: ["Water"]
    },
    {
      id: "still-water",
      category: "drinks",
      title: "Still Water",
      description: "Chilled still mineral water.",
      price: 220,
      rating: 4.3,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1502741224143-90386d7f8c82"),
      tags: ["Water"]
    },
    {
      id: "energy-drink",
      category: "drinks",
      title: "Energy Drink",
      description: "Chilled sparkling energy drink for a quick boost.",
      price: 420,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1622543925917-763c34d1a86e"),
      tags: ["Cold"]
    },
    {
      id: "fresh-orange-juice",
      category: "drinks",
      title: "Fresh Orange Juice",
      description: "Pressed orange juice served chilled.",
      price: 480,
      rating: 4.7,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1600271886742-f049cd451bba"),
      tags: ["Fresh"]
    },
    {
      id: "coconut-water",
      category: "drinks",
      title: "Coconut Water",
      description: "Naturally refreshing coconut water served cold.",
      price: 390,
      rating: 4.4,
      popular: false,
      spicy: false,
      vegetarian: true,
      image: img("photo-1574692866862-91ce7652454f"),
      tags: ["Cold"]
    },
    {
      id: "raspberry-soda-float",
      category: "drinks",
      title: "Raspberry Soda Float",
      description: "Raspberry soda with a scoop of vanilla ice cream.",
      price: 560,
      rating: 4.8,
      popular: true,
      spicy: false,
      vegetarian: true,
      image: img("photo-1544145945-f90425340c7e"),
      tags: ["Sweet", "Cold"]
    }
  ];

  const promoRules = {
    WELCOME15: {
      label: "WELCOME15",
      min: 1500,
      type: "percent",
      value: 0.15,
      cap: 800,
      description: "15% off orders over EUR 15"
    },
    FEAST5: {
      label: "FEAST5",
      min: 3500,
      type: "fixed",
      value: 500,
      description: "EUR 5 off orders over EUR 35"
    },
    PICKUP10: {
      label: "PICKUP10",
      min: 1500,
      type: "percent",
      value: 0.1,
      fulfillment: "pickup",
      cap: 600,
      description: "10% off pickup orders"
    },
    DRINKS10: {
      label: "DRINKS10",
      min: 1000,
      type: "category-percent",
      category: "drinks",
      value: 0.1,
      cap: 400,
      description: "10% off drinks"
    }
  };

  const trackingSteps = {
    delivery: ["Order received", "Confirmed", "Preparing", "Out for delivery", "Delivered"],
    pickup: ["Order received", "Confirmed", "Preparing", "Ready for pickup", "Picked up"]
  };

  const state = {
    loading: true,
    error: "",
    products: [],
    activeCategory: "all",
    activeFilter: "all",
    activeSort: "recommended",
    search: "",
    cart: [],
    favorites: new Set(),
    orders: [],
    activeOrder: null,
    promoCode: "",
    fulfillment: "delivery",
    modal: null,
    checkoutBusy: false
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    hydrateState();
    seedCheckoutControls();
    bindEvents();
    syncCartPlacement();
    renderAll();
    loadMenu();
  }

  function cacheElements() {
    els.header = document.querySelector("[data-header]");
    els.globalSearch = document.querySelector("#globalSearch");
    els.mobileSearch = document.querySelector("#mobileSearch");
    els.categoryList = document.querySelector("[data-category-list]");
    els.filterButtons = Array.from(document.querySelectorAll("[data-filter-mode]"));
    els.loadingState = document.querySelector("[data-loading-state]");
    els.errorState = document.querySelector("[data-error-state]");
    els.emptyState = document.querySelector("[data-empty-state]");
    els.menuSections = document.querySelector("[data-menu-sections]");
    els.menuTitle = document.querySelector("#menu-title");
    els.menuSummary = document.querySelector("[data-menu-summary]");
    els.sortSelect = document.querySelector("[data-sort-select]");
    els.cartSidebar = document.querySelector(".cart-sidebar");
    els.cartCard = document.querySelector(".cart-card");
    els.cartProgress = document.querySelector("[data-cart-progress]");
    els.cartItems = document.querySelector("[data-cart-items]");
    els.cartUpsell = document.querySelector("[data-cart-upsell]");
    els.clearCartButtons = Array.from(document.querySelectorAll("[data-clear-cart]"));
    els.cartCounts = Array.from(document.querySelectorAll("[data-cart-count]"));
    els.floatingTotal = document.querySelector("[data-floating-total]");
    els.promoInput = document.querySelector("#promoCode");
    els.promoButton = document.querySelector("[data-apply-promo]");
    els.promoMessage = document.querySelector("[data-promo-message]");
    els.totals = document.querySelector("[data-totals]");
    els.checkoutForm = document.querySelector("[data-checkout-form]");
    els.branchNote = document.querySelector("[data-branch-note]");
    els.addressRow = document.querySelector("[data-address-row]");
    els.contactlessRow = document.querySelector("[data-contactless-row]");
    els.scheduledFields = document.querySelector("[data-scheduled-fields]");
    els.cardFields = document.querySelector("[data-card-fields]");
    els.formErrors = document.querySelector("[data-form-errors]");
    els.submitText = document.querySelector("[data-submit-text]");
    els.submitLoader = document.querySelector("[data-submit-loader]");
    els.trackingCard = document.querySelector("[data-tracking-card]");
    els.drawerBackdrop = document.querySelector("[data-drawer-backdrop]");
    els.mobileCart = document.querySelector("[data-mobile-cart]");
    els.mobileCartContent = document.querySelector("[data-mobile-cart-content]");
    els.productBackdrop = document.querySelector("[data-product-backdrop]");
    els.productModal = document.querySelector("[data-product-modal]");
    els.productModalBody = document.querySelector("[data-product-modal-body]");
    els.ordersPanel = document.querySelector("[data-orders-panel]");
    els.historyList = document.querySelector("[data-history-list]");
    els.toastRegion = document.querySelector("[data-toast-region]");
  }

  function hydrateState() {
    state.cart = sanitizeCart(readJson(STORAGE_KEYS.cart, []));
    state.favorites = new Set(readJson(STORAGE_KEYS.favorites, []));
    state.orders = sanitizeOrders(readJson(STORAGE_KEYS.orders, []));
    state.activeOrder = readJson(STORAGE_KEYS.activeOrder, null);
    state.promoCode = readText(STORAGE_KEYS.promo, "");
    state.fulfillment = readText(STORAGE_KEYS.fulfillment, "delivery");

    if (!["delivery", "pickup"].includes(state.fulfillment)) {
      state.fulfillment = "delivery";
    }

    if (state.activeOrder && !state.orders.some((order) => order.id === state.activeOrder.id)) {
      state.orders.unshift(state.activeOrder);
      writeJson(STORAGE_KEYS.orders, state.orders);
    }
  }

  function seedCheckoutControls() {
    const form = els.checkoutForm;
    if (!form) return;

    const branchSelect = form.elements.branch;
    branchSelect.innerHTML = branches
      .map((branch) => `<option value="${branch.id}">${escapeHtml(branch.name)}</option>`)
      .join("");

    const dateInput = form.elements.date;
    if (dateInput) {
      dateInput.min = isoDate(new Date());
      dateInput.value = isoDate(new Date());
    }

    const timeSelect = form.elements.time;
    if (timeSelect) {
      timeSelect.innerHTML = createTimeSlots()
        .map((slot) => `<option value="${slot}">${slot}</option>`)
        .join("");
    }

    setRadioValue("fulfillment", state.fulfillment);
    updateFulfillmentFields();
    updateScheduleFields();
    updatePaymentFields();
  }

  function bindEvents() {
    window.addEventListener("scroll", () => {
      els.header?.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });

    window.addEventListener("resize", debounce(syncCartPlacement, 120));

    els.globalSearch?.addEventListener("input", (event) => setSearch(event.target.value, "global"));
    els.mobileSearch?.addEventListener("input", (event) => setSearch(event.target.value, "mobile"));
    els.sortSelect?.addEventListener("change", (event) => {
      state.activeSort = event.target.value || "recommended";
      renderMenu();
    });
    els.promoButton?.addEventListener("click", () => applyPromo(false));
    els.promoInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyPromo(false);
      }
    });

    els.checkoutForm?.addEventListener("submit", handleCheckoutSubmit);

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("change", handleDocumentChange);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeProductModal();
        closeCartDrawer();
        closeHistoryPanel();
      }
    });

    document.addEventListener("error", (event) => {
      if (event.target instanceof HTMLImageElement) {
        event.target.src = fallbackImage;
      }
    }, true);
  }

  function loadMenu() {
    state.loading = true;
    state.error = "";
    renderMenu();

    window.setTimeout(() => {
      try {
        if (!products.length) {
          throw new Error("Menu list is empty.");
        }
        state.products = products.slice();
        state.loading = false;
        state.error = "";
      } catch (error) {
        state.products = [];
        state.loading = false;
        state.error = error.message || "Menu could not be loaded.";
      }
      renderAll();
      scrollToHash();
    }, MENU_LOAD_MS);
  }

  function renderAll() {
    renderFilters();
    renderCategories();
    renderMenu();
    renderCart();
    renderTracking();
    renderHistory();
  }

  function renderFilters() {
    els.filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filterMode === state.activeFilter);
    });
    if (els.sortSelect && els.sortSelect.value !== state.activeSort) {
      els.sortSelect.value = state.activeSort;
    }
  }

  function renderCategories() {
    if (!els.categoryList) return;

    const counts = getCategoryCounts();
    els.categoryList.innerHTML = categories
      .map((category) => {
        const count = counts.get(category.id) || 0;
        const active = category.id === state.activeCategory ? " is-active" : "";
        return `
          <button class="category-link${active}" type="button" data-category="${category.id}" aria-pressed="${category.id === state.activeCategory}">
            <span><span class="category-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>${escapeHtml(category.name)}</span>
            <small>${count}</small>
          </button>
        `;
      })
      .join("");
  }

  function renderMenu() {
    if (!els.menuSections) return;

    const isLoading = state.loading;
    const hasError = Boolean(state.error);
    els.loadingState.hidden = !isLoading;
    els.errorState.hidden = !hasError || isLoading;
    els.menuSections.hidden = isLoading || hasError;

    if (isLoading || hasError) {
      els.emptyState.hidden = true;
      return;
    }

    const filtered = getVisibleProducts();
    const sections = groupProducts(filtered);
    els.emptyState.hidden = filtered.length > 0;
    els.menuSections.hidden = filtered.length === 0;
    els.menuTitle.textContent = getMenuTitle(filtered.length);
    if (els.menuSummary) {
      els.menuSummary.textContent = getMenuSummary(filtered.length);
    }

    if (!filtered.length) {
      els.menuSections.innerHTML = "";
      return;
    }

    els.menuSections.innerHTML = sections
      .map((section) => `
        <section class="menu-section" id="category-${section.id}" data-section-category="${section.id}">
          <div class="section-title">
            <h3>${escapeHtml(section.name)}</h3>
            <span>${section.items.length} ${plural(section.items.length, "item", "items")}</span>
          </div>
          <div class="menu-items">
            ${section.items.map(renderMenuItem).join("")}
          </div>
        </section>
      `)
      .join("");
  }

  function renderMenuItem(product) {
    const isFavorite = state.favorites.has(product.id);
    const tags = buildTags(product).slice(0, 4);
    const discount = getDiscountPercent(product);
    const cartQuantity = getProductCartQuantity(product.id);
    const meta = getProductMeta(product);

    return `
      <article class="menu-item${cartQuantity ? " is-in-cart" : ""}" data-product-id="${product.id}">
        <div class="item-copy">
          <div class="item-topline">
            <h4 class="item-title">${escapeHtml(product.title)}</h4>
            <span class="rating" aria-label="Rating ${product.rating} out of 5">${product.rating.toFixed(1)}</span>
          </div>
          <p class="item-description">${escapeHtml(product.description)}</p>
          <div class="item-meta" aria-label="Item details">
            <span>${escapeHtml(meta.prep)}</span>
            <span>${escapeHtml(meta.kcal)}</span>
            <span>${escapeHtml(meta.detail)}</span>
          </div>
          <div class="item-tags">
            ${tags.map((tag) => `<span class="tag${tag.kind === "deal" ? " deal" : ""}">${escapeHtml(tag.label)}</span>`).join("")}
          </div>
          <div class="price-row">
            <span class="current-price">${money(product.price)}</span>
            ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
          </div>
          <div class="item-actions">
            <button class="detail-button" type="button" data-open-product="${product.id}">Details</button>
            <button class="add-button" type="button" data-quick-add="${product.id}">Add</button>
          </div>
        </div>
        <div class="item-media">
          <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy" decoding="async">
          ${discount ? `<span class="discount-badge">${discount}% off</span>` : ""}
          ${cartQuantity ? `<span class="in-cart-badge">${cartQuantity} in basket</span>` : ""}
          <button class="favorite-button${isFavorite ? " is-active" : ""}" type="button" data-toggle-favorite="${product.id}" aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}" aria-pressed="${isFavorite}">
            ${isFavorite ? "♥" : "♡"}
          </button>
        </div>
      </article>
    `;
  }

  function renderCart() {
    if (!els.cartItems) return;

    const totals = calculateTotals();
    const count = getCartCount();
    syncPromoInput();
    renderPromoMessage(totals);
    renderCartProgress(totals);
    renderCartUpsell();
    updateCheckoutState(totals);

    els.cartItems.innerHTML = state.cart.length
      ? state.cart.map(renderCartLine).join("")
      : '<div class="empty-inline">Your basket is empty. Add items from the menu to start an order.</div>';

    els.totals.innerHTML = `
      <div><dt>Subtotal</dt><dd>${money(totals.subtotal)}</dd></div>
      <div><dt>Delivery</dt><dd>${totals.deliveryFee === 0 ? "Free" : money(totals.deliveryFee)}</dd></div>
      <div><dt>Service fee</dt><dd>${money(totals.serviceFee)}</dd></div>
      ${totals.discount > 0 ? `<div><dt>Promo ${escapeHtml(totals.promoCode)}</dt><dd>-${money(totals.discount)}</dd></div>` : ""}
      <div class="total"><dt>Total</dt><dd>${money(totals.total)}</dd></div>
    `;

    els.cartCounts.forEach((node) => {
      node.textContent = String(count);
      node.setAttribute("aria-label", `${count} ${plural(count, "item", "items")} in cart`);
    });

    if (els.floatingTotal) {
      els.floatingTotal.textContent = count
        ? `${count} ${plural(count, "item", "items")} - ${money(totals.total)}`
        : "Your cart is empty";
    }

    els.clearCartButtons.forEach((button) => {
      button.disabled = count === 0;
      button.setAttribute("aria-disabled", String(count === 0));
    });
  }

  function renderCartProgress(totals) {
    if (!els.cartProgress) return;

    if (!state.cart.length) {
      els.cartProgress.innerHTML = `
        <strong>Build your basket</strong>
        <small>Add ${money(MIN_ORDER)} before fees to place an order.</small>
        <span class="progress-track" aria-hidden="true"><span class="progress-fill" style="--progress: 0%"></span></span>
      `;
      return;
    }

    const minimumRemaining = Math.max(0, MIN_ORDER - totals.subtotal);
    const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_AT - totals.subtotal);
    const target = minimumRemaining > 0 ? MIN_ORDER : FREE_DELIVERY_AT;
    const progress = clamp(Math.round((totals.subtotal / target) * 100), 0, 100);
    const title = minimumRemaining > 0
      ? `${money(minimumRemaining)} more to checkout`
      : freeDeliveryRemaining > 0
        ? `${money(freeDeliveryRemaining)} more for free delivery`
        : "Free delivery unlocked";
    const hint = minimumRemaining > 0
      ? "Minimum basket is calculated before fees."
      : freeDeliveryRemaining > 0
        ? "Add one more side or drink to reduce delivery cost."
        : "Your order qualifies for free delivery.";

    els.cartProgress.innerHTML = `
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(hint)}</small>
      <span class="progress-track" aria-hidden="true"><span class="progress-fill" style="--progress: ${progress}%"></span></span>
    `;
  }

  function renderCartUpsell() {
    if (!els.cartUpsell) return;

    const suggestions = getCartSuggestions();
    if (!suggestions.length) {
      els.cartUpsell.innerHTML = "";
      return;
    }

    els.cartUpsell.innerHTML = suggestions
      .map((product) => `
        <article class="upsell-card">
          <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy" decoding="async">
          <div>
            <strong>${escapeHtml(product.title)}</strong>
            <small>${money(product.price)} - ${escapeHtml(categoryName(product.category))}</small>
          </div>
          <button type="button" data-upsell-add="${product.id}" aria-label="Add ${escapeHtml(product.title)}">Add</button>
        </article>
      `)
      .join("");
  }

  function renderCartLine(line) {
    const product = getProduct(line.productId);
    if (!product) return "";

    const unit = getLineUnitPrice(line);
    const size = getSelectedSize(product, line.sizeId);
    const extras = getSelectedExtras(product, line.extraIds);
    const extrasText = extras.length ? `, ${extras.map((extra) => extra.name).join(", ")}` : "";

    return `
      <article class="cart-line" data-line-id="${escapeHtml(line.lineId)}">
        <div>
          <strong>${escapeHtml(product.title)}</strong>
          <small>${escapeHtml(size.name)}${escapeHtml(extrasText)}</small>
          <small>${money(unit)} each</small>
          <footer>
            <span class="qty-control" aria-label="Quantity for ${escapeHtml(product.title)}">
              <button type="button" data-cart-decrease="${escapeHtml(line.lineId)}" aria-label="Decrease quantity">-</button>
              <span>${line.quantity}</span>
              <button type="button" data-cart-increase="${escapeHtml(line.lineId)}" aria-label="Increase quantity">+</button>
            </span>
            <button class="remove-button" type="button" data-cart-remove="${escapeHtml(line.lineId)}">Remove</button>
          </footer>
        </div>
        <strong>${money(unit * line.quantity)}</strong>
      </article>
    `;
  }

  function renderProductModal() {
    if (!state.modal || !els.productModalBody) return;

    const product = getProduct(state.modal.productId);
    if (!product) {
      closeProductModal();
      return;
    }

    const sizes = getSizeOptions(product);
    const extras = getExtraOptions(product);
    const selectedSize = getSelectedSize(product, state.modal.sizeId);
    const selectedExtras = extras.filter((extra) => state.modal.extraIds.has(extra.id));
    const unit = product.price + selectedSize.delta + selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const total = unit * state.modal.quantity;
    const isFavorite = state.favorites.has(product.id);
    const meta = getProductMeta(product);

    els.productModalBody.innerHTML = `
      <div class="modal-content">
        <div class="modal-image">
          <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="eager" decoding="async">
        </div>
        <div class="modal-copy">
          <header>
            <div>
              <span class="rating">${product.rating.toFixed(1)} rating</span>
              <h2 id="product-title">${escapeHtml(product.title)}</h2>
            </div>
            <button class="text-button" type="button" data-toggle-favorite="${product.id}" aria-pressed="${isFavorite}">
              ${isFavorite ? "Saved" : "Save"}
            </button>
          </header>
          <p>${escapeHtml(product.description)}</p>
          <div class="modal-quick-facts" aria-label="Product facts">
            <span><strong>${escapeHtml(meta.prep)}</strong> prep</span>
            <span><strong>${escapeHtml(meta.kcal)}</strong></span>
            <span><strong>${money(product.price)}</strong> base</span>
            <span><strong>${extras.length}</strong> extras</span>
          </div>
          <div class="item-tags">
            ${buildTags(product).map((tag) => `<span class="tag${tag.kind === "deal" ? " deal" : ""}">${escapeHtml(tag.label)}</span>`).join("")}
          </div>
          <div class="option-group">
            <strong>Size</strong>
            <div class="option-list">
              ${sizes.map((size) => `
                <button class="option-button${size.id === selectedSize.id ? " is-selected" : ""}" type="button" data-modal-size="${size.id}">
                  ${escapeHtml(size.name)} ${size.delta ? `+${money(size.delta)}` : ""}
                </button>
              `).join("")}
            </div>
          </div>
          <div class="option-group">
            <strong>Toppings and extras</strong>
            <div class="option-list">
              ${extras.map((extra) => `
                <label class="extra-option">
                  <input type="checkbox" data-modal-extra="${extra.id}" ${state.modal.extraIds.has(extra.id) ? "checked" : ""}>
                  <span>${escapeHtml(extra.name)} ${extra.price ? `+${money(extra.price)}` : ""}</span>
                </label>
              `).join("")}
            </div>
          </div>
          <footer class="modal-footer">
            <div class="modal-total">
              <span>Total</span>
              <strong>${money(total)}</strong>
            </div>
            <div class="modal-actions">
              <span class="qty-control" aria-label="Selected quantity">
                <button type="button" data-modal-qty="-1" aria-label="Decrease quantity">-</button>
                <span>${state.modal.quantity}</span>
                <button type="button" data-modal-qty="1" aria-label="Increase quantity">+</button>
              </span>
              <button class="add-button" type="button" data-add-modal>Add ${state.modal.quantity} to basket</button>
            </div>
          </footer>
        </div>
      </div>
    `;
  }

  function renderTracking() {
    if (!els.trackingCard) return;

    const order = state.activeOrder;
    if (!order) {
      els.trackingCard.innerHTML = `
        <div class="empty-inline">
          No active order yet. Place an order to see live tracking.
        </div>
        <div class="tracking-actions">
          <button type="button" data-open-history>View saved orders</button>
        </div>
      `;
      return;
    }

    const steps = trackingSteps[order.fulfillment] || trackingSteps.delivery;
    const statusIndex = clamp(order.statusIndex || 0, 0, steps.length - 1);
    const branch = branches.find((item) => item.id === order.branch);

    els.trackingCard.innerHTML = `
      <h3>Order ${escapeHtml(order.id)}</h3>
      <p>${escapeHtml(order.fulfillment === "pickup" ? "Pickup" : "Delivery")} from ${escapeHtml(branch?.name || "Selected branch")} - ${escapeHtml(order.scheduleLabel)}</p>
      <p>${order.itemCount} ${plural(order.itemCount, "item", "items")} - ${money(order.total)}</p>
      <div class="tracking-steps">
        ${steps.map((step, index) => {
          const stateClass = index < statusIndex ? " is-complete" : index === statusIndex ? " is-active" : "";
          return `<div class="tracking-step${stateClass}"><strong>${escapeHtml(step)}</strong></div>`;
        }).join("")}
      </div>
      <div class="tracking-actions">
        ${statusIndex < steps.length - 1 ? '<button type="button" data-advance-order>Advance status</button>' : ""}
        <button type="button" data-reorder="${escapeHtml(order.id)}">Order again</button>
        <button type="button" data-open-history>Order history</button>
      </div>
    `;
  }

  function renderHistory() {
    if (!els.historyList) return;

    if (!state.orders.length) {
      els.historyList.innerHTML = '<div class="empty-inline">No saved orders yet. Completed orders will appear here.</div>';
      return;
    }

    els.historyList.innerHTML = state.orders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((order) => `
        <article class="history-line">
          <div>
            <strong>${escapeHtml(order.id)} - ${money(order.total)}</strong>
            <p>${formatDateTime(order.createdAt)} - ${order.itemCount} ${plural(order.itemCount, "item", "items")} - ${escapeHtml(order.fulfillment)}</p>
          </div>
          <div>
            <button type="button" data-track-order="${escapeHtml(order.id)}">Track</button>
            <button type="button" data-reorder="${escapeHtml(order.id)}">Reorder</button>
          </div>
        </article>
      `)
      .join("");
  }

  function updateCheckoutState(totals) {
    const form = els.checkoutForm;
    if (!form) return;

    const isEmpty = state.cart.length === 0;
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = isEmpty || state.checkoutBusy;
    }

    if (els.submitText) {
      if (state.checkoutBusy) {
        els.submitText.textContent = "Processing payment";
      } else if (isEmpty) {
        els.submitText.textContent = "Add items to checkout";
      } else if (totals.subtotal < MIN_ORDER) {
        els.submitText.textContent = `Add ${money(MIN_ORDER - totals.subtotal)} more`;
      } else {
        els.submitText.textContent = "Place order";
      }
    }
    if (els.submitLoader) {
      els.submitLoader.hidden = !state.checkoutBusy;
    }
  }

  function handleDocumentClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const scrollButton = target.closest("[data-scroll-target]");
    if (scrollButton) {
      event.preventDefault();
      const selector = scrollButton.dataset.scrollTarget;
      scrollToSelector(selector);
      return;
    }

    const categoryButton = target.closest("[data-category]");
    if (categoryButton) {
      state.activeCategory = categoryButton.dataset.category || "all";
      renderCategories();
      renderMenu();
      scrollMenuIntoView();
      return;
    }

    const filterButton = target.closest("[data-filter-mode]");
    if (filterButton) {
      state.activeFilter = filterButton.dataset.filterMode || "all";
      renderFilters();
      renderCategories();
      renderMenu();
      return;
    }

    const openProductButton = target.closest("[data-open-product]");
    if (openProductButton) {
      openProductModal(openProductButton.dataset.openProduct);
      return;
    }

    const quickAddButton = target.closest("[data-quick-add]");
    if (quickAddButton) {
      quickAddProduct(quickAddButton.dataset.quickAdd);
      return;
    }

    const upsellButton = target.closest("[data-upsell-add]");
    if (upsellButton) {
      quickAddProduct(upsellButton.dataset.upsellAdd);
      return;
    }

    const favoriteButton = target.closest("[data-toggle-favorite]");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.toggleFavorite);
      return;
    }

    const openCartButton = target.closest("[data-open-cart]");
    if (openCartButton) {
      event.preventDefault();
      openCart();
      return;
    }

    if (target.closest("[data-close-cart]") || target === els.drawerBackdrop) {
      closeCartDrawer();
      return;
    }

    if (target.closest("[data-close-product]") || target === els.productBackdrop) {
      closeProductModal();
      closeHistoryPanel();
      return;
    }

    if (target.closest("[data-open-history]")) {
      openHistoryPanel();
      return;
    }

    if (target.closest("[data-close-history]")) {
      closeHistoryPanel();
      return;
    }

    if (target.closest("[data-clear-search]")) {
      setSearch("", "clear");
      state.activeFilter = "all";
      state.activeCategory = "all";
      renderAll();
      return;
    }

    if (target.closest("[data-retry-menu]")) {
      loadMenu();
      return;
    }

    if (target.closest("[data-clear-cart]")) {
      clearCart();
      return;
    }

    const promoShortcut = target.closest("[data-promo-code]");
    if (promoShortcut) {
      state.promoCode = promoShortcut.dataset.promoCode || "";
      if (els.promoInput) {
        els.promoInput.value = state.promoCode;
      }
      applyPromo(false);
      return;
    }

    const increaseButton = target.closest("[data-cart-increase]");
    if (increaseButton) {
      changeCartQuantity(increaseButton.dataset.cartIncrease, 1);
      return;
    }

    const decreaseButton = target.closest("[data-cart-decrease]");
    if (decreaseButton) {
      changeCartQuantity(decreaseButton.dataset.cartDecrease, -1);
      return;
    }

    const removeButton = target.closest("[data-cart-remove]");
    if (removeButton) {
      removeCartLine(removeButton.dataset.cartRemove);
      return;
    }

    const modalSizeButton = target.closest("[data-modal-size]");
    if (modalSizeButton && state.modal) {
      state.modal.sizeId = modalSizeButton.dataset.modalSize;
      renderProductModal();
      return;
    }

    const modalQtyButton = target.closest("[data-modal-qty]");
    if (modalQtyButton && state.modal) {
      state.modal.quantity = clamp(state.modal.quantity + Number(modalQtyButton.dataset.modalQty), 1, MAX_CART_QTY);
      renderProductModal();
      return;
    }

    if (target.closest("[data-add-modal]") && state.modal) {
      addConfiguredProduct(
        state.modal.productId,
        state.modal.sizeId,
        Array.from(state.modal.extraIds),
        state.modal.quantity
      );
      closeProductModal();
      openCartAfterAdd();
      return;
    }

    if (target.closest("[data-advance-order]")) {
      advanceActiveOrder();
      return;
    }

    const trackButton = target.closest("[data-track-order]");
    if (trackButton) {
      trackOrder(trackButton.dataset.trackOrder);
      return;
    }

    const reorderButton = target.closest("[data-reorder]");
    if (reorderButton) {
      reorder(reorderButton.dataset.reorder);
    }
  }

  function handleDocumentChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

    if (target.matches("input[name='fulfillment']")) {
      state.fulfillment = target.value === "pickup" ? "pickup" : "delivery";
      writeText(STORAGE_KEYS.fulfillment, state.fulfillment);
      updateFulfillmentFields();
      renderCart();
      return;
    }

    if (target.matches("input[name='scheduleMode']")) {
      updateScheduleFields();
      return;
    }

    if (target.matches("select[name='branch']")) {
      updateBranchNote();
      return;
    }

    if (target.matches("select[name='payment']")) {
      updatePaymentFields();
      return;
    }

    if (target.matches("[data-modal-extra]") && state.modal) {
      if (target.checked) {
        state.modal.extraIds.add(target.dataset.modalExtra);
      } else {
        state.modal.extraIds.delete(target.dataset.modalExtra);
      }
      renderProductModal();
    }
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (state.checkoutBusy) return;

    const totals = calculateTotals();
    const errors = validateCheckout(totals);
    showFormErrors(errors);
    if (errors.length) return;

    state.checkoutBusy = true;
    renderCart();

    await wait(850);

    const form = els.checkoutForm;
    const formData = new FormData(form);
    const order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      statusIndex: 0,
      items: cloneCart(state.cart),
      itemCount: getCartCount(),
      subtotal: totals.subtotal,
      discount: totals.discount,
      deliveryFee: totals.deliveryFee,
      serviceFee: totals.serviceFee,
      total: totals.total,
      promoCode: totals.promoCode,
      fulfillment: state.fulfillment,
      branch: String(formData.get("branch") || branches[0].id),
      address: state.fulfillment === "delivery" ? String(formData.get("address") || "").trim() : "",
      scheduleLabel: buildScheduleLabel(formData),
      customer: {
        fullName: String(formData.get("fullName") || "").trim(),
        phone: String(formData.get("phone") || "").trim()
      },
      note: String(formData.get("instructions") || "").trim(),
      contactless: state.fulfillment === "delivery" && formData.get("contactless") === "on",
      payment: String(formData.get("payment") || "card") === "cash" ? "Pay on delivery" : "Card payment"
    };

    state.orders.unshift(order);
    state.orders = state.orders.slice(0, 20);
    state.activeOrder = order;
    state.cart = [];
    state.promoCode = "";
    state.checkoutBusy = false;
    form.reset();
    seedCheckoutControls();
    persistOrders();
    persistCart();
    writeText(STORAGE_KEYS.promo, "");
    showFormErrors([]);
    renderAll();
    closeCartDrawer();
    showToast(`Order ${order.id} placed. Tracking is ready.`);
    document.querySelector("#tracking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setSearch(value, source) {
    state.search = String(value || "").trim();
    if (source !== "global" && els.globalSearch) els.globalSearch.value = state.search;
    if (source !== "mobile" && els.mobileSearch) els.mobileSearch.value = state.search;
    if (state.search) state.activeCategory = "all";
    renderCategories();
    renderMenu();
  }

  function openProductModal(productId) {
    const product = getProduct(productId);
    if (!product) return;

    state.modal = {
      productId: product.id,
      sizeId: getSizeOptions(product)[0].id,
      extraIds: new Set(),
      quantity: 1
    };

    renderProductModal();
    els.productBackdrop.hidden = false;
    els.productModal.classList.add("is-open");
    els.productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    els.productModal.querySelector("[data-close-product]")?.focus({ preventScroll: true });
  }

  function closeProductModal() {
    if (!els.productModal) return;
    state.modal = null;
    els.productModal.classList.remove("is-open");
    els.productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (!document.body.classList.contains("history-open")) {
      els.productBackdrop.hidden = true;
    }
  }

  function openHistoryPanel() {
    closeProductModal();
    els.productBackdrop.hidden = false;
    els.ordersPanel.classList.add("is-open");
    els.ordersPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("history-open");
    renderHistory();
  }

  function closeHistoryPanel() {
    if (!els.ordersPanel) return;
    els.ordersPanel.classList.remove("is-open");
    els.ordersPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("history-open");
    if (!document.body.classList.contains("modal-open")) {
      els.productBackdrop.hidden = true;
    }
  }

  function openCart() {
    syncCartPlacement();
    if (isDrawerLayout()) {
      els.drawerBackdrop.hidden = false;
      els.mobileCart.classList.add("is-open");
      els.mobileCart.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");
      els.mobileCart.querySelector("[data-close-cart]")?.focus({ preventScroll: true });
      return;
    }

    closeCartDrawer();
    els.cartSidebar?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeCartDrawer() {
    if (!els.mobileCart) return;
    els.mobileCart.classList.remove("is-open");
    els.mobileCart.setAttribute("aria-hidden", "true");
    els.drawerBackdrop.hidden = true;
    document.body.classList.remove("drawer-open");
  }

  function syncCartPlacement() {
    if (!els.cartCard || !els.mobileCartContent || !els.cartSidebar) return;

    if (isDrawerLayout()) {
      if (!els.mobileCartContent.contains(els.cartCard)) {
        els.mobileCartContent.append(els.cartCard);
      }
    } else {
      if (!els.cartSidebar.contains(els.cartCard)) {
        els.cartSidebar.append(els.cartCard);
      }
      closeCartDrawer();
    }
  }

  function isDrawerLayout() {
    return window.matchMedia("(max-width: 1120px)").matches;
  }

  function openCartAfterAdd() {
    if (isDrawerLayout()) {
      openCart();
    }
  }

  function quickAddProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    addConfiguredProduct(product.id, getSizeOptions(product)[0].id, [], 1);
    openCartAfterAdd();
  }

  function addConfiguredProduct(productId, sizeId, extraIds, quantity) {
    const product = getProduct(productId);
    if (!product) return;

    const size = getSelectedSize(product, sizeId);
    const cleanExtraIds = getSelectedExtras(product, extraIds).map((extra) => extra.id).sort();
    const lineId = createLineId(product.id, size.id, cleanExtraIds);
    const existing = state.cart.find((line) => line.lineId === lineId);
    if (existing) {
      existing.quantity = clamp(existing.quantity + quantity, 1, MAX_CART_QTY);
    } else {
      state.cart.push({
        lineId,
        productId: product.id,
        sizeId: size.id,
        extraIds: cleanExtraIds,
        quantity: clamp(quantity, 1, MAX_CART_QTY)
      });
    }

    persistCart();
    renderCart();
    renderMenu();
    showToast(`${product.title} added to basket.`);
  }

  function changeCartQuantity(lineId, delta) {
    const line = state.cart.find((item) => item.lineId === lineId);
    if (!line) return;

    line.quantity += delta;
    if (line.quantity <= 0) {
      removeCartLine(lineId);
      return;
    }
    line.quantity = clamp(line.quantity, 1, MAX_CART_QTY);
    persistCart();
    renderCart();
    renderMenu();
  }

  function removeCartLine(lineId) {
    const before = state.cart.length;
    state.cart = state.cart.filter((line) => line.lineId !== lineId);
    if (state.cart.length !== before) {
      persistCart();
      renderCart();
      renderMenu();
      showToast("Item removed from basket.");
    }
  }

  function clearCart() {
    if (!state.cart.length) return;
    state.cart = [];
    state.promoCode = "";
    persistCart();
    writeText(STORAGE_KEYS.promo, "");
    renderCart();
    renderMenu();
    showToast("Basket cleared.");
  }

  function toggleFavorite(productId) {
    const product = getProduct(productId);
    if (!product) return;

    if (state.favorites.has(product.id)) {
      state.favorites.delete(product.id);
      showToast(`${product.title} removed from favorites.`);
    } else {
      state.favorites.add(product.id);
      showToast(`${product.title} saved to favorites.`);
    }
    writeJson(STORAGE_KEYS.favorites, Array.from(state.favorites));
    renderMenu();
    renderProductModal();
  }

  function applyPromo(silent) {
    const code = String(els.promoInput?.value || "").trim().toUpperCase();
    state.promoCode = code;
    writeText(STORAGE_KEYS.promo, code);
    const totals = calculateTotals();
    renderCart();

    if (!silent) {
      if (!code) {
        showToast("Promo code cleared.");
      } else if (totals.promo.valid) {
        showToast(`${code} applied.`);
      } else {
        showToast(totals.promo.message);
      }
    }
  }

  function calculateTotals() {
    const subtotal = state.cart.reduce((sum, line) => sum + getLineUnitPrice(line) * line.quantity, 0);
    const deliveryFee = state.fulfillment === "pickup" || subtotal === 0 || subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
    const serviceFee = subtotal > 0 ? Math.round(subtotal * SERVICE_RATE) : 0;
    const promo = resolvePromo(state.promoCode, subtotal);
    const discount = promo.valid ? Math.min(promo.discount, subtotal) : 0;
    return {
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total: Math.max(0, subtotal + deliveryFee + serviceFee - discount),
      promo,
      promoCode: promo.valid ? promo.code : ""
    };
  }

  function resolvePromo(codeValue, subtotal) {
    const code = String(codeValue || "").trim().toUpperCase();
    if (!code) {
      return { valid: false, code: "", discount: 0, message: "" };
    }

    const rule = promoRules[code];
    if (!rule) {
      return { valid: false, code, discount: 0, message: "Promo code was not found." };
    }

    if (subtotal <= 0) {
      return { valid: false, code, discount: 0, message: "Add items before applying a promo code." };
    }

    if (subtotal < rule.min) {
      return {
        valid: false,
        code,
        discount: 0,
        message: `${code} requires at least ${money(rule.min)} before fees.`
      };
    }

    if (rule.fulfillment && rule.fulfillment !== state.fulfillment) {
      return {
        valid: false,
        code,
        discount: 0,
        message: `${code} is only available for ${rule.fulfillment} orders.`
      };
    }

    let discount = 0;
    if (rule.type === "fixed") {
      discount = rule.value;
    } else if (rule.type === "category-percent") {
      const categorySubtotal = state.cart.reduce((sum, line) => {
        const product = getProduct(line.productId);
        return product?.category === rule.category ? sum + getLineUnitPrice(line) * line.quantity : sum;
      }, 0);
      if (categorySubtotal <= 0) {
        return { valid: false, code, discount: 0, message: `${code} requires at least one drink.` };
      }
      discount = Math.round(categorySubtotal * rule.value);
    } else {
      discount = Math.round(subtotal * rule.value);
    }

    if (rule.cap) {
      discount = Math.min(discount, rule.cap);
    }

    return {
      valid: true,
      code,
      discount,
      message: `${code} applied. You saved ${money(discount)}.`
    };
  }

  function renderPromoMessage(totals) {
    if (!els.promoMessage) return;

    const promo = totals.promo;
    els.promoMessage.classList.toggle("is-error", Boolean(state.promoCode) && !promo.valid);
    els.promoMessage.textContent = state.promoCode ? promo.message : "";
  }

  function syncPromoInput() {
    if (!els.promoInput) return;
    if (document.activeElement !== els.promoInput && els.promoInput.value !== state.promoCode) {
      els.promoInput.value = state.promoCode;
    }
  }

  function validateCheckout(totals) {
    const form = els.checkoutForm;
    const errors = [];
    if (!form) return ["Checkout form is not available."];

    const fullName = String(form.elements.fullName.value || "").trim();
    const phone = String(form.elements.phone.value || "").trim();
    const address = String(form.elements.address.value || "").trim();
    const payment = String(form.elements.payment.value || "card");
    const scheduleMode = getRadioValue("scheduleMode");
    const digitsOnlyPhone = phone.replace(/\D/g, "");

    if (!state.cart.length) errors.push("Add at least one item to place an order.");
    if (totals.subtotal < MIN_ORDER) errors.push(`Minimum order is ${money(MIN_ORDER)} before fees.`);
    if (fullName.length < 3) errors.push("Enter your full name.");
    if (digitsOnlyPhone.length < 7) errors.push("Enter a valid mobile number.");
    if (state.fulfillment === "delivery" && address.length < 8) errors.push("Enter a complete delivery address.");

    if (scheduleMode === "scheduled") {
      const date = String(form.elements.date.value || "");
      const time = String(form.elements.time.value || "");
      if (!date) errors.push("Choose a delivery date.");
      if (!time) errors.push("Choose a delivery time.");
      if (date && date < isoDate(new Date())) errors.push("Scheduled delivery date cannot be in the past.");
    }

    if (payment === "card") {
      const cardNumber = String(form.elements.cardNumber.value || "").replace(/\s/g, "");
      const cardExpiry = String(form.elements.cardExpiry.value || "").trim();
      const cardCvv = String(form.elements.cardCvv.value || "").trim();
      if (!/^\d{16}$/.test(cardNumber)) errors.push("Enter a 16 digit card number.");
      if (!isValidExpiry(cardExpiry)) errors.push("Enter a valid future expiry date in MM/YY format.");
      if (!/^\d{3,4}$/.test(cardCvv)) errors.push("Enter a valid CVV.");
    }

    if (state.promoCode && !totals.promo.valid) {
      errors.push(totals.promo.message);
    }

    return errors;
  }

  function showFormErrors(errors) {
    if (!els.formErrors) return;

    if (!errors.length) {
      els.formErrors.hidden = true;
      els.formErrors.innerHTML = "";
      return;
    }

    els.formErrors.hidden = false;
    els.formErrors.innerHTML = `<ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`;
  }

  function updateFulfillmentFields() {
    setRadioValue("fulfillment", state.fulfillment);
    const form = els.checkoutForm;
    if (!form) return;

    const isPickup = state.fulfillment === "pickup";
    els.addressRow.hidden = isPickup;
    if (els.contactlessRow) {
      els.contactlessRow.hidden = isPickup;
      const contactlessInput = els.contactlessRow.querySelector("input");
      if (contactlessInput) {
        contactlessInput.disabled = isPickup;
        if (isPickup) contactlessInput.checked = false;
      }
    }
    form.elements.address.required = !isPickup;
    updateBranchNote();
  }

  function updateBranchNote() {
    const form = els.checkoutForm;
    if (!form || !els.branchNote) return;

    const branch = branches.find((item) => item.id === form.elements.branch.value) || branches[0];
    const serviceText = state.fulfillment === "pickup" ? branch.pickup : branch.delivery;
    els.branchNote.textContent = `${branch.address} - ${serviceText}`;
  }

  function updateScheduleFields() {
    const form = els.checkoutForm;
    if (!form || !els.scheduledFields) return;

    const scheduled = getRadioValue("scheduleMode") === "scheduled";
    els.scheduledFields.hidden = !scheduled;
    form.elements.date.required = scheduled;
    form.elements.time.required = scheduled;
  }

  function updatePaymentFields() {
    const form = els.checkoutForm;
    if (!form || !els.cardFields) return;

    const cash = form.elements.payment.value === "cash";
    els.cardFields.hidden = cash;
    Array.from(els.cardFields.querySelectorAll("input")).forEach((input) => {
      input.required = !cash;
    });
  }

  function advanceActiveOrder() {
    if (!state.activeOrder) return;

    const steps = trackingSteps[state.activeOrder.fulfillment] || trackingSteps.delivery;
    state.activeOrder.statusIndex = clamp((state.activeOrder.statusIndex || 0) + 1, 0, steps.length - 1);
    const order = state.orders.find((item) => item.id === state.activeOrder.id);
    if (order) {
      order.statusIndex = state.activeOrder.statusIndex;
    }
    persistOrders();
    renderTracking();
    renderHistory();
    showToast(`Order ${state.activeOrder.id}: ${steps[state.activeOrder.statusIndex]}.`);
  }

  function trackOrder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;

    state.activeOrder = { ...order, items: cloneCart(order.items) };
    writeJson(STORAGE_KEYS.activeOrder, state.activeOrder);
    renderTracking();
    closeHistoryPanel();
    document.querySelector("#tracking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reorder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;

    order.items.forEach((line) => {
      const product = getProduct(line.productId);
      if (product) {
        addConfiguredProduct(product.id, line.sizeId, line.extraIds, line.quantity);
      }
    });
    closeHistoryPanel();
    showToast(`Items from ${order.id} were added to your basket.`);
  }

  function getVisibleProducts() {
    let list = state.products.slice();

    if (state.activeCategory === "popular") {
      list = list.filter((product) => product.popular);
    } else if (state.activeCategory !== "all") {
      list = list.filter((product) => product.category === state.activeCategory);
    }

    if (state.activeFilter === "popular") {
      list = list.filter((product) => product.popular);
    } else if (state.activeFilter === "discount") {
      list = list.filter((product) => product.oldPrice && product.oldPrice > product.price);
    } else if (state.activeFilter === "vegetarian") {
      list = list.filter((product) => product.vegetarian);
    } else if (state.activeFilter === "spicy") {
      list = list.filter((product) => product.spicy);
    }

    if (state.search) {
      const needle = state.search.toLowerCase();
      list = list.filter((product) => {
        const haystack = [
          product.title,
          product.description,
          categoryName(product.category),
          ...(product.tags || [])
        ].join(" ").toLowerCase();
        return haystack.includes(needle);
      });
    }

    return sortProducts(list);
  }

  function groupProducts(list) {
    if (state.activeCategory === "popular") {
      return [{ id: "popular", name: "Popular picks", items: list }];
    }

    if (state.activeCategory !== "all" && !state.search) {
      return [{ id: state.activeCategory, name: categoryName(state.activeCategory), items: list }];
    }

    return categories
      .filter((category) => !["all", "popular"].includes(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        items: list.filter((product) => product.category === category.id)
      }))
      .filter((section) => section.items.length > 0);
  }

  function sortProducts(list) {
    const ranked = list.slice();
    if (state.activeSort === "rating") {
      return ranked.sort((a, b) => b.rating - a.rating || a.price - b.price || a.title.localeCompare(b.title));
    }
    if (state.activeSort === "price-low") {
      return ranked.sort((a, b) => a.price - b.price || b.rating - a.rating || a.title.localeCompare(b.title));
    }
    if (state.activeSort === "price-high") {
      return ranked.sort((a, b) => b.price - a.price || b.rating - a.rating || a.title.localeCompare(b.title));
    }
    return ranked.sort((a, b) => {
      const aScore = (a.popular ? 20 : 0) + (a.oldPrice ? 8 : 0) + a.rating;
      const bScore = (b.popular ? 20 : 0) + (b.oldPrice ? 8 : 0) + b.rating;
      return bScore - aScore || a.title.localeCompare(b.title);
    });
  }

  function getCategoryCounts() {
    const base = state.products.filter((product) => productMatchesFilterAndSearch(product));
    const counts = new Map();
    counts.set("all", base.length);
    counts.set("popular", base.filter((product) => product.popular).length);
    categories
      .filter((category) => !["all", "popular"].includes(category.id))
      .forEach((category) => {
        counts.set(category.id, base.filter((product) => product.category === category.id).length);
      });
    return counts;
  }

  function productMatchesFilterAndSearch(product) {
    if (state.activeFilter === "popular" && !product.popular) return false;
    if (state.activeFilter === "discount" && !(product.oldPrice && product.oldPrice > product.price)) return false;
    if (state.activeFilter === "vegetarian" && !product.vegetarian) return false;
    if (state.activeFilter === "spicy" && !product.spicy) return false;
    if (!state.search) return true;

    const needle = state.search.toLowerCase();
    const haystack = [product.title, product.description, categoryName(product.category), ...(product.tags || [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  }

  function getMenuTitle(count) {
    if (state.search) return `${count} results for "${state.search}"`;
    if (state.activeCategory === "all") return "Choose your meal";
    return categoryName(state.activeCategory);
  }

  function getMenuSummary(count) {
    const category = state.activeCategory === "all" ? "the full menu" : categoryName(state.activeCategory);
    const filter = state.activeFilter === "all" ? "" : `, filtered by ${state.activeFilter}`;
    const sortLabels = {
      recommended: "recommended items first",
      rating: "highest rated items first",
      "price-low": "lowest price items first",
      "price-high": "highest price items first"
    };
    return `${count} ${plural(count, "item", "items")} from ${category}${filter}, sorted within sections with ${sortLabels[state.activeSort] || sortLabels.recommended}.`;
  }

  function getProductMeta(product) {
    return categoryMeta[product.category] || { prep: "10-18 min", kcal: "350-800 kcal", detail: "Customizable" };
  }

  function getProductCartQuantity(productId) {
    return state.cart
      .filter((line) => line.productId === productId)
      .reduce((sum, line) => sum + line.quantity, 0);
  }

  function getCartSuggestions() {
    const idsInCart = new Set(state.cart.map((line) => line.productId));
    const categoriesInCart = new Set(state.cart.map((line) => getProduct(line.productId)?.category).filter(Boolean));
    const wantsDrink = !categoriesInCart.has("drinks");
    const wantsSide = !categoriesInCart.has("sides");
    const wantsDessert = state.cart.length >= 2 && !categoriesInCart.has("desserts");
    const desiredCategories = [
      wantsDrink ? "drinks" : "",
      wantsSide ? "sides" : "",
      wantsDessert ? "desserts" : ""
    ].filter(Boolean);

    const suggestions = [];
    for (const category of desiredCategories) {
      const match = products
        .filter((product) => product.category === category && !idsInCart.has(product.id))
        .sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating || a.price - b.price)[0];
      if (match) suggestions.push(match);
    }

    if (!suggestions.length && state.cart.length) {
      return products
        .filter((product) => product.popular && !idsInCart.has(product.id))
        .slice(0, 2);
    }

    return suggestions.slice(0, 2);
  }

  function buildTags(product) {
    const tags = [];
    if (product.oldPrice && product.oldPrice > product.price) tags.push({ label: "Deal", kind: "deal" });
    if (product.popular) tags.push({ label: "Popular", kind: "normal" });
    if (product.vegetarian) tags.push({ label: "Vegetarian", kind: "normal" });
    if (product.spicy) tags.push({ label: "Spicy", kind: "deal" });
    (product.tags || []).forEach((label) => {
      if (!tags.some((tag) => tag.label === label)) {
        tags.push({ label, kind: label === "Deal" ? "deal" : "normal" });
      }
    });
    return tags;
  }

  function getDiscountPercent(product) {
    if (!product.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }

  function getLineUnitPrice(line) {
    const product = getProduct(line.productId);
    if (!product) return 0;

    const size = getSelectedSize(product, line.sizeId);
    const extras = getSelectedExtras(product, line.extraIds);
    return product.price + size.delta + extras.reduce((sum, extra) => sum + extra.price, 0);
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId);
  }

  function getSizeOptions(product) {
    return sizePresets[product.category] || [{ id: "regular", name: "Regular", delta: 0 }];
  }

  function getExtraOptions(product) {
    return extraPresets[product.category] || [];
  }

  function getSelectedSize(product, sizeId) {
    return getSizeOptions(product).find((size) => size.id === sizeId) || getSizeOptions(product)[0];
  }

  function getSelectedExtras(product, extraIds) {
    const ids = new Set(Array.isArray(extraIds) ? extraIds : Array.from(extraIds || []));
    return getExtraOptions(product).filter((extra) => ids.has(extra.id));
  }

  function getCartCount() {
    return state.cart.reduce((sum, line) => sum + line.quantity, 0);
  }

  function persistCart() {
    writeJson(STORAGE_KEYS.cart, state.cart);
  }

  function persistOrders() {
    writeJson(STORAGE_KEYS.orders, state.orders);
    writeJson(STORAGE_KEYS.activeOrder, state.activeOrder);
  }

  function sanitizeCart(cart) {
    if (!Array.isArray(cart)) return [];
    return cart
      .filter((line) => line && getProduct(line.productId))
      .map((line) => {
        const product = getProduct(line.productId);
        const size = getSelectedSize(product, line.sizeId);
        const extras = getSelectedExtras(product, line.extraIds).map((extra) => extra.id).sort();
        return {
          lineId: createLineId(product.id, size.id, extras),
          productId: product.id,
          sizeId: size.id,
          extraIds: extras,
          quantity: clamp(Number(line.quantity) || 1, 1, MAX_CART_QTY)
        };
      });
  }

  function sanitizeOrders(orders) {
    if (!Array.isArray(orders)) return [];
    return orders
      .filter((order) => order && Array.isArray(order.items) && typeof order.id === "string")
      .map((order) => ({
        ...order,
        items: sanitizeCart(order.items),
        statusIndex: clamp(Number(order.statusIndex) || 0, 0, 4)
      }));
  }

  function cloneCart(cart) {
    return cart.map((line) => ({
      lineId: line.lineId,
      productId: line.productId,
      sizeId: line.sizeId,
      extraIds: Array.isArray(line.extraIds) ? line.extraIds.slice() : [],
      quantity: line.quantity
    }));
  }

  function createLineId(productId, sizeId, extraIds) {
    return [productId, sizeId, extraIds.slice().sort().join(".")].join("|");
  }

  function createOrderId() {
    return `CC-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  function buildScheduleLabel(formData) {
    const mode = getRadioValue("scheduleMode");
    if (mode !== "scheduled") {
      return state.fulfillment === "pickup" ? "ASAP pickup" : "ASAP delivery";
    }
    const date = String(formData.get("date") || "");
    const time = String(formData.get("time") || "");
    return `${state.fulfillment === "pickup" ? "Pickup" : "Delivery"} scheduled for ${date} at ${time}`;
  }

  function categoryName(categoryId) {
    return categories.find((category) => category.id === categoryId)?.name || "Menu";
  }

  function setRadioValue(name, value) {
    document.querySelectorAll(`input[name='${name}']`).forEach((input) => {
      input.checked = input.value === value;
    });
  }

  function getRadioValue(name) {
    return document.querySelector(`input[name='${name}']:checked`)?.value || "";
  }

  function createTimeSlots() {
    const slots = [];
    for (let hour = 11; hour <= 23; hour += 1) {
      for (const minute of [0, 30]) {
        if (hour === 11 && minute === 0) continue;
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return slots;
  }

  function isValidExpiry(value) {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) return false;

    const expiry = new Date(year, month, 0, 23, 59, 59);
    return expiry >= new Date();
  }

  function scrollMenuIntoView() {
    document.querySelector("#menuList")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToSelector(selector) {
    if (!selector) return;
    let destination = null;
    try {
      destination = document.querySelector(selector);
    } catch {
      return;
    }
    if (!destination) return;
    destination.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToHash() {
    if (!window.location.hash) return;
    window.setTimeout(() => scrollToSelector(window.location.hash), 80);
  }

  function formatDateTime(value) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return "Saved order";
    }
  }

  function money(cents) {
    return currency.format((Number(cents) || 0) / 100);
  }

  function plural(count, one, many) {
    return count === 1 ? one : many;
  }

  function isoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function img(id) {
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function debounce(fn, delay) {
    let handle = 0;
    return (...args) => {
      window.clearTimeout(handle);
      handle = window.setTimeout(() => fn(...args), delay);
    };
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      showToast("Local storage is unavailable in this browser.");
    }
  }

  function readText(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function writeText(key, value) {
    try {
      if (value) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      showToast("Local storage is unavailable in this browser.");
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    if (!els.toastRegion) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    els.toastRegion.append(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 3200);
  }
})();
