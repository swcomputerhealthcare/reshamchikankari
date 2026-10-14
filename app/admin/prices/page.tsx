import { redirect } from "next/navigation";

export default function AdminPricesRedirect() {
  redirect("/admin/products/prices");
}
