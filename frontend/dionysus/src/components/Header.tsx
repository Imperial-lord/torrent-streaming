import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold font-inter bg-gradient-primary bg-clip-text text-transparent">
            StreamVault
          </h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Home
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              Movies
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              TV Shows
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              My List
            </Button>
          </nav>
        </div>

        {/* Search & User Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search movies..."
              className="pl-10 w-64 bg-secondary/50 border-border focus:bg-secondary"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;