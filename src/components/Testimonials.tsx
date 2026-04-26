import SectionHeader from "./SectionHeader";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  bgColor?: string;
  accentColor: string;
  avatarColor?: string;
  avatarInitial?: string;
}

function TestimonialCard({
  quote,
  name,
  role,
  bgColor = "#111111",
  accentColor,
  avatarColor = "#333333",
  avatarInitial,
}: TestimonialCardProps) {
  return (
    <div
      className="flex flex-col gap-6 p-8 md:p-[40px] border-l-4 w-full md:flex-1 transition-all duration-300 hover:bg-[#131313]"
      style={{ backgroundColor: bgColor, borderLeftColor: accentColor }}
    >
      <p className="font-ibm-mono text-[13px] text-[#CCCCCC] tracking-[1px] leading-[1.6]">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-[12px]">
        <div
          className="w-[36px] h-[36px] rounded-full shrink-0 flex items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          {avatarInitial ? (
            <span className="font-grotesk text-[14px] font-bold text-[#0A0A0A]">
              {avatarInitial}
            </span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" fill="#0A0A0A" opacity="0.5" />
              <path d="M3 17C3 14.5 6 13 10 13C14 13 17 14.5 17 17" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="font-grotesk text-[13px] font-bold text-[#F5F5F0] tracking-[1px]">
            {name}
          </span>
          <span className="font-ibm-mono text-[11px] text-[#555555] tracking-[1px]">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="flex flex-col w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[04] // WHAT BUILDERS SAY"
        title={"REAL BUILDERS.\nREAL RESULTS."}
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <TestimonialCard
          quote="3X3CUT0R IS THE FIRST TOOL THAT ACTUALLY RESPECTS MY WORKFLOW. SHIPPED 3 PRODUCTS IN 6 WEEKS."
          name="SARAH L."
          role="FOUNDER, FORGE LAB"
          accentColor="#FF6B35"
          avatarColor="#FF6B35"
          avatarInitial="S"
        />
        <TestimonialCard
          quote="FINALLY A SYSTEM THAT DOESN'T FIGHT ME. THE DARK MODE IS FLAWLESS. ZERO CONFIG."
          name="ALEX KIM"
          role="CTO, AXIOM INC"
          bgColor="#0D0D0D"
          accentColor="#FF6B35"
          avatarColor="#60A5FA"
          avatarInitial="A"
        />
        <TestimonialCard
          quote="WE REPLACED 4 TOOLS WITH 3X3CUT0R. TEAM ONBOARDING DROPPED FROM 2 WEEKS TO 2 DAYS."
          name="MORGAN HAYES"
          role="VP DESIGN, NEXUS CO."
          accentColor="#F5F5F0"
          avatarColor="#4ADE80"
          avatarInitial="M"
        />
      </div>
    </section>
  );
}