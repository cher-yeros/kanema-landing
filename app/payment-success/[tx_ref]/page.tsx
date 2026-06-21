import { PaymentSuccessClient } from "./payment-success-client";

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ tx_ref: string }>;
}) {
  const { tx_ref } = await params;
  return <PaymentSuccessClient txRef={decodeURIComponent(tx_ref)} />;
}
