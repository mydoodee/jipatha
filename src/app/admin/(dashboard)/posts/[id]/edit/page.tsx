import EditPostClient from "./EditPostClient";

export async function generateStaticParams() {
  return [{ id: "new" }];
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditPostClient params={params} />;
}
