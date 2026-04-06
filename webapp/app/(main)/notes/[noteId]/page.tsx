import Editor from "@/components/Editor";

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;

  return <Editor noteId={noteId} />;
}
