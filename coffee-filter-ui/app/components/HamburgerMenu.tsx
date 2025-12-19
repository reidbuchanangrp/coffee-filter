import { Menu, Info, Coffee } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { LoginDialog } from "./LoginDialog";

export function HamburgerMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-hamburger-menu">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="font-serif">CoffeeFilter</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link to="/">
              <Coffee className="h-4 w-4 mr-3" />
              Explore Map
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link to="/about">
              <Info className="h-4 w-4 mr-3" />
              About
            </Link>
          </Button>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <LoginDialog />
        </div>
      </SheetContent>
    </Sheet>
  );
}
