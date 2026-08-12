import { redirect } from "next/navigation";

// Trang chủ đã bỏ — vào web sẽ vào thẳng danh sách decks.
export default function HomePage() {
  redirect("/decks");
}
