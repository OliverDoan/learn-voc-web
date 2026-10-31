import { redirect } from "next/navigation";

// Trang chủ = hộp thư từ vựng (giao diện kiểu Gmail).
export default function HomePage() {
  redirect("/inbox");
}
