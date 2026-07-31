import GoRedirectClient from "./GoRedirectClient";

export async function generateStaticParams() {
  return [{ slug: "sample-product" }];
}

export default function GoPage({ params }: { params: Promise<{ slug: string }> }) {
  return <GoRedirectClient params={params} />;
}
