import { SkillDetailPage } from "@/components/ielts/skill-detail";
import { IELTS_SKILLS } from "@/lib/ielts-content";

export const metadata = {
  title: "IELTS Speaking — VocaLearn",
  description: "Cấu trúc 3 parts Speaking + lộ trình ôn 8 tuần cho band 5.0 – 6.5",
};

export default function IeltsSpeakingPage() {
  return <SkillDetailPage skill={IELTS_SKILLS.speaking} />;
}
