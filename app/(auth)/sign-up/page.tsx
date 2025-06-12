import { SignUp } from "@clerk/nextjs";


export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 signup-page">
      <SignUp />
    </div>
  );
}
