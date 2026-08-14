import { Sparkles } from "lucide-react";
import { getSkills } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillPill } from "@/components/skills/SkillPill";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/FadeIn";
import { SectionGlow } from "@/components/decor/SectionGlow";

export async function Skills() {
  const skillGroups = await getSkills();

  if (skillGroups.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-secondary/50 py-20">
      <SectionGlow variant="bottom-left" color={1} />
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Skills"
            title="Technologies I work with"
            icon={Sparkles}
          />
        </FadeIn>
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <StaggerItem
              key={group.category}
              className="glass glass-sheen relative rounded-2xl p-5"
            >
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <SkillPill
                    key={item.name}
                    name={item.name}
                    level={item.level}
                    icon={item.icon}
                  />
                ))}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
