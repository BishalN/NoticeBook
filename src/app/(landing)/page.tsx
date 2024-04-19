import Link from "next/link";
import { type Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LuciaAuth } from "./_components/feature-icons";
import CardSpotlight from "./_components/hover-card";
import { APP_TITLE } from "@/lib/constants";
import { ArrowDownIcon, FilePlusIcon, GroupIcon, LogInIcon, UserPlusIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "NoticeBook",
  description: `Empower your groups with instant communication. ${APP_TITLE}—the ultimate digital noticeboard solution`,
};

const userJourney = [
  {
    name: "Register",
    description: "Register with your email and password or google or discord account.",
    logo: LogInIcon,
  },
  {
    name: "Create a group",
    description: "Establish your community by naming your group, such as your tuition class group.",
    logo: GroupIcon,
  },
  {
    name: "Invite Members",
    description: "Easily invite all members of your group, ensuring seamless connectivity.",
    logo: UserPlusIcon,
  },
  {
    name: "Post Creation",
    description:
      "Craft your message and share it with the entire group. Experience the convenience of instant delivery via push notifications or web notifications to all group members.",
    logo: FilePlusIcon,
  },
];

const HomePage = () => {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-300px)] max-w-5xl flex-col  items-center justify-center gap-4 py-10 text-center  md:py-12">
        <div className="p-4">
          <h1 className="text-balance bg-gradient-to-tr  from-black/70 via-black to-black/60 bg-clip-text text-center text-3xl font-bold text-transparent dark:from-zinc-400/10 dark:via-white/90 dark:to-white/20  sm:text-5xl md:text-6xl lg:text-7xl">
            Simplify Group Communication
          </h1>
          <p className="text-balance mb-10 mt-4 text-center text-muted-foreground md:text-lg lg:text-xl">
            Create a group, invite your people, create notices, and have them delivered to your
            group members through instant notifications.
          </p>
          <div className="flex justify-center ">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="">
        <div className="container mx-auto lg:max-w-screen-lg">
          <h1 className="mb-4 text-center text-3xl font-bold md:text-4xl lg:text-5xl">
            <a id="userJourney"></a> How it works ?
          </h1>
          <p className="text-balance mb-10 text-center text-muted-foreground md:text-lg lg:text-xl">
            Login, create groups, invite members, post updates, and notify your community
            effortlessly.
          </p>

          <div className="px-4">
            {userJourney.map((feature, i) => (
              <div className="flex flex-col items-center justify-center space-y-5" key={i}>
                <CardSpotlight
                  key={i}
                  name={feature.name}
                  description={feature.description}
                  logo={<feature.logo className="h-12 w-12" />}
                />
                {i < userJourney.length - 1 && (
                  <ArrowDownIcon className="my-6 h-12 w-12 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
