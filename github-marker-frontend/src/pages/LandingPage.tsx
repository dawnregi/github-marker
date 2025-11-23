import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BookmarkIcon, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Git Marker - Bookmark & Organize GitHub Repositories</title>
        <meta
          name="description"
          content="Discover, bookmark, and organize your favorite GitHub repositories. Search, track, and manage your code collections with ease. The ultimate tool for developers."
        />
        <meta
          name="keywords"
          content="github, bookmarks, repositories, git, code management, developer tools, github search, repository organizer"
        />
        <link rel="canonical" href="https://gitmarker.com/" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkIcon className="h-8 w-8" aria-hidden="true" />
                <h1 className="text-2xl font-bold">Git Marker</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: "/auth/login" })}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate({ to: "/auth/register" })}
                  aria-label="Create a new account"
                >
                  Join Us
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          className="container mx-auto px-4 py-20 md:py-32"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                Your GitHub Organization Hub
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            >
              Organize Your
              <span className="text-primary block mt-2">GitHub Universe</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              Discover, bookmark, and track your favorite repositories. Never
              lose track of great projects again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Button
                size="lg"
                onClick={() => navigate({ to: "/auth/register" })}
                className="text-lg px-8 py-6 group"
                aria-label="Start using Git Marker for free"
              >
                Get Started
                <ArrowRight
                  className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
