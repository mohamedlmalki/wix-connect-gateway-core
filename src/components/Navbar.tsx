import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, LogIn, UserPlus, Home } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          BusinessApp
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button 
              variant={isActive("/") ? "default" : "ghost"} 
              size="sm"
              className="gap-2"
            >
              <Home size={16} />
              Home
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button 
              variant={isActive("/contact") ? "default" : "ghost"} 
              size="sm"
              className="gap-2"
            >
              <Mail size={16} />
              Contact
            </Button>
          </Link>
          
          <Link to="/login">
            <Button 
              variant={isActive("/login") ? "premium" : "ghost"} 
              size="sm"
              className="gap-2"
            >
              <LogIn size={16} />
              Login
            </Button>
          </Link>
          
          <Link to="/signup">
            <Button 
              variant={isActive("/signup") ? "hero" : "outline"} 
              size="sm"
              className="gap-2"
            >
              <UserPlus size={16} />
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;