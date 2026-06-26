-- Thêm cột tùy chỉnh (bảng Excel-like) ở cấp Deck
ALTER TABLE "Deck" ADD COLUMN "customColumns" TEXT NOT NULL DEFAULT '[]';
