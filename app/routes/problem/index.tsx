import type { Note } from "@prisma/client";
import { useCatch, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";

type LoaderData = {
  notes: Note[];
};

export const loader: LoaderFunction = async () => {
  const notes = await prisma.note.findMany({});
  return json({ notes });
};

export default function Problem() {
  const { notes } = useLoaderData<LoaderData>();

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          className="p flex flex-auto flex-col p-4 sm:p-6 lg:p-8"
        >
          <h2 className="text-2xl font-bold ">{note.title}</h2>
          <ul className="text-lg">
            <li>
              Created at: {Intl.DateTimeFormat("en-US").format(note.createdAt)}
            </li>
            <li>
              Updated at: {Intl.DateTimeFormat("en-US").format(note.updatedAt)}
            </li>

            <li>Body: {note.body}</li>
          </ul>
        </div>
      ))}
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div className="bg-yellow-100">
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="bg-red-100">
      <h1>My error boundary</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
