import heroLeadership from "@/assets/hero-leadership.jpg";
import heroSummit from "@/assets/hero-summit.jpg";
import heroAwards from "@/assets/hero-awards.jpg";
import heroNetworking from "@/assets/hero-networking.jpg";
import eventHr from "@/assets/event-hr.jpg";
import eventCfo from "@/assets/event-cfo.jpg";
import aboutOffice from "@/assets/about-office.jpg";
import magazineCover from "@/assets/magazine-cover.jpg";

export const images = {
  heroLeadership,
  heroSummit,
  heroAwards,
  heroNetworking,
  eventHr,
  eventCfo,
  aboutOffice,
  magazineCover,
};

export const contact = {
  phones: ["+91 91002 66777", "+91 94930 87788"],
  emails: ["contact@etmedia.in", "registration@etmedia.in"],
  address: [
    "Executive Talks Media Business Intelligence",
    "Unit No-1012, 10th Floor",
    "Manjeera Trinity Corporate",
    "JNTU-Hitech Road, KPHB",
    "Hyderabad, Telangana 500072, India",
  ],
  hours: "Monday to Sunday · 9 AM — 9 PM",
  whatsapp: "https://wa.me/919100266777",
  linkedin: "https://www.linkedin.com/",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
};

export const heroSlides = [
  {
    image: heroLeadership,
    kicker: "Leadership Conference",
    title: "Where Business Leaders Shape What Comes Next",
    description:
      "National leadership platforms bringing CXOs, founders and decision makers onto one stage.",
  },
  {
    image: heroSummit,
    kicker: "Business Summit",
    title: "Intelligence That Moves Industries Forward",
    description:
      "Curated summits built around real business problems, real data and real outcomes.",
  },
  {
    image: heroAwards,
    kicker: "Industry Awards",
    title: "Recognising Excellence Across Indian Enterprise",
    description:
      "Honouring the organisations and leaders setting the benchmark in their industries.",
  },
  {
    image: heroNetworking,
    kicker: "Networking Event",
    title: "Conversations That Turn Into Partnerships",
    description:
      "High-trust rooms where relationships convert into long-term business value.",
  },
  {
    image: heroSummit,
    kicker: "Product Launch",
    title: "Launch Your Brand In Front Of The Right Room",
    description:
      "Strategic launch platforms with media amplification and qualified audiences.",
  },
];

export const stats = [
  { label: "Conferences", value: 10, suffix: "+", desc: "National Conclaves & Summits" },
  { label: "Industry Speakers", value: 100, suffix: "+", desc: "C-Suite Keynotes & Panellists" },
  { label: "Business Leaders", value: 1500, suffix: "+", desc: "Executive Delegates Reached" },
  { label: "Partner Brands", value: 200, suffix: "+", desc: "Sponsors & Corporate Partners" },
  { label: "Countries", value: 5, suffix: "+", desc: "Global Footprint & Reach" },
];

export const services = [
  {
    icon: "Crown",
    title: "Leadership Events",
    description: "Creating impactful leadership platforms connecting industry experts.",
  },
  {
    icon: "Award",
    title: "Industry Awards",
    description: "Recognising outstanding organisations and leaders across sectors.",
  },
  {
    icon: "Rocket",
    title: "Product Launches",
    description: "Helping brands launch products strategically to the right audience.",
  },
  {
    icon: "Megaphone",
    title: "Media Promotions",
    description: "Corporate media branding across digital, print and event channels.",
  },
  {
    icon: "Gem",
    title: "Strategic Branding",
    description: "Business branding solutions built for credibility and recall.",
  },
  {
    icon: "Presentation",
    title: "Business Conferences",
    description: "Innovation driven conferences designed around industry priorities.",
  },
  {
    icon: "TrendingUp",
    title: "Corporate Growth",
    description: "A networking ecosystem that compounds into commercial growth.",
  },
  {
    icon: "Globe2",
    title: "New GCC Onboarding",
    description: "GCC advisory, ecosystem access and onboarding support in India.",
  },
] as const;

export type Speaker = {
  id?: string;
  name: string;
  designation: string;
  organization: string;
  photo: string;
  bio?: string;
  topic?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
};

export type Sponsor = {
  id?: string;
  name: string;
  tier: "Title Partner" | "Platinum Sponsor" | "Gold Sponsor" | "Silver Partner" | "Media Partner" | "Technology Partner";
  logo: string;
  websiteUrl?: string;
};

export type GalleryItem = {
  id?: string;
  type: "image" | "video";
  url: string;
  caption?: string;
};

export type AgendaItem = {
  id?: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
};

export type EventItem = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  full_description?: string;
  about_content?: string;
  image: string;
  about_image?: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  venue_address?: string;
  category: string;
  speakers: number;
  status: "upcoming" | "past" | "published" | "draft";
  month?: string;
  is_featured?: number | boolean;
  locations?: string | any[];
  speakers_list?: string | Speaker[];
  sponsors_list?: string | Sponsor[];
  gallery_list?: string | GalleryItem[];
  agenda_list?: string | AgendaItem[];
  map_url?: string;
};

export const getDefaultSpeakers = (category: string = ""): Speaker[] => [
  {
    id: "spk-1",
    name: "Dr. Rajesh Sharma",
    designation: "Chief Executive Officer & Industry Evangelist",
    organization: "Global Enterprise Mobility",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    bio: "Over 22 years of enterprise strategy experience across Asia-Pacific.",
    topic: "Keynote: Shaping the Next Decade of Enterprise Growth",
  },
  {
    id: "spk-2",
    name: "Ananya Roy",
    designation: "Chief Financial Officer & Strategy Head",
    organization: "Apex Capital India",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    bio: "Pioneer in modern treasury management and capital allocation strategies.",
    topic: "Panel: Capital Allocation & Enterprise Risk in Volatile Markets",
  },
  {
    id: "spk-3",
    name: "Vikramaditya Verma",
    designation: "Chief Technology & AI Officer",
    organization: "NextGen Cloud Systems",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
    bio: "Specialist in enterprise generative AI deployment and digital resilience.",
    topic: "Fireside Chat: AI-Driven Operational Excellence",
  },
  {
    id: "spk-4",
    name: "Meera Krishnan",
    designation: "Chief Human Resources Officer",
    organization: "Vantage Global",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    bio: "Building high-performance corporate cultures across 14 countries.",
    topic: "Workforce 2030: Leadership, Retention & Executive Culture",
  },
];

export const getDefaultSponsors = (): Sponsor[] => [
  {
    id: "spn-1",
    name: "NorthBridge Capital",
    tier: "Title Partner",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
    websiteUrl: "https://example.com",
  },
  {
    id: "spn-2",
    name: "Vantage Enterprise Systems",
    tier: "Platinum Sponsor",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
    websiteUrl: "https://example.com",
  },
  {
    id: "spn-3",
    name: "Helix Tech Solutions",
    tier: "Gold Sponsor",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
    websiteUrl: "https://example.com",
  },
  {
    id: "spn-4",
    name: "Axiom Cloud Intelligence",
    tier: "Technology Partner",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
    websiteUrl: "https://example.com",
  },
];

export const getDefaultGallery = (): GalleryItem[] => [
  {
    id: "gal-1",
    type: "image",
    url: heroLeadership,
    caption: "CXO Keynote Address & Industry Benchmarking Session",
  },
  {
    id: "gal-2",
    type: "image",
    url: heroSummit,
    caption: "Executive Panel Discussion on AI & Digital Infrastructure",
  },
  {
    id: "gal-3",
    type: "image",
    url: heroAwards,
    caption: "Gala Awards & Industry Leadership Recognition Ceremony",
  },
  {
    id: "gal-4",
    type: "image",
    url: heroNetworking,
    caption: "High-Trust Executive Networking Session",
  },
];

export const getDefaultAgenda = (): AgendaItem[] => [
  {
    id: "ag-1",
    time: "08:30 AM — 09:30 AM",
    title: "Executive Registration & Morning Networking Breakfast",
    speaker: "Delegates & Advisory Board",
    description: "Welcome desk check-in, coffee networking, and badge distribution.",
  },
  {
    id: "ag-2",
    time: "09:30 AM — 10:30 AM",
    title: "Opening Keynote: Reimagining Enterprise Growth & Innovation",
    speaker: "Dr. Rajesh Sharma (CEO, GEM)",
    description: "Macroeconomic realities, technological disruption, and strategic roadmap for decision makers.",
  },
  {
    id: "ag-3",
    time: "10:30 AM — 11:45 AM",
    title: "Leadership Panel: Governance, Risk Management & Scale",
    speaker: "Ananya Roy & Industry Leaders",
    description: "Cross-industry debate on capital efficiency, board reporting, and sustainable execution.",
  },
  {
    id: "ag-4",
    time: "11:45 AM — 01:00 PM",
    title: "Technology Showcase & Fireside Session",
    speaker: "Vikramaditya Verma (CTO, NextGen)",
    description: "Demonstration of generative AI workflows, cloud governance, and cybersecurity architectures.",
  },
  {
    id: "ag-5",
    time: "01:00 PM — 02:15 PM",
    title: "Executive Luncheon & VIP Networking Lounge",
    speaker: "All Participants",
    description: "Curated seating networking lunch for peer-to-peer exchange.",
  },
  {
    id: "ag-6",
    time: "02:15 PM — 04:00 PM",
    title: "Breakout Masterclasses & Sectoral Working Groups",
    speaker: "Meera Krishnan & Advisory Panel",
    description: "Deep dive roundtables focusing on workforce retention, supply chain resilience, and digital transformation.",
  },
  {
    id: "ag-7",
    time: "04:00 PM — 05:30 PM",
    title: "Excellence Awards & Concluding Remarks",
    speaker: "ET Media Leadership Team",
    description: "Recognition of pioneering enterprises followed by networking high tea.",
  },
];


export const events: EventItem[] = [
  {
    slug: "hr-leadership-conclave-hyderabad",
    title: "HR Leadership Conclave 2026",
    description:
      "India's people leaders on talent strategy, AI in HR and building resilient cultures.",
    image: eventHr,
    date: "24 October 2026",
    month: "October",
    time: "9:30 AM — 6:00 PM",
    city: "Hyderabad",
    venue: "Manjeera Trinity Convention, KPHB",
    category: "HR Conference",
    speakers: 24,
    status: "upcoming",
  },
  {
    slug: "cfo-leadership-summit-bangalore",
    title: "CFO Leadership Summit",
    description:
      "Finance leaders on capital efficiency, governance and growth in volatile markets.",
    image: eventCfo,
    date: "14 November 2026",
    month: "November",
    time: "10:00 AM — 7:00 PM",
    city: "Bangalore",
    venue: "The Leela Palace",
    category: "CFO Leadership",
    speakers: 18,
    status: "upcoming",
  },
  {
    slug: "admin-procurement-forum-chennai",
    title: "Admin & Procurement Forum",
    description:
      "Workplace, facilities and procurement heads on cost, compliance and vendor strategy.",
    image: heroNetworking,
    date: "5 December 2026",
    month: "December",
    time: "9:00 AM — 5:30 PM",
    city: "Chennai",
    venue: "ITC Grand Chola",
    category: "Admin & Procurement",
    speakers: 16,
    status: "upcoming",
  },
  {
    slug: "gcc-connect-mumbai",
    title: "GCC Connect India",
    description:
      "Global capability centre leaders on scaling India operations and new-site onboarding.",
    image: heroSummit,
    date: "23 January 2027",
    month: "January",
    time: "9:30 AM — 6:30 PM",
    city: "Mumbai",
    venue: "Jio World Convention Centre",
    category: "GCC",
    speakers: 22,
    status: "upcoming",
  },
  {
    slug: "business-excellence-awards-2026",
    title: "Business Excellence Awards 2026",
    description:
      "A gala night honouring 40 organisations across manufacturing, tech and healthcare.",
    image: heroAwards,
    date: "18 March 2026",
    month: "March",
    time: "6:30 PM — 10:30 PM",
    city: "Hyderabad",
    venue: "Novotel HICC",
    category: "Industry Awards",
    speakers: 12,
    status: "past",
  },
  {
    slug: "leadership-conclave-delhi-2025",
    title: "National Leadership Conclave",
    description: "CXOs from 180 organisations on leading through transformation.",
    image: heroLeadership,
    date: "9 December 2025",
    month: "December",
    time: "9:30 AM — 6:00 PM",
    city: "New Delhi",
    venue: "The Ashok",
    category: "Leadership",
    speakers: 20,
    status: "past",
  },
];

export type MagazineItem = {
  id: string;
  issue: string;
  title: string;
  date: string;
  month?: string;
  cover: string;
  pdf_url?: string;
  pages_list?: string | string[];
  category: string;
  description?: string;
  is_featured?: boolean | number;
  views?: number;
};

export const getDefaultMagazines = (): MagazineItem[] => [
  {
    id: "MAG-101",
    issue: "Issue 28",
    title: "Leading Beyond Today",
    date: "September 2026",
    month: "September 2026",
    cover: magazineCover,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      magazineCover,
      heroLeadership,
      heroSummit,
      aboutOffice,
      heroNetworking,
    ],
    category: "Leadership",
    is_featured: true,
  },
  {
    id: "MAG-102",
    issue: "Issue 27",
    title: "The Talent Equation",
    date: "July 2026",
    month: "July 2026",
    cover: eventHr,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      eventHr,
      heroLeadership,
      aboutOffice,
    ],
    category: "HR",
    is_featured: false,
  },
  {
    id: "MAG-103",
    issue: "Issue 26",
    title: "Capital & Confidence",
    date: "May 2026",
    month: "May 2026",
    cover: eventCfo,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      eventCfo,
      heroSummit,
      heroAwards,
    ],
    category: "Finance",
    is_featured: false,
  },
  {
    id: "MAG-104",
    issue: "Issue 25",
    title: "India's GCC Decade",
    date: "March 2026",
    month: "March 2026",
    cover: heroSummit,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      heroSummit,
      heroLeadership,
    ],
    category: "GCC",
    is_featured: false,
  },
  {
    id: "MAG-105",
    issue: "Issue 24",
    title: "Founders At Scale",
    date: "January 2026",
    month: "January 2026",
    cover: heroNetworking,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      heroNetworking,
      aboutOffice,
    ],
    category: "Startup",
    is_featured: false,
  },
  {
    id: "MAG-106",
    issue: "Issue 23",
    title: "Machines That Learn",
    date: "November 2025",
    month: "November 2025",
    cover: heroAwards,
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pages_list: [
      heroAwards,
      eventCfo,
    ],
    category: "Technology",
    is_featured: false,
  },
];

export const magazines = getDefaultMagazines();

export const magazineCategories = [
  "Leadership",
  "HR",
  "Finance",
  "Startup",
  "Technology",
  "Manufacturing",
  "Healthcare",
  "GCC",
];

export const testimonials = [
  {
    name: "Ramesh Iyer",
    company: "Vantage Industries",
    role: "Chief Human Resources Officer",
    quote:
      "The quality of the room ET Media builds is unmatched — every conversation was with a decision maker.",
    videoId: "ysz5S6PUM-U",
  },
  {
    name: "Anita Deshpande",
    company: "NorthBridge Capital",
    role: "Chief Financial Officer",
    quote:
      "Sharp agenda, serious peers and zero fluff. It has become a fixed date on our leadership calendar.",
    videoId: "aqz-KE-bpKQ",
  },
  {
    name: "Vikram Rao",
    company: "Helix GCC Services",
    role: "Managing Director",
    quote:
      "Their GCC onboarding programme opened doors that would have taken us a year to open ourselves.",
    videoId: "ScMzIvxBSi4",
  },
];

export const partners = [
  "NORTHBRIDGE",
  "VANTAGE",
  "HELIX",
  "MERIDIAN",
  "ORBIT LABS",
  "SUNCREST",
  "AXIOM",
  "BLUEPEAK",
];

export const sponsorshipPackages = [
  {
    name: "Silver",
    price: "On request",
    perks: ["Logo on event branding", "2 delegate passes", "Exhibition table", "Post-event report"],
  },
  {
    name: "Gold",
    price: "On request",
    perks: [
      "Premium branding placement",
      "5 delegate passes",
      "Panel participation",
      "Lead list access",
      "Social media features",
    ],
    featured: true,
  },
  {
    name: "Platinum",
    price: "On request",
    perks: [
      "Stage-front branding",
      "10 delegate passes",
      "Keynote slot",
      "Full lead list",
      "Magazine feature",
    ],
  },
  {
    name: "Title Sponsor",
    price: "On request",
    perks: [
      "Co-branded event title",
      "Unlimited passes",
      "Opening keynote",
      "Cover story in Executive Talks",
      "Year-round media coverage",
    ],
  },
];

export type Collaborator = {
  id: string;
  brand_name: string;
  logo: string;
  website?: string;
  category?: string;
  priority?: number;
  status?: "Active" | "Inactive";
};

export const getDefaultCollaborators = (): Collaborator[] => [
  {
    id: "PTR-101",
    brand_name: "NorthBridge Capital",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
    website: "https://northbridge.com",
    category: "Strategic Partner",
  },
  {
    id: "PTR-102",
    brand_name: "Vantage Enterprise Systems",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300",
    website: "https://vantage.com",
    category: "Tech Partner",
  },
  {
    id: "PTR-103",
    brand_name: "Axiom Cloud Intelligence",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300",
    website: "https://axiomcloud.com",
    category: "Media Partner",
  },
  {
    id: "PTR-104",
    brand_name: "Helix Tech & Life Sciences",
    logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300",
    website: "https://helixent.com",
    category: "Award Partner",
  },
  {
    id: "PTR-105",
    brand_name: "Apex Global Growth",
    logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300",
    website: "https://apexglobal.com",
    category: "Strategic Partner",
  },
  {
    id: "PTR-106",
    brand_name: "Quantum Media Works",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=300",
    website: "https://quantummedia.com",
    category: "Media Partner",
  },
];

export type JobItem = {
  id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  description: string;
  responsibilities?: string | string[];
  qualifications?: string | string[];
  benefits?: string | string[];
  status?: "Open" | "Closed" | string;
  created_at?: string;
};

export type JobApplication = {
  id: string;
  job_id: string;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  resume_url: string;
  portfolio_url?: string;
  status?: string;
  created_at?: string;
};

export const getDefaultJobs = (): JobItem[] => [
  {
    id: "JOB-101",
    title: "Senior Conference Producer",
    department: "Conference Production",
    location: "Hyderabad (Hybrid)",
    experience: "3 — 5 Years",
    description:
      "Lead the agenda creation, speaker curation, and editorial direction for national C-suite summits and leadership forums.",
    responsibilities: [
      "Research industry trends across CFO, HR, and Enterprise AI verticals",
      "Recruit CXO keynotes and VP-level panel speakers",
      "Drive conference stage program execution and outcome reports",
    ],
    qualifications: [
      "3+ years experience in B2B conference production or media leadership",
      "Exceptional executive communication and editorial research skills",
      "Proven track record of curating high-impact C-suite events",
    ],
    benefits: [
      "Competitive salary with performance bonuses",
      "Comprehensive health insurance for self & dependents",
      "Executive networking passes to all ET Media national summits",
      "Hybrid work flexibility and fast-track leadership career path",
    ],
    status: "Open",
  },
  {
    id: "JOB-102",
    title: "Corporate Sponsorship & Alliances Manager",
    department: "Sales & Sponsorship",
    location: "Bengaluru / Remote",
    experience: "2 — 4 Years",
    description:
      "Build strategic partnerships and drive corporate event sponsorship packages across enterprise software, BFSI, and technology brands.",
    responsibilities: [
      "Engage CMOs, VP Marketing, and Alliance Leaders for title & platinum event sponsorships",
      "Manage end-to-end B2B client proposals and partnership contracts",
      "Collaborate with event operations to deliver maximum sponsor ROI",
    ],
    qualifications: [
      "2+ years experience in B2B event sponsorship, media sales, or corporate alliances",
      "Strong network across enterprise marketing decision-makers",
      "Excellent negotiation, presentation, and pipeline management skills",
    ],
    benefits: [
      "High uncapped commission structure on top of base salary",
      "Executive travel allowances and luxury venue access",
      "Health & wellness perks",
    ],
    status: "Open",
  },
  {
    id: "JOB-103",
    title: "Senior Event Operations Lead",
    department: "Event Operations",
    location: "Hyderabad",
    experience: "4 — 6 Years",
    description:
      "Oversee venue setup, AV technology, VIP delegate hospitality, and logistics execution across major 5-star hotel summits.",
    responsibilities: [
      "Manage 5-star hotel convention logistics, stage AV, and booth setups",
      "Coordinate VIP delegate check-ins and executive hospitality teams",
      "Ensure flawless timing and vendor management on event days",
    ],
    qualifications: [
      "4+ years experience managing large-scale B2B corporate events or luxury hotel summits",
      "Strong vendor negotiation, stage AV, and team leadership skills",
    ],
    benefits: [
      "Competitive pay & event milestone incentives",
      "Full travel & accommodation coverage for outstation events",
      "Comprehensive medical coverage",
    ],
    status: "Open",
  },
];

export type MediaGalleryItem = {
  id: string;
  title: string;
  type: "photo" | "video";
  url: string;
  thumbnail_url?: string;
  category: string;
  event_slug?: string;
  event_title?: string;
  aspect_ratio?: string;
  platform?: "youtube" | "instagram" | string;
  is_featured?: boolean;
  created_at?: string;
};

export const getDefaultMediaGallery = (): MediaGalleryItem[] => [
  {
    id: "GAL-101",
    title: "India CFO Leadership Summit Keynote Stage",
    type: "photo",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop",
    category: "Keynotes",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[4/3]",
  },
  {
    id: "GAL-102",
    title: "CXO Networking & Executive Gala Dinner",
    type: "photo",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop",
    category: "Networking",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[16/9]",
  },
  {
    id: "GAL-103",
    title: "HR Excellence Leadership Awards Night",
    type: "photo",
    url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop",
    category: "Awards",
    event_slug: "hr-excellence-awards",
    event_title: "HR Excellence & Leadership Conclave",
    aspect_ratio: "aspect-[3/4]",
  },
  {
    id: "GAL-104",
    title: "Enterprise AI & Tech Leaders Panel Discussion",
    type: "photo",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400&auto=format&fit=crop",
    category: "Keynotes",
    event_slug: "enterprise-tech-conclave",
    event_title: "National Enterprise Tech & AI Summit",
    aspect_ratio: "aspect-[16/9]",
  },
  {
    id: "GAL-105",
    title: "India CFO Leadership Summit 2026 — Official Keynote Video",
    type: "video",
    platform: "youtube",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    category: "Keynotes",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[16/9]",
    is_featured: true,
  },
  {
    id: "GAL-106",
    title: "CXO Networking Highlights — Instagram Reel",
    type: "video",
    platform: "instagram",
    url: "https://www.instagram.com/reel/C328hJ9L-88/embed",
    thumbnail_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    category: "Networking",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[9/16]",
    is_featured: true,
  },
  {
    id: "GAL-107",
    title: "Luxury 5-Star Hotel Stage & AV Production Setup",
    type: "photo",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop",
    category: "Stage & AV",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[4/3]",
  },
  {
    id: "GAL-108",
    title: "Title Sponsors & Corporate Booth Exhibition",
    type: "photo",
    url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=400&auto=format&fit=crop",
    category: "Exhibitions",
    event_slug: "enterprise-tech-conclave",
    event_title: "National Enterprise Tech & AI Summit",
    aspect_ratio: "aspect-[16/9]",
  },
  {
    id: "GAL-109",
    title: "Executive Networking Lunch & Coffee Lounge",
    type: "photo",
    url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
    thumbnail_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400&auto=format&fit=crop",
    category: "Networking",
    event_slug: "hr-excellence-awards",
    event_title: "HR Excellence & Leadership Conclave",
    aspect_ratio: "aspect-[3/4]",
  },
];

export interface CouponItem {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  usageLimit: number;
  expiryDate: string;
  status: "Active" | "Inactive";
}

export interface PricingPlanTier {
  id: string;
  name: string;
  price: number;
  badge?: string;
  is_featured?: boolean;
  features: string[];
  button_text?: string;
}

export const getDefaultPricingPlans = (): PricingPlanTier[] => [
  {
    id: "plan-premium",
    name: "Premium Pass",
    price: 12000,
    badge: "VIP Access",
    is_featured: false,
    features: [
      "Access to all sessions",
      "Premium front-row seating",
      "Networking lunch & high tea",
      "Executive event kit & certificate",
      "Access to recorded sessions & slides",
    ],
    button_text: "Register Now",
  },
  {
    id: "plan-gold",
    name: "Gold Pass",
    price: 8000,
    badge: "Most Popular",
    is_featured: true,
    features: [
      "Access to all sessions",
      "General executive seating",
      "Networking lunch",
      "Event kit & certificate",
      "Access to recorded sessions",
    ],
    button_text: "Register Now",
  },
  {
    id: "plan-platinum",
    name: "Platinum Pass",
    price: 5000,
    badge: "Standard",
    is_featured: false,
    features: [
      "Access to core sessions",
      "Standard seating",
      "Networking tea",
      "Event certificate",
      "Access to recorded sessions",
    ],
    button_text: "Register Now",
  },
];

export interface EventPaymentConfig {
  id: string;
  event_id: string;
  event_title?: string;
  event_category?: string;
  event_city?: string;
  event_date?: string;
  event_image?: string;
  event_slug?: string;
  registration_fee: number;
  currency: string;
  gst_percentage: number;
  gst_included: number | boolean;
  platform_fee: number;
  convenience_fee: number;
  registration_type_prices: string | Record<string, number>;
  pricing_plans?: string | PricingPlanTier[];
  early_bird_enabled: number | boolean;
  early_bird_price: number;
  early_bird_start_date: string;
  early_bird_end_date: string;
  special_prices: string | Record<string, number>;
  total_seats: number;
  available_seats: number;
  reserved_seats: number;
  vip_seats: number;
  speaker_seats: number;
  sponsor_seats: number;
  coupons_enabled: number | boolean;
  coupons: string | CouponItem[];
  payment_required: number | boolean;
  online_payment_enabled: number | boolean;
  offline_payment_enabled: number | boolean;
  free_registration_allowed: number | boolean;
  auto_close_seats_full: number | boolean;
  registration_open_date: string;
  registration_close_date: string;
  event_start_date: string;
  event_end_date: string;
  payment_status: "Enabled" | "Disabled" | "Draft" | "Coming Soon";
  created_at?: string;
  updated_at?: string;
}


