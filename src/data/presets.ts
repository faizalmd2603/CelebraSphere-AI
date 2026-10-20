import { EventPlan } from '../types/event';

export const WEDDING_PRESET: EventPlan = {
  id: 'preset-wedding-aarav-meera',
  title: "Aarav & Meera's Royal Coastal Wedding",
  vertical: 'wedding',
  eventDate: '2026-12-05',
  daysRemaining: 45,
  venueName: 'Mahabalipuram Beach Resort & Mandap Pavilion',
  venueType: 'hybrid',
  guestCount: 180,
  currency: 'INR',
  totalBudget: 1800000, // ₹18,00,000 (~$22,000 USD)
  contingencyPercentage: 10,
  priorityPillars: ['Culinary Excellence & Traditional Sadhya', 'Coastal Floral Mandap Aesthetic'],
  budgetPriorityMode: 'culinary-first',
  
  categories: [
    { id: 'cat-venue', name: 'Venue & Accommodation', allocatedPercentage: 25, allocatedAmount: 450000, spentAmount: 450000, color: '#3b82f6' },
    { id: 'cat-catering', name: 'Catering & Beverages', allocatedPercentage: 30, allocatedAmount: 540000, spentAmount: 560000, color: '#10b981' },
    { id: 'cat-decor', name: 'Floral Decor & Mandap', allocatedPercentage: 18, allocatedAmount: 324000, spentAmount: 310000, color: '#ec4899' },
    { id: 'cat-photo', name: 'Photography & Cinema', allocatedPercentage: 12, allocatedAmount: 216000, spentAmount: 216000, color: '#8b5cf6' },
    { id: 'cat-entertainment', name: 'Live Music & Nadaswaram', allocatedPercentage: 5, allocatedAmount: 90000, spentAmount: 75000, color: '#f59e0b' },
    { id: 'cat-contingency', name: 'Emergency Contingency Reserve', allocatedPercentage: 10, allocatedAmount: 180000, spentAmount: 0, color: '#64748b' },
  ],

  budgetItems: [
    {
      id: 'b-venue-1',
      name: 'Resort Lawn & Indoor AC Ballroom 2-Day Hire',
      category: 'Venue & Accommodation',
      costType: 'fixed',
      unitCost: 450000,
      quantity: 1,
      estimatedAmount: 450000,
      actualAmount: 450000,
      paidAmount: 225000,
      notes: '50% advance cleared; balance due on check-in day.'
    },
    {
      id: 'b-catering-1',
      name: 'Grand South Indian Banana-Leaf Sadhya (Lunch)',
      category: 'Catering & Beverages',
      costType: 'variable',
      unitCost: 1800,
      quantity: 180,
      estimatedAmount: 324000,
      actualAmount: 342000,
      paidAmount: 150000,
      notes: 'Includes 28 authentic dishes, live payasam counters, and filtered coffee station.'
    },
    {
      id: 'b-catering-2',
      name: 'Evening High Tea & Coastal Cocktail Appetizers',
      category: 'Catering & Beverages',
      costType: 'variable',
      unitCost: 1100,
      quantity: 180,
      estimatedAmount: 198000,
      actualAmount: 218000,
      paidAmount: 100000,
      notes: 'Expanded live chaat and mocktail bar requested.'
    },
    {
      id: 'b-decor-1',
      name: 'Eco-Friendly Jasmine & Marigold Mandap Architecture',
      category: 'Floral Decor & Mandap',
      costType: 'fixed',
      unitCost: 220000,
      quantity: 1,
      estimatedAmount: 220000,
      actualAmount: 220000,
      paidAmount: 110000,
      notes: '100% biodegradable floral hangings and brass temple lamp props.'
    },
    {
      id: 'b-decor-2',
      name: 'Beachside Lawn Fairy Light Canopy & Seating Drapery',
      category: 'Floral Decor & Mandap',
      costType: 'fixed',
      unitCost: 104000,
      quantity: 1,
      estimatedAmount: 104000,
      actualAmount: 90000,
      paidAmount: 50000,
      notes: 'Contract negotiated with in-house resort partner.'
    },
    {
      id: 'b-photo-1',
      name: 'Candid Photography & 4K Drone Cinema Package',
      category: 'Photography & Cinema',
      costType: 'fixed',
      unitCost: 216000,
      quantity: 1,
      estimatedAmount: 216000,
      actualAmount: 216000,
      paidAmount: 108000,
      notes: 'Lead photographer + 2 candid shooters + drone pilot.'
    },
    {
      id: 'b-music-1',
      name: 'Traditional Nadaswaram Ensemble + Evening Acoustic Band',
      category: 'Live Music & Nadaswaram',
      costType: 'fixed',
      unitCost: 90000,
      quantity: 1,
      estimatedAmount: 90000,
      actualAmount: 75000,
      paidAmount: 40000,
      notes: 'Morning auspicious raagas and sundown acoustic fusion set.'
    },
  ],

  checklistTasks: [
    {
      id: 't-1',
      title: 'Confirm coastal weather backup marquee tent with resort management',
      category: 'Venue & Logistics',
      planningWindow: '1m_out',
      priority: 'critical',
      dueDate: '2026-11-10',
      completed: true,
      owner: 'Aarav (Groom)'
    },
    {
      id: 't-2',
      title: 'Finalize Sadhya 28-item tasting and elderly low-spice food counters',
      category: 'Catering',
      planningWindow: '1m_out',
      priority: 'critical',
      dueDate: '2026-11-15',
      completed: true,
      owner: 'Meera (Bride)'
    },
    {
      id: 't-3',
      title: 'Dispatch physical traditional silk scroll wedding invitations',
      category: 'Invitations',
      planningWindow: '1m_out',
      priority: 'high',
      dueDate: '2026-11-18',
      completed: true,
      owner: 'Meera & Aarav'
    },
    {
      id: 't-4',
      title: 'Audit sound decibel clearance permits for beach lawn past 10:00 PM',
      category: 'Permits & Compliance',
      planningWindow: '3m_out',
      priority: 'critical',
      dueDate: '2026-10-30',
      completed: true,
      owner: 'Wedding Planner Lead'
    },
    {
      id: 't-5',
      title: 'Coordinate airport shuttle schedules for 42 out-of-town guests',
      category: 'Guest Logistics',
      planningWindow: '1w_out',
      priority: 'medium',
      dueDate: '2026-11-28',
      completed: false,
      owner: 'Logistics Coordinator'
    },
    {
      id: 't-6',
      title: 'Rehearse Sangeet dance sequences and confirm wireless stage lapel mics',
      category: 'Entertainment',
      planningWindow: '1w_out',
      priority: 'medium',
      dueDate: '2026-12-01',
      completed: false,
      owner: 'Bridal Party'
    },
    {
      id: 't-7',
      title: 'Pack auspicious ceremonial puja items (Samithu, Deepam oil, Navadhanya)',
      category: 'Rituals',
      planningWindow: 'event_day',
      priority: 'critical',
      dueDate: '2026-12-04',
      completed: false,
      owner: 'Family Elders'
    }
  ],

  runOfShow: [
    {
      id: 'ros-1',
      startTime: '07:00',
      endTime: '08:15',
      durationMinutes: 75,
      title: 'Bridal & Groom Mangala Snanam & Traditional Attire Styling',
      description: 'Sacred pre-wedding blessing bath, sandalwood application, and Kanjeevaram styling.',
      zone: 'Executive Sea-Facing Suites',
      isOutdoor: false,
      owner: 'Styling & Family Elders',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: []
    },
    {
      id: 'ros-2',
      startTime: '08:30',
      endTime: '10:00',
      durationMinutes: 90,
      title: 'Auspicious Muhurtham Rituals & Mangalsutra Dharanam',
      description: 'Lagna Patrika reading, Kanyadaanam, and exchange of holy wedding garlands.',
      zone: 'Beachside Mandap Lawn',
      isOutdoor: true,
      owner: 'Head Priest & Family',
      bufferMinutes: 15,
      isLockedAnchor: true, // AUSPICIOUS ASTROLOGICAL WINDOW - LOCKED ANCHOR
      dependencies: ['ros-1']
    },
    {
      id: 'ros-3',
      startTime: '10:15',
      endTime: '11:45',
      durationMinutes: 90,
      title: 'Saptapadi, Arundhati Viewing & Golden Talambralu Showers',
      description: 'Seven sacred steps around the sacred Agni fire followed by family blessing showers.',
      zone: 'Beachside Mandap Lawn',
      isOutdoor: true,
      owner: 'Head Priest & Couple',
      bufferMinutes: 20,
      isLockedAnchor: false,
      dependencies: ['ros-2']
    },
    {
      id: 'ros-4',
      startTime: '12:05',
      endTime: '13:00',
      durationMinutes: 55,
      title: 'Couple Coastal Golden Hour Portraits & Family Group Photos',
      description: 'Candid photo sessions against Mahabalipuram coastline and heritage temple backdrop.',
      zone: 'Coastal Shoreline Promontory',
      isOutdoor: true,
      owner: 'Lead Cinema Team',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: ['ros-3']
    },
    {
      id: 'ros-5',
      startTime: '13:15',
      endTime: '15:15',
      durationMinutes: 120,
      title: 'Grand Royal Sadhya Feast (Traditional Banana-Leaf Dining)',
      description: '28-course culinary journey served in batches with special seated service for elders.',
      zone: 'Grand Air-Conditioned Dining Pavilion',
      isOutdoor: false,
      owner: 'Master Chef & Service Crew',
      bufferMinutes: 30,
      isLockedAnchor: true, // FIXED CATERING DISPATCH ANCHOR
      dependencies: ['ros-4']
    },
    {
      id: 'ros-6',
      startTime: '18:30',
      endTime: '22:30',
      durationMinutes: 240,
      title: 'Starlight Reception Gala, Live Fusion Band & Celebration Dinner',
      description: 'Cake cutting ceremony, acoustic music set, heartfelt toasts, and celebratory dance floor.',
      zone: 'Palm Grove Amphitheater & Pool Deck',
      isOutdoor: true,
      owner: 'Event Emcee & DJ Lead',
      bufferMinutes: 20,
      isLockedAnchor: false,
      dependencies: ['ros-5']
    }
  ],

  vendors: [
    {
      id: 'v-1',
      name: 'Radisson Resort Temple Bay Mahabalipuram',
      category: 'Venue',
      status: 'deposit_paid',
      contactPerson: 'Suresh Raman',
      contactEmail: 'events@templebayresort.com',
      contactPhone: '+91 98401 23456',
      quotedPrice: 450000,
      depositPaid: 225000,
      balanceDueDate: '2026-12-04',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 92, notes: 'Within initial 25% allocation cap' },
        stylePersonaFit: { score: 98, notes: 'Perfect royal coastal temple architecture' },
        reliabilityTrackRecord: { score: 95, notes: 'Over 120 luxury weddings hosted flawlessly' },
        contractFlexibility: { score: 90, notes: 'Complimentary indoor backup ballroom included' }
      },
      compositeScore: 94,
      notes: 'Contract includes 8 complimentary changing rooms and beach lawn lighting.'
    },
    {
      id: 'v-2',
      name: 'Madras Traditional Catering Consortium',
      category: 'Catering',
      status: 'deposit_paid',
      contactPerson: 'Chef Rangarajan',
      contactEmail: 'catering@madrastraditions.in',
      contactPhone: '+91 98840 98765',
      quotedPrice: 560000,
      depositPaid: 250000,
      balanceDueDate: '2026-12-01',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 86, notes: 'Slight overrun due to added live dessert counters' },
        stylePersonaFit: { score: 99, notes: 'Premier authentic royal Thanjavur Sadhya specialists' },
        reliabilityTrackRecord: { score: 96, notes: '5-star food hygiene certified' },
        contractFlexibility: { score: 88, notes: '+/- 10 guest count headcount adjustment permitted up to 72h' }
      },
      compositeScore: 92,
      notes: 'Agreed on separate dedicated preparation area for Jain and allergy-safe meals.'
    },
    {
      id: 'v-3',
      name: 'Lotus Blossom Botanical & Mandap Designers',
      category: 'Decor & Florals',
      status: 'contract_signed',
      contactPerson: 'Ananya Krishnan',
      contactEmail: 'ananya@lotusbotanical.design',
      contactPhone: '+91 97910 54321',
      quotedPrice: 310000,
      depositPaid: 160000,
      balanceDueDate: '2026-11-25',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 94, notes: '₹14,000 under original cap' },
        stylePersonaFit: { score: 96, notes: 'Exquisite temple bell and fresh jasmine concept' },
        reliabilityTrackRecord: { score: 92, notes: 'Proven portfolio in outdoor seaside setups' },
        contractFlexibility: { score: 89, notes: 'Wind-resistant structural anchors included' }
      },
      compositeScore: 93,
      notes: 'Floral delivery scheduled at 04:00 AM on event day for peak morning freshness.'
    },
    {
      id: 'v-4',
      name: 'Shadows & Sunbeams Cinematic Stories',
      category: 'Photography',
      status: 'deposit_paid',
      contactPerson: 'Karthik Narayanan',
      contactEmail: 'karthik@shadowssunbeams.com',
      contactPhone: '+91 94440 11223',
      quotedPrice: 216000,
      depositPaid: 108000,
      balanceDueDate: '2026-12-05',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 90, notes: 'Exact match with budget allocation' },
        stylePersonaFit: { score: 97, notes: 'Award-winning coastal color grading' },
        reliabilityTrackRecord: { score: 94, notes: 'Dual redundancy camera backups and licensed drone operator' },
        contractFlexibility: { score: 91, notes: 'Same-day 1-minute teaser highlight reel included' }
      },
      compositeScore: 93,
      notes: 'Drone flight clearance logged with coastal aviation authorities.'
    },
    {
      id: 'v-5',
      name: 'BayBreeze Shoreline Acoustic Ensemble',
      category: 'Entertainment',
      status: 'quoted',
      contactPerson: 'David Samuel',
      contactEmail: 'david@baybreezemusic.com',
      contactPhone: '+91 98412 88776',
      quotedPrice: 75000,
      depositPaid: 0,
      balanceDueDate: '2026-11-20',
      isVerified: false, // AI Suggested / Quoted
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: false,
        rainClauseChecked: false,
        depositMilestoneLogged: false
      },
      scoring: {
        budgetAlignment: { score: 95, notes: 'Highly economical for 4-piece band' },
        stylePersonaFit: { score: 88, notes: 'Smooth jazz and Tamil film acoustic covers' },
        reliabilityTrackRecord: { score: 84, notes: '3 seasons of resort residency' },
        contractFlexibility: { score: 80, notes: 'Awaiting formal contract terms' }
      },
      compositeScore: 88,
      notes: 'Requires sound engineering rider verification.'
    }
  ],

  guests: [
    {
      id: 'g-1',
      name: 'Vaidyanathan & Kalyani (Grandparents)',
      group: 'Family',
      rsvpStatus: 'confirmed',
      email: 'kalyani.v@family.org',
      phone: '+91 98400 11111',
      dietaryPreference: 'vegetarian',
      allergies: ['No Garlic / Onion (Jain Style)', 'Mild Spice Only'],
      accessibilityNeeds: ['wheelchair', 'ramp', 'elderly_front_row'],
      tableNumber: 1,
      notes: 'Requires shaded front-row wheelchair seating near Mandap ramp.'
    },
    {
      id: 'g-2',
      name: 'Dr. Siddharth & Dr. Priyamvada',
      group: 'VIP',
      rsvpStatus: 'confirmed',
      email: 'siddharth.m@apollo.org',
      phone: '+91 98840 22222',
      dietaryPreference: 'gluten_free',
      allergies: ['Severe Peanut Allergy'],
      accessibilityNeeds: [],
      tableNumber: 2,
      notes: 'Catering manager notified about strict peanut cross-contamination protocol.'
    },
    {
      id: 'g-3',
      name: 'Vikram Sethi & Friends Group (12 Pax)',
      group: 'Friend',
      rsvpStatus: 'confirmed',
      email: 'vikram.sethi@fintech.io',
      phone: '+91 99620 33333',
      dietaryPreference: 'regular',
      allergies: [],
      accessibilityNeeds: [],
      tableNumber: 4,
      notes: 'Attending afternoon beach volleyball and evening cocktail gala.'
    },
    {
      id: 'g-4',
      name: 'Rohan & Maya (Overseas Cousins)',
      group: 'Family',
      rsvpStatus: 'pending',
      email: 'rohan.us@techgiant.com',
      phone: '+1 415 555 0199',
      dietaryPreference: 'vegan',
      allergies: ['Lactose Intolerant'],
      accessibilityNeeds: ['quiet_space'],
      tableNumber: 3,
      notes: 'Traveling with 9-month-old infant; requires lactation/quiet room access.'
    }
  ],

  creativeIdeas: [
    {
      id: 'idea-1',
      category: 'palette',
      title: 'Royal Coromandel Coastline Palette',
      description: 'A regal synthesis of deep ocean sapphire, temple sanctum antique gold, blush lotus, and emerald coconut palm fronds.',
      tags: ['Traditional', 'Seaside Regal', 'High Contrast'],
      estimatedCostImpact: 0,
      swatches: ['#1e3a8a', '#d4af37', '#fce7f3', '#059669'],
      isAddedToPlan: true
    },
    {
      id: 'idea-2',
      category: 'culinary',
      title: 'Live Elaneer (Tender Coconut) Mocktail & Filter Coffee Bar',
      description: 'Chilled fresh tender coconuts stamped with the couple monogram + steaming brass tumbler Kumbakonam degree coffee on arrival.',
      tags: ['Interactive Culinary', 'Locally Sourced', 'Zero Waste'],
      estimatedCostImpact: 22000,
      isAddedToPlan: false
    },
    {
      id: 'idea-3',
      category: 'rituals',
      title: 'Interactive Guest Sand Blessing Ceremony',
      description: 'Guests layer colored coastal sand into a keepsake hourglass during golden hour to symbolize the blending of two lineages.',
      tags: ['Emotional Keepsake', 'Participatory', 'Photo Highlight'],
      estimatedCostImpact: 8500,
      isAddedToPlan: false
    },
    {
      id: 'idea-4',
      category: 'eco_cost_saving',
      title: 'Zero-Waste Upcycled Banana-Fiber Favor Hampers',
      description: 'Handwoven artisanal palm-leaf bags containing heritage organic seed packets, saving 18% compared to imported plastic gift boxes.',
      tags: ['Eco Sustainability', '18% Cost Reduction', 'Artisan Grounded'],
      estimatedCostImpact: -28000, // Cost saving
      isAddedToPlan: true
    }
  ],

  recentAudits: [
    {
      id: 'audit-init',
      timestamp: '2026-10-20 18:30',
      scenarioName: 'Initial Royal Coastal Wedding Workspace Configuration',
      whatChanged: ['180 Guests baseline initialized', '6 Budget categories established with ₹18,00,000 ceiling', '6 Run-of-Show blocks scheduled with locked Muhurtham anchor'],
      assumptionsMade: ['Weather backup ballroom provisioned at 0 extra surcharge in venue contract', '10% emergency buffer strictly held'],
      needsHumanConfirmation: ['Finalize BayBreeze Shoreline acoustic band contract before Nov 20']
    }
  ]
};

export const BIRTHDAY_PRESET: EventPlan = {
  id: 'preset-birthday-zoya',
  title: "Zoya's 25th Starlight Rooftop Gala",
  vertical: 'birthday',
  eventDate: '2026-11-08',
  daysRemaining: 18,
  venueName: 'SkyDeck Rooftop Lounge & Terrace',
  venueType: 'outdoor',
  guestCount: 65,
  currency: 'INR',
  totalBudget: 150000, // ₹1,50,000 (~$2,500 USD)
  contingencyPercentage: 10,
  priorityPillars: ['Celestial Neon Decor & Lighting', 'Signature Mocktail Curation & Live DJ'],
  budgetPriorityMode: 'decor-vibe',
  
  categories: [
    { id: 'cat-venue', name: 'Rooftop Lounge & Sound Permit', allocatedPercentage: 35, allocatedAmount: 52500, spentAmount: 52500, color: '#3b82f6' },
    { id: 'cat-catering', name: 'Gourmet Tapas & Dessert Table', allocatedPercentage: 32, allocatedAmount: 48000, spentAmount: 51000, color: '#10b981' },
    { id: 'cat-decor', name: 'Celestial Star Neon & Photobooth', allocatedPercentage: 18, allocatedAmount: 27000, spentAmount: 26000, color: '#ec4899' },
    { id: 'cat-entertainment', name: 'Live DJ & Visual Projection', allocatedPercentage: 8, allocatedAmount: 12000, spentAmount: 12000, color: '#8b5cf6' },
    { id: 'cat-contingency', name: 'Emergency Contingency Reserve', allocatedPercentage: 7, allocatedAmount: 10500, spentAmount: 0, color: '#64748b' }
  ],

  budgetItems: [
    {
      id: 'b-bday-1',
      name: 'SkyDeck Private Terrace 5-Hour Exclusive Hire',
      category: 'Rooftop Lounge & Sound Permit',
      costType: 'fixed',
      unitCost: 45000,
      quantity: 1,
      estimatedAmount: 45000,
      actualAmount: 45000,
      paidAmount: 45000,
      notes: 'Full payment completed.'
    },
    {
      id: 'b-bday-2',
      name: 'Artisan Tapas & Mini Sliders (Per Guest)',
      category: 'Gourmet Tapas & Dessert Table',
      costType: 'variable',
      unitCost: 650,
      quantity: 65,
      estimatedAmount: 42250,
      actualAmount: 45000,
      paidAmount: 25000,
      notes: 'Includes truffle fries, gourmet skewers, and mini sliders.'
    },
    {
      id: 'b-bday-3',
      name: '3-Tier Midnight Mirror-Glaze Cake',
      category: 'Gourmet Tapas & Dessert Table',
      costType: 'fixed',
      unitCost: 6000,
      quantity: 1,
      estimatedAmount: 6000,
      actualAmount: 6000,
      paidAmount: 6000,
      notes: 'Belgian dark chocolate with edible gold leaf.'
    },
    {
      id: 'b-bday-4',
      name: 'Custom Neon "Zoya @ 25" & Iridescent Shimmer Wall',
      category: 'Celestial Star Neon & Photobooth',
      costType: 'fixed',
      unitCost: 18000,
      quantity: 1,
      estimatedAmount: 18000,
      actualAmount: 18000,
      paidAmount: 10000,
      notes: 'Includes 360-degree rotating selfie video booth.'
    }
  ],

  checklistTasks: [
    {
      id: 't-b1',
      title: 'Confirm custom mirror-glaze cake delivery window (18:00 sharp)',
      category: 'Dessert',
      planningWindow: '1w_out',
      priority: 'critical',
      dueDate: '2026-11-06',
      completed: true,
      owner: 'Zoya'
    },
    {
      id: 't-b2',
      title: 'Submit rooftop acoustic sound level clearance to municipal authority',
      category: 'Permits',
      planningWindow: '3m_out',
      priority: 'critical',
      dueDate: '2026-10-25',
      completed: true,
      owner: 'SkyDeck Operations'
    },
    {
      id: 't-b3',
      title: 'Curate 90s & 2000s throwback dance playlist with DJ Alex',
      category: 'Entertainment',
      planningWindow: '1w_out',
      priority: 'high',
      dueDate: '2026-11-03',
      completed: false,
      owner: 'Zoya & Friends'
    },
    {
      id: 't-b4',
      title: 'Check rooftop wind forecast and arrange patio radiant heaters if < 20°C',
      category: 'Venue Comfort',
      planningWindow: '1w_out',
      priority: 'medium',
      dueDate: '2026-11-05',
      completed: false,
      owner: 'Event Lead'
    }
  ],

  runOfShow: [
    {
      id: 'ros-b1',
      startTime: '18:30',
      endTime: '19:30',
      durationMinutes: 60,
      title: 'Sunset Welcome Cocktails & 360-Degree Glam Photobooth',
      description: 'Chilled signature drinks on arrival, live saxophonist background tunes, and polaroid guestbook.',
      zone: 'SkyDeck Rooftop Open Terrace',
      isOutdoor: true,
      owner: 'Photobooth Lead',
      bufferMinutes: 10,
      isLockedAnchor: false,
      dependencies: []
    },
    {
      id: 'ros-b2',
      startTime: '19:40',
      endTime: '20:40',
      durationMinutes: 60,
      title: 'Surprise Video Montage, Heartfelt Toasts & Live Tapas Service',
      description: 'Friend group tribute video projection on the outdoor screen accompanied by gourmet sliders.',
      zone: 'Semi-Covered Lounge Area',
      isOutdoor: false,
      owner: 'Best Friend & Catering Lead',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: ['ros-b1']
    },
    {
      id: 'ros-b3',
      startTime: '20:55',
      endTime: '21:25',
      durationMinutes: 30,
      title: 'Midnight Starlight Cake Cutting & Cold-Spark Pyro Celebration',
      description: 'Sparkler candles, birthday toast, and commemorative group photographs.',
      zone: 'SkyDeck Central Podium',
      isOutdoor: true,
      owner: 'Zoya & Family',
      bufferMinutes: 15,
      isLockedAnchor: true, // FIXED CELEBRATION MOMENT
      dependencies: ['ros-b2']
    },
    {
      id: 'ros-b4',
      startTime: '21:40',
      endTime: '23:30',
      durationMinutes: 110,
      title: 'Club Beats DJ Dance Floor & Midnight Dessert Extravaganza',
      description: 'DJ drops the beat for high-energy dancing under the city skyline stars.',
      zone: 'SkyDeck Illuminated Dance Floor',
      isOutdoor: true,
      owner: 'DJ Alex',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: ['ros-b3']
    }
  ],

  vendors: [
    {
      id: 'v-b1',
      name: 'SkyDeck Terrace & Bar Lounge',
      category: 'Venue',
      status: 'contract_signed',
      contactPerson: 'Aditi Sharma',
      contactEmail: 'aditi@skydeckterrace.com',
      contactPhone: '+91 99800 44556',
      quotedPrice: 52500,
      depositPaid: 52500,
      balanceDueDate: '2026-11-01',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 95, notes: 'Includes DJ console and sound setup' },
        stylePersonaFit: { score: 98, notes: 'Panoramic city skyline views' },
        reliabilityTrackRecord: { score: 92, notes: 'Great vibe and licensed cocktail bar' },
        contractFlexibility: { score: 90, notes: 'Weather canopy pulls across in 4 minutes' }
      },
      compositeScore: 94
    },
    {
      id: 'v-b2',
      name: 'SweetArt Haute Patisserie',
      category: 'Catering',
      status: 'deposit_paid',
      contactPerson: 'Chef Claire',
      contactEmail: 'claire@sweetarthautre.com',
      contactPhone: '+91 98111 67890',
      quotedPrice: 6000,
      depositPaid: 6000,
      balanceDueDate: '2026-11-06',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 90, notes: 'Premium price for custom gold mirror glaze' },
        stylePersonaFit: { score: 99, notes: 'Matches starlight theme perfectly' },
        reliabilityTrackRecord: { score: 98, notes: '100% on-time delivery record' },
        contractFlexibility: { score: 85, notes: 'Requires 5 days advance for flavor changes' }
      },
      compositeScore: 93
    }
  ],

  guests: [
    {
      id: 'gb-1',
      name: 'Rhea Kapoor (Co-organizer)',
      group: 'Friend',
      rsvpStatus: 'confirmed',
      email: 'rhea.k@designco.com',
      phone: '+91 98450 67890',
      dietaryPreference: 'vegan',
      allergies: ['Gluten Free'],
      accessibilityNeeds: [],
      notes: 'Bringing Polaroid film rolls.'
    },
    {
      id: 'gb-2',
      name: 'Zoya’s Parents (Mr. & Mrs. Merchant)',
      group: 'VIP',
      rsvpStatus: 'confirmed',
      email: 'merchant.family@gmail.com',
      phone: '+91 98200 44321',
      dietaryPreference: 'regular',
      allergies: [],
      accessibilityNeeds: ['ramp'],
      notes: 'Elevator access confirmed with venue manager.'
    }
  ],

  creativeIdeas: [
    {
      id: 'ib-1',
      category: 'palette',
      title: 'Midnight Galaxy & Starlight Rose Gold',
      description: 'Luminous galactic tones with cosmic violet, starlight gold, rose gold shimmer, and deep obsidian noir.',
      tags: ['Trendy', 'Glamorous', 'Nightclub Luxe'],
      estimatedCostImpact: 0,
      swatches: ['#0f172a', '#6366f1', '#fb7185', '#f59e0b'],
      isAddedToPlan: true
    },
    {
      id: 'ib-2',
      category: 'culinary',
      title: 'Dry-Ice Smoked "Galaxy Mocktail" Station',
      description: 'Interactive butterfly-pea flower mocktails that change color from deep blue to vibrant magenta upon adding citrus.',
      tags: ['Viral Instagram Factor', 'Zero Alcohol Option', 'Interactive'],
      estimatedCostImpact: 7500,
      isAddedToPlan: true
    }
  ],

  recentAudits: []
};

export const COMMUNITY_PRESET: EventPlan = {
  id: 'preset-community-fest',
  title: "Chennai Tech & Culture Community Fest 2026",
  vertical: 'community',
  eventDate: '2026-11-20',
  daysRemaining: 30,
  venueName: 'University Central Auditorium & Quadrangle Lawn',
  venueType: 'hybrid',
  guestCount: 350,
  currency: 'INR',
  totalBudget: 450000, // ₹4,50,000 (~$5,500 USD)
  contingencyPercentage: 10,
  priorityPillars: ['Zero-Waste Campus Sustainability', 'Universal Physical & Sensory Accessibility'],
  budgetPriorityMode: 'eco-minimalist',
  
  categories: [
    { id: 'cat-comm-venue', name: 'Auditorium & Civic Permits', allocatedPercentage: 25, allocatedAmount: 112500, spentAmount: 112500, color: '#3b82f6' },
    { id: 'cat-comm-av', name: 'Stage AV, LED Walls & Live Stream', allocatedPercentage: 30, allocatedAmount: 135000, spentAmount: 140000, color: '#8b5cf6' },
    { id: 'cat-comm-food', name: 'Community Lunch & Zero-Waste Water', allocatedPercentage: 25, allocatedAmount: 112500, spentAmount: 108000, color: '#10b981' },
    { id: 'cat-comm-badges', name: 'Lanyards, Seed Badges & Swag', allocatedPercentage: 10, allocatedAmount: 45000, spentAmount: 42000, color: '#f59e0b' },
    { id: 'cat-comm-contingency', name: 'Emergency Contingency Reserve', allocatedPercentage: 10, allocatedAmount: 45000, spentAmount: 0, color: '#64748b' }
  ],

  budgetItems: [
    {
      id: 'b-comm-1',
      name: 'Auditorium & Quadrangle Grounds Civic Fee',
      category: 'Auditorium & Civic Permits',
      costType: 'fixed',
      unitCost: 112500,
      quantity: 1,
      estimatedAmount: 112500,
      actualAmount: 112500,
      paidAmount: 112500,
      notes: 'Subsidized community education rate.'
    },
    {
      id: 'b-comm-2',
      name: 'Zero-Waste Organic Boxed Lunch & Filter Stations',
      category: 'Community Lunch & Zero-Waste Water',
      costType: 'variable',
      unitCost: 300,
      quantity: 350,
      estimatedAmount: 105000,
      actualAmount: 108000,
      paidAmount: 50000,
      notes: 'Includes compostable areca nut plates and drinking water refill jugs.'
    },
    {
      id: 'b-comm-3',
      name: 'Main Stage Dual 4K LED Walls & Multi-Cam Stream',
      category: 'Stage AV, LED Walls & Live Stream',
      costType: 'fixed',
      unitCost: 135000,
      quantity: 1,
      estimatedAmount: 135000,
      actualAmount: 140000,
      paidAmount: 70000,
      notes: 'Added live captioning screen for hearing accessibility.'
    }
  ],

  checklistTasks: [
    {
      id: 't-c1',
      title: 'Audit campus wheelchair ramps, stage lift, and reserved priority seating',
      category: 'Accessibility',
      planningWindow: '1m_out',
      priority: 'critical',
      dueDate: '2026-11-01',
      completed: true,
      owner: 'Accessibility Lead'
    },
    {
      id: 't-c2',
      title: 'Coordinate 35 volunteer shifts across registration, stage, and tech booths',
      category: 'Volunteers',
      planningWindow: '1w_out',
      priority: 'high',
      dueDate: '2026-11-12',
      completed: true,
      owner: 'Volunteer Coordinator'
    },
    {
      id: 't-c3',
      title: 'Confirm Police & Fire Department NOC permits for outdoor food stalls',
      category: 'Compliance',
      planningWindow: '3m_out',
      priority: 'critical',
      dueDate: '2026-10-25',
      completed: true,
      owner: 'Organizing Chair'
    },
    {
      id: 't-c4',
      title: 'Test YouTube live-stream backup satellite link and captions sync',
      category: 'AV & Stream',
      planningWindow: '1w_out',
      priority: 'high',
      dueDate: '2026-11-16',
      completed: false,
      owner: 'AV Engineer'
    }
  ],

  runOfShow: [
    {
      id: 'ros-c1',
      startTime: '08:30',
      endTime: '09:30',
      durationMinutes: 60,
      title: 'Attendee Check-In, Seed-Paper Badge Distribution & Networking Breakfast',
      description: 'Zero-plastic registration booths with QR code badge scanning and morning tea.',
      zone: 'Open Courtyard Lawn & Entrance Foyer',
      isOutdoor: true,
      owner: 'Volunteer Registration Team',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: []
    },
    {
      id: 'ros-c2',
      startTime: '09:45',
      endTime: '11:15',
      durationMinutes: 90,
      title: 'Opening Plenary & Google Developer Keynote: AI for Social Impact',
      description: 'Keynote address with live AI speech translation and real-time sign language interpreter.',
      zone: 'Main University Auditorium',
      isOutdoor: false,
      owner: 'Keynote Speaker & Stage Manager',
      bufferMinutes: 15,
      isLockedAnchor: true, // FIXED BROADCAST KEYNOTE ANCHOR
      dependencies: ['ros-c1']
    },
    {
      id: 'ros-c3',
      startTime: '11:30',
      endTime: '13:00',
      durationMinutes: 90,
      title: 'Parallel Tech Tracks & Hands-On Prompt Engineering Lab',
      description: '3 concurrent breakout workshops covering GenAI, Web Accessibility, and Cloud Architecture.',
      zone: 'Auditorium + Seminar Halls A & B',
      isOutdoor: false,
      owner: 'Track Leads',
      bufferMinutes: 15,
      isLockedAnchor: false,
      dependencies: ['ros-c2']
    },
    {
      id: 'ros-c4',
      startTime: '13:15',
      endTime: '14:30',
      durationMinutes: 75,
      title: 'Zero-Waste Community Networking Lunch & Sponsor Showcase',
      description: 'Compostable dining with dedicated organic segregation bins and student demos.',
      zone: 'Open Courtyard Pavilion',
      isOutdoor: true,
      owner: 'Catering & Sustainability Team',
      bufferMinutes: 15,
      isLockedAnchor: true, // FIXED LUNCH DISPATCH
      dependencies: ['ros-c3']
    },
    {
      id: 'ros-c5',
      startTime: '14:45',
      endTime: '17:30',
      durationMinutes: 165,
      title: 'Cultural Performances, Youth Showcase & Grand Award Ceremony',
      description: 'Music, drama, community recognition awards, and closing vote of thanks.',
      zone: 'Main University Auditorium',
      isOutdoor: false,
      owner: 'Cultural Coordinator',
      bufferMinutes: 20,
      isLockedAnchor: false,
      dependencies: ['ros-c4']
    }
  ],

  vendors: [
    {
      id: 'v-c1',
      name: 'Apex Sound & LED Video Engineering',
      category: 'AV & Production',
      status: 'contract_signed',
      contactPerson: 'Murali Kumar',
      contactEmail: 'murali@apexsound.in',
      contactPhone: '+91 98402 33445',
      quotedPrice: 140000,
      depositPaid: 70000,
      balanceDueDate: '2026-11-19',
      isVerified: true,
      safetyChecklist: {
        portfolioVerified: true,
        writtenQuoteChecked: true,
        rainClauseChecked: true,
        depositMilestoneLogged: true
      },
      scoring: {
        budgetAlignment: { score: 88, notes: 'Includes backup generator' },
        stylePersonaFit: { score: 96, notes: 'Broadcast quality cameras and live switcher' },
        reliabilityTrackRecord: { score: 98, notes: 'Handled 50+ college symposiums' },
        contractFlexibility: { score: 90, notes: 'Standby technician stationed all day' }
      },
      compositeScore: 93
    }
  ],

  guests: [
    {
      id: 'gc-1',
      name: 'Keynote Speaker: Dr. Arvind Swamy',
      group: 'VIP',
      rsvpStatus: 'confirmed',
      email: 'arvind.s@research.org',
      phone: '+91 98841 00998',
      dietaryPreference: 'vegetarian',
      allergies: [],
      accessibilityNeeds: ['quiet_space'],
      notes: 'Requires green room for slide prep.'
    },
    {
      id: 'gc-2',
      name: 'Divya & College Accessibility Club (8 Pax)',
      group: 'Attendee',
      rsvpStatus: 'confirmed',
      email: 'divya.a11y@campus.edu',
      phone: '+91 97910 88771',
      dietaryPreference: 'regular',
      allergies: [],
      accessibilityNeeds: ['wheelchair', 'ramp', 'sign_language'],
      notes: 'Signed up for front-row designated wheelchair bay.'
    }
  ],

  creativeIdeas: [
    {
      id: 'ic-1',
      category: 'eco_cost_saving',
      title: 'Plantable Seed-Paper Badges & Lanyard Return Scheme',
      description: 'Badges embedded with basil & marigold seeds that attendees take home to plant. Lanyards collected in return bins to achieve zero waste.',
      tags: ['Zero Waste', 'Community Engagement', '12% Savings'],
      estimatedCostImpact: -15000,
      isAddedToPlan: true
    }
  ],

  recentAudits: []
};
