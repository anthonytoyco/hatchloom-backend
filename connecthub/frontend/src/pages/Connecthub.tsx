import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatusBar from "../components/StatusBar";
import CommunicationsCard from "../components/CommunicationCard";
import SecondaryCard from "../components/SecondaryCard";
import type { itemTypes } from "../types/cardTypes";

// Sample market and discovery items from hatchloom html template
const discoveryItems: itemTypes[] = [
  {
    id: "wolfpack",
    title: "Wolfpack",
    emoji: "🐺",
    type: "Community",
    typeClass: "bg-purple/10 text-purple",
  },
  {
    id: "lionheart",
    title: "Lionheart",
    emoji: "🦁",
    type: "Community",
    typeClass: "bg-yellow/10 text-yellow",
  },
  {
    id: "valentine",
    title: "Valentine",
    emoji: "❤️",
    type: "Community",
    typeClass: "bg-pink/10 text-pink",
  },
  {
    id: "birds",
    title: "Birdies",
    emoji: "🐦",
    type: "Community",
    typeClass: "bg-blue/10 text-blue",
  },
];

const marketItems: itemTypes[] = [
  {
    id: "lightningmike",
    title: "Lightning Mike",
    emoji: "⚡",
    type: "Service",
    typeClass: "bg-yellow/10 text-yellow",
  },
  {
    id: "flavour-butter",
    title: "Flavour Butter Co.",
    emoji: "⭐",
    type: "Review",
    typeClass: "bg-[#fff7ed] text-orange",
  },
  {
    id: "artbyjen",
    title: "ArtByJen",
    emoji: "🎨",
    type: "Listing",
    typeClass: "bg-teal-light text-teal",
  },
];

function Connecthub() {
  return (
    <main className="grid min-h-[calc(100vh-58px)] grid-cols-[215px_1fr]">
      <Sidebar />
      <div className="overflow-y-auto px-0 py-7">
        <TopHeader
          title="ConnectHub"
          description="Everything happening outside your venture - people, markets, opportunities."
        />
        <StatusBar />
        <section className="mb-6 grid grid-cols-1 gap-5 px-8 py-0 md:grid-cols-2">
          <CommunicationsCard />
          <SecondaryCard
            title="Discovery & Community"
            icon="👥"
            linkText="Browse"
            iconBackground="bg-[#eff6ff]"
            items={discoveryItems}
          />
          <SecondaryCard
            title="Go-To Market"
            icon="🪙"
            iconBackground="bg-[#fff7ed]"
            linkText="Loom Market"
            items={marketItems}
          />
        </section>
      </div>
    </main>
  );
}

export default Connecthub;
