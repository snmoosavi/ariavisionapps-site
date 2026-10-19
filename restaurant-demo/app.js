(() => {
  "use strict";

  const STORAGE = {
    cart: "bergBite.cart.v2",
    favorites: "bergBite.favorites.v2",
    orders: "bergBite.orders.v2",
    activeOrder: "bergBite.activeOrder.v2",
    promo: "bergBite.promo.v2"
  };

  const categories = {
    burgers: "Burgers",
    german: "German",
    pizza: "Pizza",
    doner: "Doner",
    sides: "Sides",
    desserts: "Desserts",
    drinks: "Drinks"
  };

  const products = [
    {
      id: "berlin-double-smash",
      title: "Berlin Double Smash Burger",
      category: "burgers",
      price: 1290,
      discount: 12,
      rating: 4.9,
      reviews: 684,
      prep: "16 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["double beef", "cheddar", "house sauce"],
      description: "Two crispy-edge beef patties with mature cheddar, pickles, caramelised onion and BergBite burger sauce.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "single", name: "Single", delta: -260 },
        { id: "double", name: "Double", delta: 0 },
        { id: "combo", name: "Combo with fries and drink", delta: 520 }
      ],
      toppings: [
        { id: "cheddar", name: "Extra cheddar", price: 120 },
        { id: "beef-bacon", name: "Beef bacon", price: 190 },
        { id: "jalapeno", name: "Jalapeno", price: 80 },
        { id: "truffle-mayo", name: "Truffle mayo", price: 110 }
      ]
    },
    {
      id: "bavarian-pretzel-burger",
      title: "Bavarian Pretzel Burger",
      category: "burgers",
      price: 1390,
      discount: 0,
      rating: 4.8,
      reviews: 391,
      prep: "18 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["pretzel bun", "emmental", "mustard"],
      description: "Juicy beef patty in a soft pretzel bun with emmental, crispy onions, pickles and sweet Bavarian mustard.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "double", name: "Double patty", delta: 360 },
        { id: "combo", name: "Combo with wedges and drink", delta: 560 }
      ],
      toppings: [
        { id: "emmental", name: "Extra emmental", price: 130 },
        { id: "crispy-onions", name: "Crispy onions", price: 80 },
        { id: "mustard", name: "Bavarian mustard", price: 70 },
        { id: "mushroom", name: "Roasted mushrooms", price: 120 }
      ]
    },
    {
      id: "black-forest-bbq-burger",
      title: "Black Forest BBQ Burger",
      category: "burgers",
      price: 1450,
      discount: 8,
      rating: 4.7,
      reviews: 276,
      prep: "19 min",
      popular: false,
      spicy: true,
      vegetarian: false,
      tags: ["smoked BBQ", "crispy onion", "chilli"],
      description: "Smoked beef burger with BBQ glaze, black pepper mayo, crispy onion and a light chilli kick.",
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "double", name: "Double patty", delta: 380 },
        { id: "combo", name: "Combo with fries and cola", delta: 540 }
      ],
      toppings: [
        { id: "bbq", name: "Extra BBQ glaze", price: 90 },
        { id: "chilli", name: "Fresh chilli", price: 80 },
        { id: "cheddar", name: "Extra cheddar", price: 120 },
        { id: "beef-bacon", name: "Beef bacon", price: 190 }
      ]
    },
    {
      id: "vegan-beet-burger",
      title: "Vegan Beet Burger",
      category: "burgers",
      price: 1190,
      discount: 0,
      rating: 4.6,
      reviews: 243,
      prep: "15 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["vegan", "beet patty", "avocado"],
      description: "Beetroot and chickpea patty with avocado, tomato, lettuce and smoky vegan mayo.",
      image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "double", name: "Double patty", delta: 290 },
        { id: "combo", name: "Combo with sweet potato fries", delta: 520 }
      ],
      toppings: [
        { id: "avocado", name: "Extra avocado", price: 150 },
        { id: "vegan-cheese", name: "Vegan cheese", price: 130 },
        { id: "pickles", name: "Pickles", price: 60 },
        { id: "hot-sauce", name: "Hot sauce", price: 70 }
      ]
    },
    {
      id: "classic-currywurst",
      title: "Classic Berlin Currywurst",
      category: "german",
      price: 890,
      discount: 10,
      rating: 4.9,
      reviews: 812,
      prep: "12 min",
      popular: true,
      spicy: true,
      vegetarian: false,
      tags: ["curry sauce", "fries", "street food"],
      description: "Grilled sausage sliced over golden fries with warm curry ketchup and Berlin spice dust.",
      image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large fries", delta: 240 },
        { id: "sharing", name: "Sharing box", delta: 520 }
      ],
      toppings: [
        { id: "extra-sauce", name: "Extra curry sauce", price: 80 },
        { id: "spice", name: "Hot curry spice", price: 60 },
        { id: "crispy-onions", name: "Crispy onions", price: 80 },
        { id: "mayo", name: "Mayo dip", price: 70 }
      ]
    },
    {
      id: "schnitzel-box",
      title: "Crispy Schnitzel Box",
      category: "german",
      price: 1490,
      discount: 0,
      rating: 4.8,
      reviews: 522,
      prep: "22 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["crispy", "potato salad", "lemon"],
      description: "Golden chicken schnitzel with lemon, warm potato salad, cucumber relish and herb dip.",
      image: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large schnitzel", delta: 420 },
        { id: "double", name: "Double schnitzel", delta: 690 }
      ],
      toppings: [
        { id: "mushroom-gravy", name: "Mushroom gravy", price: 140 },
        { id: "extra-lemon", name: "Extra lemon", price: 40 },
        { id: "herb-dip", name: "Herb dip", price: 80 },
        { id: "potato-salad", name: "Extra potato salad", price: 180 }
      ]
    },
    {
      id: "nuremberg-bratwurst",
      title: "Nuremberg Bratwurst Plate",
      category: "german",
      price: 1290,
      discount: 0,
      rating: 4.7,
      reviews: 344,
      prep: "18 min",
      popular: false,
      spicy: false,
      vegetarian: false,
      tags: ["bratwurst", "sauerkraut", "mustard"],
      description: "Grilled Nuremberg-style sausages with sauerkraut, roasted potatoes and coarse mustard.",
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "six", name: "6 sausages", delta: 0 },
        { id: "nine", name: "9 sausages", delta: 330 },
        { id: "twelve", name: "12 sausages", delta: 580 }
      ],
      toppings: [
        { id: "mustard", name: "Extra mustard", price: 60 },
        { id: "sauerkraut", name: "Extra sauerkraut", price: 150 },
        { id: "potatoes", name: "Roasted potatoes", price: 190 },
        { id: "horseradish", name: "Horseradish cream", price: 80 }
      ]
    },
    {
      id: "kaesespaetzle-bowl",
      title: "Käsespätzle Comfort Bowl",
      category: "german",
      price: 1190,
      discount: 0,
      rating: 4.6,
      reviews: 267,
      prep: "17 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["cheesy", "crispy onion", "vegetarian"],
      description: "Soft egg noodles baked with mountain cheese, crispy onions, chives and a fresh side salad.",
      image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large bowl", delta: 280 },
        { id: "family", name: "Family tray", delta: 980 }
      ],
      toppings: [
        { id: "extra-cheese", name: "Extra mountain cheese", price: 160 },
        { id: "crispy-onions", name: "Crispy onions", price: 80 },
        { id: "mushrooms", name: "Roasted mushrooms", price: 130 },
        { id: "chives", name: "Fresh chives", price: 40 }
      ]
    },
    {
      id: "leberkaese-roll",
      title: "Bavarian Leberkäse Roll",
      category: "german",
      price: 790,
      discount: 0,
      rating: 4.5,
      reviews: 188,
      prep: "10 min",
      popular: false,
      spicy: false,
      vegetarian: false,
      tags: ["warm roll", "mustard", "quick bite"],
      description: "Warm Bavarian meatloaf in a crusty roll with sweet mustard and pickled cucumber.",
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "single", name: "Single", delta: 0 },
        { id: "double", name: "Double slice", delta: 260 },
        { id: "meal", name: "Meal with fries", delta: 450 }
      ],
      toppings: [
        { id: "mustard", name: "Sweet mustard", price: 60 },
        { id: "pickles", name: "Pickles", price: 60 },
        { id: "cheese", name: "Melted cheese", price: 120 },
        { id: "onions", name: "Crispy onions", price: 80 }
      ]
    },
    {
      id: "flammkuchen-pizza",
      title: "Alsatian Flammkuchen Pizza",
      category: "pizza",
      price: 1290,
      discount: 0,
      rating: 4.8,
      reviews: 354,
      prep: "20 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["thin crust", "creme fraiche", "onion"],
      description: "Ultra-thin crust with creme fraiche, smoked beef, onion, chives and cracked black pepper.",
      image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 340 },
        { id: "family", name: "Family", delta: 780 }
      ],
      toppings: [
        { id: "extra-cheese", name: "Extra cheese", price: 140 },
        { id: "beef-bacon", name: "Smoked beef", price: 190 },
        { id: "onions", name: "Extra onions", price: 60 },
        { id: "rocket", name: "Rocket", price: 90 }
      ]
    },
    {
      id: "salami-stone-pizza",
      title: "Stone-Baked Salami Pizza",
      category: "pizza",
      price: 1190,
      discount: 15,
      rating: 4.7,
      reviews: 498,
      prep: "19 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["salami", "mozzarella", "tomato"],
      description: "Stone-baked dough with tomato sauce, mozzarella, German salami and oregano.",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 330 },
        { id: "family", name: "Family", delta: 760 }
      ],
      toppings: [
        { id: "salami", name: "Extra salami", price: 170 },
        { id: "mozzarella", name: "Extra mozzarella", price: 140 },
        { id: "jalapeno", name: "Jalapeno", price: 80 },
        { id: "garlic-oil", name: "Garlic oil", price: 70 }
      ]
    },
    {
      id: "truffle-funghi-pizza",
      title: "Truffle Funghi Pizza",
      category: "pizza",
      price: 1390,
      discount: 0,
      rating: 4.7,
      reviews: 286,
      prep: "21 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["mushroom", "truffle", "vegetarian"],
      description: "Creamy white sauce, roasted mushrooms, mozzarella, truffle oil and parsley.",
      image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 360 },
        { id: "family", name: "Family", delta: 790 }
      ],
      toppings: [
        { id: "mushrooms", name: "Extra mushrooms", price: 130 },
        { id: "truffle", name: "Extra truffle oil", price: 160 },
        { id: "mozzarella", name: "Extra mozzarella", price: 140 },
        { id: "rocket", name: "Rocket", price: 90 }
      ]
    },
    {
      id: "veggie-market-pizza",
      title: "Market Veggie Pizza",
      category: "pizza",
      price: 1090,
      discount: 0,
      rating: 4.6,
      reviews: 211,
      prep: "18 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["vegetarian", "peppers", "olives"],
      description: "Roasted peppers, mushrooms, olives, tomatoes, mozzarella and fresh basil on stone-baked dough.",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 300 },
        { id: "family", name: "Family", delta: 690 }
      ],
      toppings: [
        { id: "olives", name: "Olives", price: 90 },
        { id: "basil", name: "Fresh basil", price: 60 },
        { id: "vegan-cheese", name: "Vegan cheese", price: 150 },
        { id: "garlic-oil", name: "Garlic oil", price: 70 }
      ]
    },
    {
      id: "beef-doner-kebab",
      title: "Berlin Beef Doner Kebab",
      category: "doner",
      price: 890,
      discount: 0,
      rating: 4.8,
      reviews: 724,
      prep: "11 min",
      popular: true,
      spicy: false,
      vegetarian: false,
      tags: ["flatbread", "garlic sauce", "salad"],
      description: "Toasted flatbread filled with seasoned beef, tomato, cucumber, cabbage, onion and garlic sauce.",
      image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "big", name: "Big doner", delta: 250 },
        { id: "box", name: "Doner box with fries", delta: 330 }
      ],
      toppings: [
        { id: "garlic", name: "Garlic sauce", price: 60 },
        { id: "herb", name: "Herb sauce", price: 60 },
        { id: "chilli", name: "Chilli sauce", price: 60 },
        { id: "feta", name: "Feta cheese", price: 120 }
      ]
    },
    {
      id: "chicken-doner-wrap",
      title: "Chicken Doner Wrap",
      category: "doner",
      price: 850,
      discount: 0,
      rating: 4.7,
      reviews: 382,
      prep: "10 min",
      popular: false,
      spicy: true,
      vegetarian: false,
      tags: ["wrap", "chicken", "chilli"],
      description: "Grilled chicken doner in a soft wrap with lettuce, tomato, red cabbage and chilli yoghurt sauce.",
      image: "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large wrap", delta: 220 },
        { id: "meal", name: "Meal with fries", delta: 430 }
      ],
      toppings: [
        { id: "chilli", name: "Extra chilli", price: 60 },
        { id: "garlic", name: "Garlic sauce", price: 60 },
        { id: "feta", name: "Feta cheese", price: 120 },
        { id: "pickled-chilli", name: "Pickled chilli", price: 90 }
      ]
    },
    {
      id: "falafel-halloumi-wrap",
      title: "Falafel Halloumi Wrap",
      category: "doner",
      price: 890,
      discount: 10,
      rating: 4.6,
      reviews: 254,
      prep: "12 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["falafel", "halloumi", "vegetarian"],
      description: "Crispy falafel, grilled halloumi, salad, pickled vegetables and sesame yoghurt sauce.",
      image: "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large wrap", delta: 220 },
        { id: "box", name: "Falafel box", delta: 280 }
      ],
      toppings: [
        { id: "halloumi", name: "Extra halloumi", price: 150 },
        { id: "sesame", name: "Sesame sauce", price: 60 },
        { id: "hummus", name: "Hummus", price: 110 },
        { id: "pickles", name: "Pickled vegetables", price: 80 }
      ]
    },
    {
      id: "truffle-parmesan-fries",
      title: "Truffle Parmesan Fries",
      category: "sides",
      price: 590,
      discount: 0,
      rating: 4.8,
      reviews: 447,
      prep: "9 min",
      popular: true,
      spicy: false,
      vegetarian: true,
      tags: ["crispy", "truffle", "parmesan"],
      description: "Double-fried potato fries with parmesan, truffle oil, parsley and aioli dip.",
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 180 },
        { id: "sharing", name: "Sharing box", delta: 420 }
      ],
      toppings: [
        { id: "aioli", name: "Aioli dip", price: 70 },
        { id: "parmesan", name: "Extra parmesan", price: 100 },
        { id: "chilli", name: "Chilli flakes", price: 50 },
        { id: "truffle", name: "Extra truffle oil", price: 130 }
      ]
    },
    {
      id: "sweet-potato-fries",
      title: "Sweet Potato Fries",
      category: "sides",
      price: 560,
      discount: 0,
      rating: 4.6,
      reviews: 266,
      prep: "9 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["sweet potato", "vegan", "lime mayo"],
      description: "Crispy sweet potato fries with lime mayo and smoked paprika salt.",
      image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 170 },
        { id: "sharing", name: "Sharing box", delta: 380 }
      ],
      toppings: [
        { id: "lime-mayo", name: "Lime mayo", price: 70 },
        { id: "vegan-aioli", name: "Vegan aioli", price: 80 },
        { id: "paprika", name: "Smoked paprika", price: 40 },
        { id: "hot-sauce", name: "Hot sauce", price: 60 }
      ]
    },
    {
      id: "pretzel-bites",
      title: "Warm Pretzel Bites",
      category: "sides",
      price: 520,
      discount: 0,
      rating: 4.5,
      reviews: 192,
      prep: "8 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["pretzel", "cheese dip", "snack"],
      description: "Mini pretzel bites with melted cheese dip and coarse salt.",
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 160 },
        { id: "party", name: "Party bowl", delta: 520 }
      ],
      toppings: [
        { id: "cheese-dip", name: "Extra cheese dip", price: 90 },
        { id: "mustard", name: "Mustard dip", price: 70 },
        { id: "herb-butter", name: "Herb butter", price: 80 },
        { id: "salt", name: "Extra coarse salt", price: 30 }
      ]
    },
    {
      id: "onion-rings",
      title: "Beer-Battered Onion Rings",
      category: "sides",
      price: 540,
      discount: 0,
      rating: 4.5,
      reviews: 218,
      prep: "10 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["crispy", "onion", "dip"],
      description: "Thick-cut onion rings in a crisp batter, served with smoky BBQ dip.",
      image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 160 },
        { id: "sharing", name: "Sharing box", delta: 360 }
      ],
      toppings: [
        { id: "bbq", name: "BBQ dip", price: 70 },
        { id: "aioli", name: "Aioli", price: 70 },
        { id: "ranch", name: "Ranch dip", price: 80 },
        { id: "chilli", name: "Chilli mayo", price: 80 }
      ]
    },
    {
      id: "sauerkraut-slaw",
      title: "Crisp Sauerkraut Slaw",
      category: "sides",
      price: 420,
      discount: 0,
      rating: 4.4,
      reviews: 119,
      prep: "5 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["fresh", "sauerkraut", "vegan"],
      description: "Crunchy sauerkraut, cabbage, carrot, apple and parsley in a bright mustard dressing.",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "small", name: "Small", delta: -100 },
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 160 }
      ],
      toppings: [
        { id: "apple", name: "Extra apple", price: 50 },
        { id: "mustard", name: "Mustard dressing", price: 50 },
        { id: "seeds", name: "Toasted seeds", price: 70 }
      ]
    },
    {
      id: "black-forest-brownie",
      title: "Black Forest Brownie",
      category: "desserts",
      price: 590,
      discount: 0,
      rating: 4.8,
      reviews: 305,
      prep: "6 min",
      popular: true,
      spicy: false,
      vegetarian: true,
      tags: ["chocolate", "cherry", "cream"],
      description: "Warm chocolate brownie with sour cherry compote, whipped cream and dark chocolate curls.",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "single", name: "Single", delta: 0 },
        { id: "double", name: "Double portion", delta: 420 }
      ],
      toppings: [
        { id: "cream", name: "Extra cream", price: 80 },
        { id: "cherries", name: "Extra cherries", price: 110 },
        { id: "ice-cream", name: "Vanilla ice cream", price: 150 }
      ]
    },
    {
      id: "apple-strudel-bites",
      title: "Apple Strudel Bites",
      category: "desserts",
      price: 560,
      discount: 0,
      rating: 4.7,
      reviews: 244,
      prep: "7 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["apple", "cinnamon", "vanilla"],
      description: "Crisp pastry bites filled with apple and cinnamon, served with vanilla sauce.",
      image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "six", name: "6 pieces", delta: 0 },
        { id: "twelve", name: "12 pieces", delta: 460 }
      ],
      toppings: [
        { id: "vanilla", name: "Extra vanilla sauce", price: 90 },
        { id: "cinnamon", name: "Cinnamon sugar", price: 40 },
        { id: "ice-cream", name: "Vanilla ice cream", price: 150 }
      ]
    },
    {
      id: "berliner-donut",
      title: "Berliner Jam Donut",
      category: "desserts",
      price: 390,
      discount: 0,
      rating: 4.5,
      reviews: 176,
      prep: "4 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["jam", "powdered sugar", "classic"],
      description: "Fluffy Berliner filled with raspberry jam and dusted with powdered sugar.",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "single", name: "Single", delta: 0 },
        { id: "box4", name: "Box of 4", delta: 1080 },
        { id: "box8", name: "Box of 8", delta: 2280 }
      ],
      toppings: [
        { id: "chocolate", name: "Chocolate drizzle", price: 70 },
        { id: "cream", name: "Vanilla cream", price: 90 },
        { id: "jam", name: "Extra jam", price: 80 }
      ]
    },
    {
      id: "fritz-kola",
      title: "Fritz-Kola",
      category: "drinks",
      price: 320,
      discount: 0,
      rating: 4.7,
      reviews: 371,
      prep: "2 min",
      popular: true,
      spicy: false,
      vegetarian: true,
      tags: ["cold", "cola", "330 ml"],
      description: "Chilled German cola with a strong caffeine kick.",
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "500", name: "500 ml", delta: 120 }
      ],
      toppings: [
        { id: "ice", name: "Cup with ice", price: 30 },
        { id: "lemon", name: "Lemon slice", price: 30 }
      ]
    },
    {
      id: "apfelschorle",
      title: "Apple Schorle",
      category: "drinks",
      price: 290,
      discount: 0,
      rating: 4.6,
      reviews: 284,
      prep: "2 min",
      popular: true,
      spicy: false,
      vegetarian: true,
      tags: ["sparkling", "apple", "refreshing"],
      description: "Sparkling apple juice spritz, light and refreshing.",
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "500", name: "500 ml", delta: 110 },
        { id: "family", name: "1 litre", delta: 340 }
      ],
      toppings: [
        { id: "ice", name: "Cup with ice", price: 30 },
        { id: "mint", name: "Fresh mint", price: 40 }
      ]
    },
    {
      id: "club-mate",
      title: "Club-Mate",
      category: "drinks",
      price: 340,
      discount: 0,
      rating: 4.5,
      reviews: 229,
      prep: "2 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["mate", "cold", "Berlin favourite"],
      description: "Cold mate tea soda, a Berlin favourite with herbal bitterness.",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "500", name: "500 ml", delta: 120 }
      ],
      toppings: [
        { id: "ice", name: "Cup with ice", price: 30 },
        { id: "lime", name: "Lime wedge", price: 40 }
      ]
    },
    {
      id: "spezi",
      title: "Spezi Orange Cola",
      category: "drinks",
      price: 310,
      discount: 0,
      rating: 4.6,
      reviews: 212,
      prep: "2 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["cola", "orange", "classic"],
      description: "Classic German orange-cola mix, served ice cold.",
      image: "https://images.unsplash.com/photo-1596803244618-8dbee441d70b?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "500", name: "500 ml", delta: 110 }
      ],
      toppings: [
        { id: "ice", name: "Cup with ice", price: 30 },
        { id: "orange", name: "Orange slice", price: 40 }
      ]
    },
    {
      id: "rhubarb-spritz",
      title: "Rhubarb Spritz",
      category: "drinks",
      price: 390,
      discount: 0,
      rating: 4.8,
      reviews: 246,
      prep: "3 min",
      popular: true,
      spicy: false,
      vegetarian: true,
      tags: ["rhubarb", "sparkling", "house-made"],
      description: "Sparkling rhubarb lemonade with lime and a crisp dry finish.",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 150 }
      ],
      toppings: [
        { id: "ice", name: "Extra ice", price: 20 },
        { id: "lime", name: "Lime wedge", price: 40 },
        { id: "mint", name: "Fresh mint", price: 40 }
      ]
    },
    {
      id: "elderflower-lemonade",
      title: "Elderflower Lemonade",
      category: "drinks",
      price: 390,
      discount: 0,
      rating: 4.7,
      reviews: 205,
      prep: "3 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["elderflower", "lemon", "sparkling"],
      description: "House lemonade with elderflower syrup, lemon, soda and fresh mint.",
      image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 150 },
        { id: "carafe", name: "Carafe", delta: 620 }
      ],
      toppings: [
        { id: "mint", name: "Fresh mint", price: 40 },
        { id: "lemon", name: "Extra lemon", price: 30 },
        { id: "ice", name: "Extra ice", price: 20 }
      ]
    },
    {
      id: "mineral-water",
      title: "Mineral Water",
      category: "drinks",
      price: 220,
      discount: 0,
      rating: 4.4,
      reviews: 116,
      prep: "1 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["still", "sparkling", "cold"],
      description: "German mineral water, available still or sparkling.",
      image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "750", name: "750 ml", delta: 190 }
      ],
      toppings: [
        { id: "still", name: "Still", price: 0 },
        { id: "sparkling", name: "Sparkling", price: 0 },
        { id: "lemon", name: "Lemon slice", price: 30 }
      ]
    },
    {
      id: "zero-radler",
      title: "Radler 0.0%",
      category: "drinks",
      price: 360,
      discount: 0,
      rating: 4.5,
      reviews: 151,
      prep: "2 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["0.0%", "lemon", "bottle"],
      description: "Alcohol-free lemon radler with a clean, crisp finish.",
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml bottle", delta: 0 },
        { id: "500", name: "500 ml bottle", delta: 130 }
      ],
      toppings: [
        { id: "chilled", name: "Extra chilled", price: 0 },
        { id: "glass", name: "Cup with lemon", price: 40 }
      ]
    },
    {
      id: "iced-coffee",
      title: "Iced Coffee Cream",
      category: "drinks",
      price: 440,
      discount: 0,
      rating: 4.7,
      reviews: 188,
      prep: "4 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["coffee", "cold", "cream"],
      description: "Cold brew coffee with milk, vanilla cream and a dark chocolate dusting.",
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 160 }
      ],
      toppings: [
        { id: "oat", name: "Oat milk", price: 60 },
        { id: "vanilla", name: "Vanilla shot", price: 70 },
        { id: "cream", name: "Extra cream", price: 80 }
      ]
    },
    {
      id: "ginger-beer",
      title: "Ginger Beer",
      category: "drinks",
      price: 350,
      discount: 0,
      rating: 4.5,
      reviews: 133,
      prep: "2 min",
      popular: false,
      spicy: true,
      vegetarian: true,
      tags: ["ginger", "spicy", "cold"],
      description: "Spicy ginger soda, sharp enough to cut through rich burgers and schnitzel.",
      image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "330", name: "330 ml", delta: 0 },
        { id: "500", name: "500 ml", delta: 140 }
      ],
      toppings: [
        { id: "ice", name: "Cup with ice", price: 30 },
        { id: "lime", name: "Lime wedge", price: 40 }
      ]
    },
    {
      id: "fresh-orange-juice",
      title: "Fresh Orange Juice",
      category: "drinks",
      price: 490,
      discount: 0,
      rating: 4.8,
      reviews: 167,
      prep: "4 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["fresh", "orange", "vitamin"],
      description: "Freshly pressed orange juice with no added sugar.",
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 170 },
        { id: "bottle", name: "Takeaway bottle", delta: 360 }
      ],
      toppings: [
        { id: "ice", name: "Ice", price: 20 },
        { id: "ginger", name: "Ginger shot", price: 90 }
      ]
    },
    {
      id: "berry-smoothie",
      title: "Berry Smoothie",
      category: "drinks",
      price: 540,
      discount: 0,
      rating: 4.7,
      reviews: 142,
      prep: "5 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["berries", "yoghurt", "fresh"],
      description: "Mixed berries blended with yoghurt, banana and a touch of honey.",
      image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "large", name: "Large", delta: 180 }
      ],
      toppings: [
        { id: "oat", name: "Oat milk", price: 60 },
        { id: "protein", name: "Protein boost", price: 120 },
        { id: "berries", name: "Extra berries", price: 110 }
      ]
    },
    {
      id: "cucumber-mint-water",
      title: "Cucumber Mint Water",
      category: "drinks",
      price: 260,
      discount: 0,
      rating: 4.4,
      reviews: 98,
      prep: "2 min",
      popular: false,
      spicy: false,
      vegetarian: true,
      tags: ["light", "mint", "hydrating"],
      description: "Still water infused with cucumber, mint and lemon.",
      image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=84",
      sizes: [
        { id: "regular", name: "Regular", delta: 0 },
        { id: "carafe", name: "Carafe", delta: 360 }
      ],
      toppings: [
        { id: "ice", name: "Extra ice", price: 20 },
        { id: "mint", name: "Fresh mint", price: 40 },
        { id: "lemon", name: "Extra lemon", price: 30 }
      ]
    }
  ];

  const branches = [
    {
      id: "berlin-mitte",
      name: "Berlin Mitte",
      address: "Friedrichstrasse 128, 10117 Berlin",
      deliveryTime: 32,
      pickupTime: 14
    },
    {
      id: "munich-maxvorstadt",
      name: "Munich Maxvorstadt",
      address: "Theresienstrasse 44, 80333 Munich",
      deliveryTime: 38,
      pickupTime: 16
    },
    {
      id: "hamburg-hafencity",
      name: "Hamburg HafenCity",
      address: "Am Sandtorkai 23, 20457 Hamburg",
      deliveryTime: 36,
      pickupTime: 15
    },
    {
      id: "cologne-altstadt",
      name: "Cologne Altstadt",
      address: "Hohe Strasse 76, 50667 Cologne",
      deliveryTime: 40,
      pickupTime: 18
    }
  ];

  const savedAddresses = [
    { id: "", label: "Select an address", value: "" },
    { id: "home", label: "Home - Berlin Prenzlauer Berg", value: "Kollwitzstrasse 52, 10405 Berlin, 3rd floor" },
    { id: "office", label: "Office - Berlin Mitte", value: "Unter den Linden 21, 10117 Berlin, reception desk" }
  ];

  const promoRules = {
    BERLIN20: {
      label: "20% off up to €12.00",
      min: 1800,
      apply: ({ subtotal }) => Math.min(Math.round(subtotal * 0.2), 1200)
    },
    PICKUP15: {
      label: "15% pickup discount up to €9.00",
      min: 1600,
      apply: ({ subtotal }) => Math.min(Math.round(subtotal * 0.15), 900),
      validate: ({ fulfillment }) => fulfillment === "pickup" || "PICKUP15 is available only when pickup is selected."
    },
    FAMILY5: {
      label: "€5.00 off baskets above €35.00",
      min: 3500,
      apply: () => 500
    },
    DRINKS10: {
      label: "10% off drinks",
      min: 1200,
      apply: ({ drinksSubtotal }) => Math.round(drinksSubtotal * 0.1),
      validate: ({ drinksSubtotal }) => drinksSubtotal > 0 || "DRINKS10 applies only when your basket includes drinks."
    }
  };

  const statusSteps = [
    { id: "received", label: "Order received", text: "Your order has been received by BergBite." },
    { id: "confirmed", label: "Restaurant confirmed", text: "The selected branch confirmed your order." },
    { id: "preparing", label: "Kitchen preparing", text: "The kitchen is preparing your food." },
    { id: "handoff", label: "On the way", text: "Your order is being handed to the courier or counter." },
    { id: "delivered", label: "Completed", text: "The order has been completed." }
  ];

  const dom = {
    header: document.querySelector("[data-header]"),
    productGrid: document.querySelector("#productGrid"),
    menuLoading: document.querySelector("[data-menu-loading]"),
    menuError: document.querySelector("[data-menu-error]"),
    emptyState: document.querySelector("[data-empty-state]"),
    search: document.querySelector("#menuSearch"),
    sort: document.querySelector("#sortSelect"),
    filterInputs: [...document.querySelectorAll("[data-filter]")],
    categoryButtons: [...document.querySelectorAll("[data-category]")],
    cartDrawer: document.querySelector("[data-cart-drawer]"),
    drawerOverlay: document.querySelector("[data-drawer-overlay]"),
    cartItems: document.querySelector("[data-cart-items]"),
    summaryItems: document.querySelector("[data-summary-items]"),
    totals: document.querySelector("[data-totals]"),
    drawerTotals: document.querySelector("[data-drawer-totals]"),
    cartCounts: [...document.querySelectorAll("[data-cart-count]")],
    favoriteCount: document.querySelector("[data-favorite-count]"),
    stickyTotal: document.querySelector("[data-sticky-total]"),
    promoInput: document.querySelector("#promoCode"),
    promoMessage: document.querySelector("[data-promo-message]"),
    checkoutForm: document.querySelector("#checkoutForm"),
    formErrors: document.querySelector("[data-form-errors]"),
    branchNote: document.querySelector("[data-branch-note]"),
    addressFieldset: document.querySelector("[data-address-fieldset]"),
    scheduledFields: document.querySelector("[data-scheduled-fields]"),
    paymentFields: document.querySelector("[data-payment-fields]"),
    submitLabel: document.querySelector("[data-submit-label]"),
    submitLoader: document.querySelector("[data-submit-loader]"),
    trackingCard: document.querySelector("[data-tracking-card]"),
    trackForm: document.querySelector("[data-track-form]"),
    historyList: document.querySelector("[data-history-list]"),
    productOverlay: document.querySelector("[data-product-overlay]"),
    productModal: document.querySelector("[data-product-modal]"),
    productModalBody: document.querySelector("[data-product-modal-body]"),
    toastRegion: document.querySelector("[data-toast-region]")
  };

  const currencyFormatter = new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR"
  });
  const numberFormatter = new Intl.NumberFormat("en-DE");
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const state = {
    isLoading: true,
    category: "all",
    query: "",
    sort: "featured",
    cart: readJson(STORAGE.cart, []),
    favorites: new Set(readJson(STORAGE.favorites, [])),
    orders: readJson(STORAGE.orders, []),
    activeOrderId: readText(STORAGE.activeOrder, ""),
    promoCode: readText(STORAGE.promo, ""),
    modal: {
      productId: "",
      sizeId: "",
      toppings: new Set(),
      quantity: 1
    }
  };

  let drawerCloseTimer = 0;

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readText(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      showToast("Browser storage is unavailable.");
    }
  }

  function writeText(key, value) {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      showToast("Browser storage is unavailable.");
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function price(value) {
    return currencyFormatter.format(Math.max(0, Math.round(value)) / 100);
  }

  function signedPrice(value) {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${price(Math.abs(value))}`;
  }

  function number(value) {
    return numberFormatter.format(value);
  }

  function basePrice(product) {
    if (!product.discount) return product.price;
    return Math.round(product.price * (1 - product.discount / 100));
  }

  function productById(id) {
    return products.find((product) => product.id === id);
  }

  function sizeById(product, sizeId) {
    return product.sizes.find((size) => size.id === sizeId) || product.sizes[0];
  }

  function selectedFulfillment() {
    return new FormData(dom.checkoutForm).get("fulfillment") || "delivery";
  }

  function itemProduct(item) {
    return productById(item.productId);
  }

  function cartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  function categorySubtotal(category) {
    return state.cart.reduce((sum, item) => {
      const product = itemProduct(item);
      return sum + (product?.category === category ? item.unitPrice * item.quantity : 0);
    }, 0);
  }

  function itemCount() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function cartQuantityFor(productId) {
    return state.cart
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  function makeCartKey(productId, sizeId, toppingIds) {
    return [productId, sizeId, [...toppingIds].sort().join(".")].join("|");
  }

  function fallbackImage(label) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#c8202f"/>
            <stop offset="0.48" stop-color="#006b5b"/>
            <stop offset="1" stop-color="#f4b233"/>
          </linearGradient>
        </defs>
        <rect width="900" height="675" fill="#15120f"/>
        <rect x="54" y="54" width="792" height="567" rx="26" fill="url(#g)" opacity="0.95"/>
        <text x="450" y="318" text-anchor="middle" fill="#fff" font-size="48" font-family="Arial, sans-serif" font-weight="700">${escapeHtml(label)}</text>
        <text x="450" y="382" text-anchor="middle" fill="#fff" font-size="30" font-family="Arial, sans-serif">BergBite Berlin</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function persistCart() {
    writeJson(STORAGE.cart, state.cart);
  }

  function persistFavorites() {
    writeJson(STORAGE.favorites, [...state.favorites]);
  }

  function persistOrders() {
    writeJson(STORAGE.orders, state.orders);
    writeText(STORAGE.activeOrder, state.activeOrderId);
  }

  function renderProducts() {
    if (state.isLoading) return;
    try {
      dom.menuError.hidden = true;
      const activeFilters = new Set(dom.filterInputs.filter((input) => input.checked).map((input) => input.dataset.filter));
      const query = normalize(state.query);

      let visible = products.filter((product) => {
        const haystack = normalize([
          product.title,
          product.description,
          product.tags.join(" "),
          categories[product.category]
        ].join(" "));
        const categoryMatch = state.category === "all" || product.category === state.category;
        const queryMatch = !query || haystack.includes(query);
        const filtersMatch =
          (!activeFilters.has("discount") || product.discount > 0) &&
          (!activeFilters.has("popular") || product.popular) &&
          (!activeFilters.has("vegetarian") || product.vegetarian) &&
          (!activeFilters.has("spicy") || product.spicy) &&
          (!activeFilters.has("favorites") || state.favorites.has(product.id));

        return categoryMatch && queryMatch && filtersMatch;
      });

      visible = sortProducts(visible);
      dom.productGrid.innerHTML = visible.map(productCard).join("");
      dom.emptyState.hidden = visible.length !== 0;
      setupImageFallbacks();
    } catch (error) {
      console.error(error);
      dom.productGrid.innerHTML = "";
      dom.emptyState.hidden = true;
      dom.menuError.hidden = false;
    }
  }

  function sortProducts(list) {
    const copy = [...list];
    if (state.sort === "rating") {
      copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (state.sort === "price-asc") {
      copy.sort((a, b) => basePrice(a) - basePrice(b));
    } else if (state.sort === "price-desc") {
      copy.sort((a, b) => basePrice(b) - basePrice(a));
    } else {
      copy.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating || a.price - b.price);
    }
    return copy;
  }

  function productCard(product) {
    const sale = basePrice(product);
    const favorited = state.favorites.has(product.id);
    const selectedCount = cartQuantityFor(product.id);
    const tags = [
      product.popular ? "Popular" : "",
      product.spicy ? "Spicy" : "",
      product.vegetarian ? "Vegetarian" : "",
      ...product.tags.slice(0, 2)
    ].filter(Boolean);

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" width="900" height="675" loading="lazy" decoding="async" data-fallback="${fallbackImage(product.title)}">
          ${product.discount ? `<span class="discount-ribbon">${number(product.discount)}% off</span>` : ""}
          <button class="favorite-button ${favorited ? "is-active" : ""}" type="button" data-toggle-favorite="${escapeHtml(product.id)}" aria-pressed="${favorited}" aria-label="${favorited ? "Remove from favorites" : "Add to favorites"}">♡</button>
        </div>
        <div class="product-body">
          <div class="card-meta">
            <span>${categories[product.category]}</span>
            <span>★ ${number(product.rating)} (${number(product.reviews)})</span>
            <span>${product.prep}</span>
          </div>
          <h3 class="product-title">${escapeHtml(product.title)}</h3>
          <p class="product-description">${escapeHtml(product.description)}</p>
          <div class="tag-row">${tags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="price-row">
            <strong class="current-price">${price(sale)}</strong>
            ${product.discount ? `<span class="old-price">${price(product.price)}</span>` : ""}
          </div>
          <div class="product-actions">
            <button class="details-button" type="button" data-open-product="${escapeHtml(product.id)}">Details</button>
            <button class="add-button" type="button" data-quick-add="${escapeHtml(product.id)}">${selectedCount ? `${number(selectedCount)} in cart` : "Quick add"}</button>
          </div>
        </div>
      </article>
    `;
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img[data-fallback]").forEach((image) => {
      image.addEventListener("error", () => {
        const fallback = image.getAttribute("data-fallback");
        if (fallback && image.src !== fallback) {
          image.src = fallback;
        }
      }, { once: true });
    });
  }

  function renderCart() {
    const count = itemCount();
    dom.cartCounts.forEach((element) => {
      element.textContent = number(count);
    });
    dom.favoriteCount.textContent = number(state.favorites.size);

    const totals = calculateTotals();
    dom.stickyTotal.textContent = count ? price(totals.total) : "Your cart is empty";
    dom.cartItems.innerHTML = cartItemsHtml(true);
    dom.summaryItems.innerHTML = cartItemsHtml(false);
    dom.totals.innerHTML = totalsHtml(totals);
    dom.drawerTotals.innerHTML = totalsHtml(totals);
    updatePromoMessage(totals);
    persistCart();
  }

  function cartItemsHtml(withControls) {
    if (!state.cart.length) {
      return `<div class="empty-inline">Your cart is empty. Choose something delicious from the menu.</div>`;
    }

    return state.cart.map((item) => {
      const toppings = item.toppings.length ? item.toppings.map((topping) => topping.name).join(", ") : "No extras";
      return `
        <div class="${withControls ? "cart-line" : "summary-line"}" data-cart-key="${escapeHtml(item.key)}">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.sizeName)} · ${escapeHtml(toppings)}</small>
            <small>${price(item.unitPrice)} × ${number(item.quantity)}</small>
          </div>
          ${withControls ? `
            <div class="quantity-group" aria-label="Quantity for ${escapeHtml(item.title)}">
              <button type="button" data-cart-dec="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
              <span>${number(item.quantity)}</span>
              <button type="button" data-cart-inc="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" data-cart-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.title)}">Remove</button>
          ` : `
            <button type="button" data-cart-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.title)}">Remove</button>
          `}
        </div>
      `;
    }).join("");
  }

  function calculateTotals() {
    const subtotal = cartSubtotal();
    const fulfillment = selectedFulfillment();
    const deliveryFee = !subtotal || fulfillment === "pickup" ? 0 : (subtotal >= 4500 ? 0 : 390);
    const serviceFee = subtotal ? Math.max(90, Math.round(subtotal * 0.025)) : 0;
    const promo = calculatePromo(subtotal, fulfillment);
    const total = Math.max(0, subtotal - promo.amount + deliveryFee + serviceFee);
    return {
      subtotal,
      drinksSubtotal: categorySubtotal("drinks"),
      fulfillment,
      deliveryFee,
      serviceFee,
      promo,
      total
    };
  }

  function calculatePromo(subtotal, fulfillment) {
    const code = state.promoCode.trim().toUpperCase();
    if (!code) return { code: "", amount: 0, message: "", error: "" };
    const rule = promoRules[code];
    if (!rule) return { code, amount: 0, message: "This promo code is not valid.", error: "invalid" };
    if (!subtotal) return { code, amount: 0, message: "Add items to your cart before using a promo code.", error: "empty" };
    if (subtotal < rule.min) {
      return { code, amount: 0, message: `Minimum basket for this code is ${price(rule.min)}.`, error: "minimum" };
    }
    const context = { subtotal, drinksSubtotal: categorySubtotal("drinks"), fulfillment };
    const validation = rule.validate?.(context);
    if (typeof validation === "string") {
      return { code, amount: 0, message: validation, error: "condition" };
    }
    const amount = Math.min(rule.apply(context), subtotal);
    return { code, amount, message: `${rule.label} applied.`, error: "" };
  }

  function totalsHtml(totals) {
    return `
      <div><dt>Items</dt><dd>${price(totals.subtotal)}</dd></div>
      <div><dt>Service fee</dt><dd>${price(totals.serviceFee)}</dd></div>
      <div><dt>${totals.fulfillment === "pickup" ? "Pickup" : "Delivery"}</dt><dd>${totals.deliveryFee ? price(totals.deliveryFee) : "Free"}</dd></div>
      <div><dt>Discount</dt><dd>${totals.promo.amount ? `− ${price(totals.promo.amount)}` : price(0)}</dd></div>
      <div class="total"><dt>Total</dt><dd>${price(totals.total)}</dd></div>
    `;
  }

  function updatePromoMessage(totals = calculateTotals()) {
    const message = totals.promo.message;
    dom.promoMessage.textContent = message;
    dom.promoMessage.classList.toggle("is-error", Boolean(totals.promo.error));
    if (state.promoCode && dom.promoInput.value.toUpperCase() !== state.promoCode) {
      dom.promoInput.value = state.promoCode;
    }
  }

  function applyPromo(code, notify = true) {
    state.promoCode = String(code || "").trim().toUpperCase();
    writeText(STORAGE.promo, state.promoCode);
    const totals = calculateTotals();
    renderCart();
    if (!state.promoCode) {
      if (notify) showToast("Promo code cleared.");
      return;
    }
    if (notify) {
      showToast(totals.promo.error ? totals.promo.message : `Promo code ${state.promoCode} applied.`);
    }
  }

  function addToCart(product, sizeId, toppingIds, quantity) {
    const size = sizeById(product, sizeId);
    const selectedToppings = product.toppings.filter((topping) => toppingIds.has(topping.id));
    const unitPrice = basePrice(product) + size.delta + selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    const key = makeCartKey(product.id, size.id, selectedToppings.map((topping) => topping.id));
    const existing = state.cart.find((item) => item.key === key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({
        key,
        productId: product.id,
        title: product.title,
        sizeName: size.name,
        sizeDelta: size.delta,
        toppings: selectedToppings,
        quantity,
        unitPrice,
        addedAt: new Date().toISOString()
      });
    }

    renderCart();
    renderProducts();
    showToast(`${product.title} added to cart.`);
  }

  function updateCartQuantity(key, delta) {
    const item = state.cart.find((entry) => entry.key === key);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((entry) => entry.key !== key);
    }
    renderCart();
    renderProducts();
  }

  function removeCartItem(key) {
    const item = state.cart.find((entry) => entry.key === key);
    state.cart = state.cart.filter((entry) => entry.key !== key);
    renderCart();
    renderProducts();
    if (item) showToast(`${item.title} removed.`);
  }

  function clearCart() {
    if (!state.cart.length) return;
    state.cart = [];
    state.promoCode = "";
    writeText(STORAGE.promo, "");
    dom.promoInput.value = "";
    renderCart();
    renderProducts();
    showToast("Cart emptied.");
  }

  function toggleFavorite(productId) {
    const product = productById(productId);
    if (!product) return;
    if (state.favorites.has(productId)) {
      state.favorites.delete(productId);
      showToast(`${product.title} removed from favorites.`);
    } else {
      state.favorites.add(productId);
      showToast(`${product.title} added to favorites.`);
    }
    persistFavorites();
    renderProducts();
    renderCart();
    if (state.modal.productId === productId) renderProductModal();
  }

  function openCart() {
    window.clearTimeout(drawerCloseTimer);
    dom.drawerOverlay.hidden = false;
    dom.cartDrawer.style.right = "0";
    dom.cartDrawer.style.visibility = "visible";
    dom.cartDrawer.style.pointerEvents = "auto";
    dom.cartDrawer.classList.add("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    document.querySelector("[data-close-cart]")?.focus({ preventScroll: true });
  }

  function closeCart() {
    dom.cartDrawer.classList.remove("is-open");
    dom.cartDrawer.setAttribute("aria-hidden", "true");
    dom.drawerOverlay.hidden = true;
    document.body.classList.remove("drawer-open");
    dom.cartDrawer.style.right = "-100vw";
    dom.cartDrawer.style.pointerEvents = "none";
    drawerCloseTimer = window.setTimeout(() => {
      if (!dom.cartDrawer.classList.contains("is-open")) {
        dom.cartDrawer.style.visibility = "hidden";
      }
    }, 260);
  }

  function openProduct(productId) {
    const product = productById(productId);
    if (!product) return;
    state.modal.productId = productId;
    state.modal.sizeId = product.sizes[0].id;
    state.modal.toppings = new Set();
    state.modal.quantity = 1;
    renderProductModal();
    dom.productOverlay.hidden = false;
    dom.productModal.classList.add("is-open");
    dom.productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.querySelector("[data-close-product]")?.focus({ preventScroll: true });
  }

  function closeProduct() {
    dom.productModal.classList.remove("is-open");
    dom.productModal.setAttribute("aria-hidden", "true");
    dom.productOverlay.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function modalPrice(product) {
    const size = sizeById(product, state.modal.sizeId);
    const toppings = product.toppings.filter((topping) => state.modal.toppings.has(topping.id));
    const unit = basePrice(product) + size.delta + toppings.reduce((sum, topping) => sum + topping.price, 0);
    return unit * state.modal.quantity;
  }

  function renderProductModal() {
    const product = productById(state.modal.productId);
    if (!product) return;
    const favorited = state.favorites.has(product.id);
    const sizeButtons = product.sizes.map((size) => `
      <button class="option-button ${size.id === state.modal.sizeId ? "is-selected" : ""}" type="button" data-modal-size="${escapeHtml(size.id)}">
        ${escapeHtml(size.name)}
        ${size.delta ? `<small>${signedPrice(size.delta)}</small>` : ""}
      </button>
    `).join("");
    const toppingOptions = product.toppings.map((topping) => `
      <label class="topping-option">
        <input type="checkbox" data-modal-topping="${escapeHtml(topping.id)}" ${state.modal.toppings.has(topping.id) ? "checked" : ""}>
        <span>${escapeHtml(topping.name)} · ${price(topping.price)}</span>
      </label>
    `).join("");

    dom.productModalBody.innerHTML = `
      <div class="modal-product">
        <div class="modal-image">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" width="900" height="675" data-fallback="${fallbackImage(product.title)}">
        </div>
        <div class="modal-details">
          <div>
            <p class="eyebrow dark">${categories[product.category]} · ★ ${number(product.rating)} from ${number(product.reviews)} reviews</p>
            <h2 id="product-modal-title">${escapeHtml(product.title)}</h2>
            <p>${escapeHtml(product.description)}</p>
          </div>
          <div class="tag-row">
            ${product.tags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
            ${product.discount ? `<span class="tag-pill">${number(product.discount)}% off</span>` : ""}
          </div>
          <div class="option-group">
            <strong>Size</strong>
            <div class="option-list">${sizeButtons}</div>
          </div>
          <div class="option-group">
            <strong>Extras</strong>
            <div class="option-list">${toppingOptions}</div>
          </div>
          <button class="outline-action" type="button" data-toggle-favorite="${escapeHtml(product.id)}">
            ${favorited ? "Remove from favorites" : "Add to favorites"}
          </button>
          <div class="modal-footer">
            <div class="modal-price">
              <span>Selection total</span>
              <strong data-modal-price>${price(modalPrice(product))}</strong>
            </div>
            <div class="modal-actions">
              <div class="modal-qty" aria-label="Quantity">
                <button type="button" data-modal-dec aria-label="Decrease quantity">−</button>
                <span data-modal-qty>${number(state.modal.quantity)}</span>
                <button type="button" data-modal-inc aria-label="Increase quantity">+</button>
              </div>
              <button class="add-modal-button" type="button" data-modal-add>Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
    setupImageFallbacks();
  }

  function updateModalTotals() {
    const product = productById(state.modal.productId);
    if (!product) return;
    dom.productModalBody.querySelector("[data-modal-price]").textContent = price(modalPrice(product));
    dom.productModalBody.querySelector("[data-modal-qty]").textContent = number(state.modal.quantity);
  }

  function renderFormOptions() {
    const branchSelect = dom.checkoutForm.elements.branch;
    branchSelect.innerHTML = branches.map((branch) => `<option value="${branch.id}">${branch.name}</option>`).join("");
    updateBranchNote();

    const savedAddressSelect = dom.checkoutForm.elements.savedAddress;
    savedAddressSelect.innerHTML = savedAddresses.map((address) => `<option value="${address.id}">${address.label}</option>`).join("");

    const timeSelect = dom.checkoutForm.elements.deliveryTime;
    const slots = [];
    for (let hour = 11; hour <= 23; hour += 1) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
    timeSelect.innerHTML = slots.map((slot) => `<option value="${slot}">${slot}</option>`).join("");

    const dateInput = dom.checkoutForm.elements.deliveryDate;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  function updateBranchNote() {
    const branch = branches.find((item) => item.id === dom.checkoutForm.elements.branch.value) || branches[0];
    dom.branchNote.textContent = `${branch.address} · delivery about ${number(branch.deliveryTime)} min · pickup about ${number(branch.pickupTime)} min`;
  }

  function updateCheckoutVisibility() {
    const form = dom.checkoutForm;
    const fulfillment = form.elements.fulfillment.value;
    const scheduleMode = form.elements.scheduleMode.value;
    const payment = form.elements.payment.value;
    const isDelivery = fulfillment === "delivery";
    const isScheduled = scheduleMode === "scheduled";
    const isOnline = payment === "online";

    dom.addressFieldset.hidden = !isDelivery;
    form.elements.address.required = isDelivery;
    dom.scheduledFields.hidden = !isScheduled;
    form.elements.deliveryDate.required = isScheduled;
    form.elements.deliveryTime.required = isScheduled;
    dom.paymentFields.hidden = !isOnline;
    form.elements.cardNumber.required = isOnline;
    form.elements.cardExpiry.required = isOnline;
    form.elements.cardCvv.required = isOnline;

    renderCart();
  }

  function validateCheckout() {
    const form = dom.checkoutForm;
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = [];
    const totals = calculateTotals();
    const phoneDigits = String(data.phone || "").replace(/[^\d+]/g, "");
    if (!state.cart.length) errors.push("Your cart is empty.");
    if (!data.branch) errors.push("Select a branch.");
    if (!data.fullName || data.fullName.trim().length < 3) errors.push("Enter your full name.");
    if (!/^(\+49|0)[\d\s-]{8,16}$/.test(String(data.phone || "").trim()) || phoneDigits.replace(/\D/g, "").length < 10) {
      errors.push("Enter a valid German mobile number.");
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Enter a valid email address.");
    if (data.fulfillment === "delivery" && (!data.address || data.address.trim().length < 10)) {
      errors.push("Enter the full delivery address.");
    }
    if (data.scheduleMode === "scheduled") {
      if (!data.deliveryDate || !data.deliveryTime) {
        errors.push("Select a delivery date and time.");
      } else {
        const requested = new Date(`${data.deliveryDate}T${data.deliveryTime}:00`);
        const now = new Date();
        if (requested.getTime() < now.getTime() + 45 * 60 * 1000) {
          errors.push("Scheduled orders must be at least 45 minutes from now.");
        }
      }
    }
    if (data.payment === "online") {
      const cardNumber = String(data.cardNumber || "").replace(/\D/g, "");
      const cardCvv = String(data.cardCvv || "").replace(/\D/g, "");
      if (cardNumber.length !== 16) errors.push("The demo card number must contain 16 digits.");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(data.cardExpiry || "").trim())) errors.push("Enter the expiry date as MM/YY.");
      if (cardCvv.length < 3 || cardCvv.length > 4) errors.push("CVV must contain 3 or 4 digits.");
    }
    if (totals.promo.error) errors.push(totals.promo.message);
    return { errors, data, totals };
  }

  function setSubmitLoading(loading) {
    const button = dom.checkoutForm.querySelector(".submit-order");
    button.disabled = loading;
    dom.submitLoader.hidden = !loading;
    dom.submitLabel.textContent = loading ? "Processing mock payment..." : "Mock pay and place order";
  }

  function placeOrder(event) {
    event.preventDefault();
    const validation = validateCheckout();
    if (validation.errors.length) {
      dom.formErrors.hidden = false;
      dom.formErrors.innerHTML = validation.errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("");
      dom.formErrors.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    dom.formErrors.hidden = true;
    setSubmitLoading(true);
    window.setTimeout(() => {
      const branch = branches.find((item) => item.id === validation.data.branch) || branches[0];
      const now = new Date();
      const eta = validation.data.fulfillment === "pickup" ? branch.pickupTime : branch.deliveryTime;
      const scheduleText = validation.data.scheduleMode === "scheduled"
        ? `${validation.data.deliveryDate} at ${validation.data.deliveryTime}`
        : `about ${number(eta)} minutes`;
      const order = {
        id: `BB-${String(Date.now()).slice(-6)}`,
        createdAt: now.toISOString(),
        statusIndex: 0,
        items: clone(state.cart),
        totals: validation.totals,
        promoCode: state.promoCode,
        fulfillment: validation.data.fulfillment,
        branch,
        address: validation.data.fulfillment === "delivery" ? validation.data.address.trim() : branch.address,
        scheduleText,
        customer: {
          fullName: validation.data.fullName.trim(),
          phone: validation.data.phone.trim(),
          email: validation.data.email.trim(),
          notes: validation.data.notes.trim()
        },
        payment: validation.data.payment,
        paymentLabel: validation.data.payment === "online" ? "Mock bank card payment" : "Pay on delivery"
      };

      state.orders.unshift(order);
      state.activeOrderId = order.id;
      state.cart = [];
      state.promoCode = "";
      dom.promoInput.value = "";
      writeText(STORAGE.promo, "");
      persistOrders();
      renderCart();
      renderProducts();
      renderTracking();
      renderHistory();
      setSubmitLoading(false);
      closeCart();
      showToast(`Order ${order.id} placed.`);
      document.querySelector("#tracking").scrollIntoView({ behavior: "smooth", block: "start" });
      formResetAfterOrder();
    }, 900);
  }

  function formResetAfterOrder() {
    const fulfillment = selectedFulfillment();
    const branchId = dom.checkoutForm.elements.branch.value;
    dom.checkoutForm.reset();
    [...dom.checkoutForm.elements.fulfillment].forEach((radio) => {
      radio.checked = radio.value === fulfillment;
    });
    dom.checkoutForm.elements.branch.value = branchId;
    updateBranchNote();
    updateCheckoutVisibility();
  }

  function renderTracking(orderId = state.activeOrderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) {
      dom.trackingCard.innerHTML = `
        <div class="empty-inline">
          No active order yet. After checkout, confirmation and live status steps will appear here.
        </div>
      `;
      return;
    }
    state.activeOrderId = order.id;
    writeText(STORAGE.activeOrder, state.activeOrderId);
    const status = statusSteps[order.statusIndex] || statusSteps[0];
    dom.trackingCard.innerHTML = `
      <h3>Order ${escapeHtml(order.id)}</h3>
      <p>${escapeHtml(status.text)} Delivery window: ${escapeHtml(order.scheduleText)}.</p>
      <p><strong>${escapeHtml(order.branch.name)}</strong> · ${order.fulfillment === "pickup" ? "Pickup" : "Delivery"}</p>
      <div class="tracking-steps">
        ${statusSteps.map((step, index) => `
          <div class="tracking-step ${index < order.statusIndex ? "is-complete" : ""} ${index === order.statusIndex ? "is-active" : ""}">
            <div>
              <strong>${escapeHtml(step.label)}</strong>
              <small>${escapeHtml(step.text)}</small>
            </div>
          </div>
        `).join("")}
      </div>
      <footer>
        <button type="button" data-advance-order="${escapeHtml(order.id)}" ${order.statusIndex >= statusSteps.length - 1 ? "disabled" : ""}>Advance status</button>
        <button type="button" data-reorder="${escapeHtml(order.id)}">Order again</button>
      </footer>
    `;
  }

  function advanceOrder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order || order.statusIndex >= statusSteps.length - 1) return;
    order.statusIndex += 1;
    persistOrders();
    renderTracking(orderId);
    renderHistory();
    showToast(`Order ${order.id} status updated.`);
  }

  function reorder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;
    order.items.forEach((item) => {
      const existing = state.cart.find((entry) => entry.key === item.key);
      if (existing) existing.quantity += item.quantity;
      else state.cart.push(clone(item));
    });
    renderCart();
    renderProducts();
    showToast(`Items from order ${order.id} were added to your cart.`);
    openCart();
  }

  function renderHistory() {
    if (!state.orders.length) {
      dom.historyList.innerHTML = `<div class="empty-inline">Order history on this device is empty.</div>`;
      return;
    }
    dom.historyList.innerHTML = state.orders.map((order) => {
      const items = order.items.map((item) => `${item.title} × ${number(item.quantity)}`).join(", ");
      const status = statusSteps[order.statusIndex]?.label || statusSteps[0].label;
      return `
        <article class="history-item">
          <header>
            <div>
              <strong>${escapeHtml(order.id)}</strong>
              <p>${dateFormatter.format(new Date(order.createdAt))}</p>
            </div>
            <strong>${price(order.totals.total)}</strong>
          </header>
          <p>${escapeHtml(items)}</p>
          <p>${escapeHtml(status)} · ${escapeHtml(order.paymentLabel)}</p>
          <div class="product-actions">
            <button type="button" data-track-order="${escapeHtml(order.id)}">Track</button>
            <button type="button" data-reorder="${escapeHtml(order.id)}">Order again</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function showFavorites() {
    const favoritesFilter = dom.filterInputs.find((input) => input.dataset.filter === "favorites");
    if (favoritesFilter) favoritesFilter.checked = true;
    setCategory("all");
    renderProducts();
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setCategory(category) {
    state.category = category;
    dom.categoryButtons.forEach((button) => {
      const active = button.dataset.category === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function clearFilters() {
    state.query = "";
    dom.search.value = "";
    state.sort = "featured";
    dom.sort.value = "featured";
    setCategory("all");
    dom.filterInputs.forEach((input) => {
      input.checked = false;
    });
    renderProducts();
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    dom.toastRegion.appendChild(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function attachEvents() {
    window.addEventListener("scroll", () => {
      dom.header.classList.toggle("is-scrolled", window.scrollY > 10);
    }, { passive: true });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      if (!target) return;

      const scrollTarget = target.closest("[data-scroll-target]");
      if (scrollTarget) {
        document.querySelector(scrollTarget.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      const promoButton = target.closest("[data-apply-promo]");
      if (promoButton) applyPromo(promoButton.dataset.applyPromo);

      const openCartButton = target.closest("[data-open-cart]");
      if (openCartButton) openCart();

      if (target.closest("[data-close-cart]") || target === dom.drawerOverlay) closeCart();

      if (target.closest("[data-cart-checkout]")) {
        closeCart();
        document.querySelector("#checkout").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (target.closest("[data-clear-cart]")) clearCart();

      const favoriteButton = target.closest("[data-toggle-favorite]");
      if (favoriteButton) toggleFavorite(favoriteButton.dataset.toggleFavorite);

      const favoritesButton = target.closest("[data-open-favorites]");
      if (favoritesButton) showFavorites();

      const openProductButton = target.closest("[data-open-product]");
      if (openProductButton) openProduct(openProductButton.dataset.openProduct);

      const quickAddButton = target.closest("[data-quick-add]");
      if (quickAddButton) {
        const product = productById(quickAddButton.dataset.quickAdd);
        if (product) addToCart(product, product.sizes[0].id, new Set(), 1);
      }

      const increment = target.closest("[data-cart-inc]");
      if (increment) updateCartQuantity(increment.dataset.cartInc, 1);

      const decrement = target.closest("[data-cart-dec]");
      if (decrement) updateCartQuantity(decrement.dataset.cartDec, -1);

      const remove = target.closest("[data-cart-remove]");
      if (remove) removeCartItem(remove.dataset.cartRemove);

      const closeProductButton = target.closest("[data-close-product]");
      if (closeProductButton || target === dom.productOverlay) closeProduct();

      const modalSize = target.closest("[data-modal-size]");
      if (modalSize) {
        state.modal.sizeId = modalSize.dataset.modalSize;
        renderProductModal();
      }

      if (target.closest("[data-modal-inc]")) {
        state.modal.quantity = Math.min(20, state.modal.quantity + 1);
        updateModalTotals();
      }

      if (target.closest("[data-modal-dec]")) {
        state.modal.quantity = Math.max(1, state.modal.quantity - 1);
        updateModalTotals();
      }

      if (target.closest("[data-modal-add]")) {
        const product = productById(state.modal.productId);
        if (product) {
          addToCart(product, state.modal.sizeId, state.modal.toppings, state.modal.quantity);
          closeProduct();
          openCart();
        }
      }

      const advance = target.closest("[data-advance-order]");
      if (advance) advanceOrder(advance.dataset.advanceOrder);

      const track = target.closest("[data-track-order]");
      if (track) {
        renderTracking(track.dataset.trackOrder);
        document.querySelector("#tracking").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      const reorderButton = target.closest("[data-reorder]");
      if (reorderButton) reorder(reorderButton.dataset.reorder);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeCart();
      closeProduct();
    });

    dom.productModalBody.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches("[data-modal-topping]")) return;
      if (target.checked) state.modal.toppings.add(target.dataset.modalTopping);
      else state.modal.toppings.delete(target.dataset.modalTopping);
      updateModalTotals();
    });

    dom.search.addEventListener("input", () => {
      state.query = dom.search.value;
      renderProducts();
    });

    dom.sort.addEventListener("change", () => {
      state.sort = dom.sort.value;
      renderProducts();
    });

    dom.categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setCategory(button.dataset.category);
        renderProducts();
      });
    });

    dom.filterInputs.forEach((input) => {
      input.addEventListener("change", renderProducts);
    });

    document.querySelector("[data-clear-filters]").addEventListener("click", clearFilters);
    document.querySelector("[data-retry-menu]").addEventListener("click", () => {
      dom.menuError.hidden = true;
      renderProducts();
    });

    document.querySelector("[data-apply-promo-from-input]").addEventListener("click", () => {
      applyPromo(dom.promoInput.value);
    });

    dom.promoInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyPromo(dom.promoInput.value);
      }
    });

    dom.checkoutForm.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("[name='fulfillment'], [name='scheduleMode'], [name='payment']")) {
        updateCheckoutVisibility();
      }
      if (target.matches("[name='branch']")) {
        updateBranchNote();
      }
      if (target.matches("[name='savedAddress']")) {
        const address = savedAddresses.find((item) => item.id === dom.checkoutForm.elements.savedAddress.value);
        dom.checkoutForm.elements.address.value = address?.value || "";
      }
    });

    dom.checkoutForm.addEventListener("submit", placeOrder);

    dom.trackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = new FormData(dom.trackForm).get("orderId")?.toString().trim();
      const order = state.orders.find((item) => item.id.toLowerCase() === id?.toLowerCase());
      if (!order) {
        showToast("No order was found for this code.");
        return;
      }
      renderTracking(order.id);
    });
  }

  function hydrateCartFromStorage() {
    state.cart = state.cart
      .filter((item) => productById(item.productId) && item.quantity > 0)
      .map((item) => ({
        ...item,
        quantity: Math.min(20, Math.max(1, Number(item.quantity) || 1)),
        toppings: Array.isArray(item.toppings) ? item.toppings : []
      }));
  }

  function init() {
    renderFormOptions();
    hydrateCartFromStorage();
    attachEvents();
    updateCheckoutVisibility();
    renderHistory();
    renderTracking();
    dom.promoInput.value = state.promoCode;

    window.setTimeout(() => {
      state.isLoading = false;
      dom.menuLoading.hidden = true;
      renderProducts();
      renderCart();
    }, 550);
  }

  init();
})();
