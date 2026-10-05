import { Button } from "@/src/components/ui/button";
import { registerDeveloper } from "@/src/app/developer-registration/actions";


export default function Page() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">
        Developer Registration
      </h1>
      <form
        action={registerDeveloper}
        className="grid grid-cols-4 gap-2"
      >

        <label className="col-span-1">
          Full Name:
        </label>
        <input type="text" name="name" className="col-span-3" required />

        <label className="col-span-1">
          Email:
        </label>
        <input type="email" name="email" className="col-span-3" required />

        <label className="col-span-1">
          Password:
        </label>
        <input type="password" name="password" className="col-span-3" required />

        <div className="col-span-4 flex justify-center">
          <Button
            type="submit"
          >
            Register
          </Button>
        </div>

      </form>
    </div>
  );
}
