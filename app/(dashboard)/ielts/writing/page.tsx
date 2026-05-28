import { SkillDetailPage } from "@/components/ielts/skill-detail";
import { IELTS_SKILLS } from "@/lib/ielts-content";

export const metadata = {
  title: "IELTS Writing — VocaLearn",
  description: "Cấu trúc Task 1 + Task 2 + lộ trình ôn 8 tuần cho band 5.0 – 6.5",
};

export default function IeltsWritingPage() {
  return <SkillDetailPage skill={IELTS_SKILLS.writing} />;
}
