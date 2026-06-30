import { redirect } from "next/navigation";

export default function PhoneAuthRedirect() {
  redirect("/auth/login");
}
