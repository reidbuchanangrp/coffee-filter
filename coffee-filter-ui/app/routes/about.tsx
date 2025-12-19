import {
  Coffee,
  ArrowLeft,
  MapPin,
  Clock,
  Wifi,
  Accessibility,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ContactFormDialog } from "../components/ContactFormDialog";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - CoffeeFilter" },
    {
      name: "description",
      content:
        "Learn about CoffeeFilter - your guide to finding great specialty coffee shops.",
    },
  ];
}

export default function About() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-primary">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold font-serif">CoffeeFilter</h1>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
        </Button>
      </header>

      <main className="container max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Coffee className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold font-serif">
              About CoffeeFilter
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              "Friends don't let friends drink bad coffee."
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold font-serif">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              CoffeeFilter was created to help coffee lovers discover the best
              specialty coffee shops in their area. We believe everyone deserves
              access to great coffee, and finding it shouldn't be a guessing
              game.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're looking for a great espresso, an exceptional
              pour-over, or just need to know if a shop is open right now —
              CoffeeFilter has you covered.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Real Locations</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Every coffee shop is verified and mapped with accurate addresses
                and directions.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Live Hours</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                See at a glance whether a shop is open right now with real-time
                status indicators.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Trusted Sources</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We only include coffee shops that have been verified by our team
                of coffee enthusiasts and uphold our high standards for quality.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Accessibility className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Accessibility</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We include accessibility information so everyone can find a
                welcoming space.
              </p>
            </Card>
          </div>

          <Card
            className="p-6 space-y-4 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setIsContactOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold font-serif">
                Know a great coffee shop?
              </h2>
            </div>
            <p className="text-muted-foreground">
              We're always looking to add more amazing coffee shops to our map.
              If you know of a specialty coffee shop that should be featured, or
              just want to say hey, let us know!
            </p>
          </Card>

          <ContactFormDialog
            open={isContactOpen}
            onOpenChange={setIsContactOpen}
          />

          <div className="text-center pt-4">
            <Button asChild size="lg">
              <Link to="/">
                <Coffee className="h-4 w-4 mr-2" />
                Explore Coffee Shops
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
