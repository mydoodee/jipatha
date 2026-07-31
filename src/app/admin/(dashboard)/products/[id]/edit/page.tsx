import EditProductClient from "./EditProductClient";

export async function generateStaticParams() {
  return [{ id: "new" }];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditProductClient params={params} />;
}
