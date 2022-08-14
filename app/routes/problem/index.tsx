import type { LoaderArgs } from "@remix-run/server-runtime";
import format from "date-fns/format";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { prisma } from "~/db.server";

/*
import type { Note } from "@prisma/client";

type LoaderData = {
  notes: Note[];
};

export const loader: LoaderFunction = async () => {
  const notes = await prisma.note.findMany({});
  return { notes };
};
*/

export const loader = async (args: LoaderArgs) => {
  const notes = await prisma.note.findMany({});
  return typedjson({ notes });
};

export default function Problem() {
  /* const { notes } = useLoaderData<LoaderData>(); */
  /* const { notes } = useLoaderData<typeof loader>(); */
  const { notes } = useTypedLoaderData<typeof loader>();

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          className="p flex flex-auto flex-col p-4 sm:p-6 lg:p-8"
        >
          <h2 className="text-2xl font-bold ">{note.title}</h2>
          <ul className="text-lg">
            <li>Created at: {format(note.createdAt, "yyyy-MM-dd")}</li>
            <li>Updated at: {format(note.updatedAt, "yyyy-MM-dd")}</li>
            {/* stupid solution */}
            {/* <li> */}
            {/*   Created at: {format(new Date(note.createdAt), "yyyy-MM-dd")} */}
            {/* </li> */}
            {/* <li> */}
            {/*   Updated at: {format(new Date(note.updatedAt), "yyyy-MM-dd")} */}
            {/* </li> */}
            <li>Body: {note.body}</li>
          </ul>
        </div>
      ))}
    </>
  );
}
