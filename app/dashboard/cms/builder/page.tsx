import { redirect } from "next/navigation";

export default function BuilderPageRemoved() {
  redirect("/dashboard/cms");
}
