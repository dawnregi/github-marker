import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { BookmarkIcon, Search } from "lucide-react";
import { NavUser } from "./nav-user";

export default function Header() {


  return (
    <header className="w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/app/dashboard">
         <div className="flex items-center gap-2">
                <BookmarkIcon className="h-8 w-8" aria-hidden="true" />
                <h1 className="text-2xl font-bold">Git Marker</h1>
              </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link 
            to="/app/search"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <NavUser />
          <ModeToggle />
          
        </nav>
      </div>
    </header>
  );
}
