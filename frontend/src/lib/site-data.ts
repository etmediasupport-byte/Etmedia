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
    "ET Media Business Intelligence",
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

export type EventItem = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  category: string;
  speakers: number;
  status: "upcoming" | "past";
  month: string;
};

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

export const magazines = [
  {
    issue: "Issue 28",
    title: "Leading Beyond Today",
    date: "September 2026",
    cover: magazineCover,
    category: "Leadership",
  },
  {
    issue: "Issue 27",
    title: "The Talent Equation",
    date: "July 2026",
    cover: eventHr,
    category: "HR",
  },
  {
    issue: "Issue 26",
    title: "Capital & Confidence",
    date: "May 2026",
    cover: eventCfo,
    category: "Finance",
  },
  {
    issue: "Issue 25",
    title: "India's GCC Decade",
    date: "March 2026",
    cover: heroSummit,
    category: "GCC",
  },
  {
    issue: "Issue 24",
    title: "Founders At Scale",
    date: "January 2026",
    cover: heroNetworking,
    category: "Startup",
  },
  {
    issue: "Issue 23",
    title: "Machines That Learn",
    date: "November 2025",
    cover: heroAwards,
    category: "Technology",
  },
];

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
