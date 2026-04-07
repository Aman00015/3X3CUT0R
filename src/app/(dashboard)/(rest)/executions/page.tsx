import { requireAuth } from "@/lib/auth-utils";

const Page = async() => {
    await requireAuth();
  return <div>executions page</div>;
};

export default Page;
