-- Bỏ tính năng kinh nghiệm (XP) và cấp độ (level)
-- AlterTable
ALTER TABLE "DailyStat" DROP COLUMN "xpEarned";

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "level",
DROP COLUMN "totalXp";
