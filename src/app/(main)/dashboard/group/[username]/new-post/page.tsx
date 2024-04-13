import { EditorInstance } from "novel";

export default function Page({ params }: { params: { username: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{params.username}</h1>

      <h1>This is the new post creating page</h1>
    </div>
  );
}
