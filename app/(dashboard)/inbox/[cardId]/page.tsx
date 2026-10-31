import { Suspense } from "react";
import { MailReader } from "@/components/gmail/mail-reader";

interface MailPageProps {
  params: Promise<{ cardId: string }>;
}

export default async function MailPage({ params }: MailPageProps) {
  const { cardId } = await params;
  return (
    <Suspense fallback={null}>
      <MailReader cardId={cardId} />
    </Suspense>
  );
}
