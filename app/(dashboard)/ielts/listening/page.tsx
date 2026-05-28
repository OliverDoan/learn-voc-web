import { SkillDetailPage } from "@/components/ielts/skill-detail";
import { IELTS_SKILLS } from "@/lib/ielts-content";

export const metadata = {
  title: "IELTS Listening — VocaLearn",
  description: "Cấu trúc bài Listening + lộ trình ôn 8 tuần cho band 5.0 – 6.5",
};

export default function IeltsListeningPage() {
  return <SkillDetailPage skill={IELTS_SKILLS.listening} />;
}
