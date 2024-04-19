import Link from "next/link";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import Image from "next/image";

export const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 p-0">
      <div className="container flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link className="flex items-center justify-center text-xl font-medium" href="/">
          <Image alt="Logo" src="/logo.png" height={200} width={200} className=" h-10 w-10" />{" "}
        </Link>
        {user ? <UserDropdown email={user.email} avatar={user.avatar} className="ml-auto" /> : null}
      </div>
    </header>
  );
};
