import SectionHeader from "./SectionHeader";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  bgColor?: string;
  borderColor?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  tag,
  tagColor,
  bgColor = "#111111",
  borderColor = "#2D2D2D",
}: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-5 p-8 md:p-[32px] border w-full md:flex-1 md:h-[320px] transition-all duration-300 hover:border-opacity-100 hover:scale-[1.02]"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-grotesk text-[18px] font-bold text-[#F5F5F0] tracking-[1px] leading-[1.2] whitespace-pre-line">
        {title}
      </h3>
      <p className="font-ibm-mono text-[12px] text-[#666666] tracking-[1px] leading-[1.6]">
        {description}
      </p>
      <div
        className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border w-fit"
        style={{ borderColor: tagColor }}
      >
        <span className="font-ibm-mono text-[11px] tracking-[2px]" style={{ color: tagColor }}>
          {tag}
        </span>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[01] // FEATURES"
        title={"EVERYTHING YOU NEED.\nNOTHING YOU DON'T."}
        subtitle="ENGINEERED FOR SPEED. BUILT FOR SCALE. DESIGNED FOR BUILDERS."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <FeatureCard
          icon={
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="24" height="24" rx="4" stroke="#FF6B35" strokeWidth="2" fill="none" />
              <path d="M14 20L18 24L26 14" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 28H32" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          title={"LOGIC-ACCURATE\nDESIGN SYSTEM"}
          description="EVERY COMPONENT BUILT TO A 4PX GRID. NO EXCEPTIONS. NO COMPROMISE."
          tag="CORE"
          tagColor="#FF6B35"
          borderColor="#FF6B35"
        />
        <FeatureCard
          icon={
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="12" stroke="#FF6B35" strokeWidth="2" fill="none" />
              <path d="M20 12V20L26 23" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2" fill="#FF6B35" />
            </svg>
          }
          title={"ZERO-DEPENDENCY\nCOMPONENTS"}
          description="PURE VANILLA. NO BLOAT. SHIP EXACTLY WHAT YOUR USERS NEED, NOTHING MORE."
          tag="VANILLA"
          tagColor="#FF6B35"
          bgColor="#0F0F0F"
          borderColor="#FF6B35"
        />
        <FeatureCard
          icon={
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L23 14H31L25 19L28 27L20 22L12 27L15 19L9 14H17L20 6Z" stroke="#F5F5F0" strokeWidth="2" fill="none" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="1.5" fill="#F5F5F0" />
            </svg>
          }
          title={"DARK MODE\nFIRST."}
          description="BUILT FOR THE TERMINAL GENERATION. EVERY COLOR CALIBRATED FOR LOW-LIGHT PRECISION."
          tag="DARK"
          tagColor="#888888"
          borderColor="#555555"
        />
      </div>
    </section>
  );
}